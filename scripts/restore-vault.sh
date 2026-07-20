#!/usr/bin/env bash
# Restore dev-mode Vault after a restart.
#
# Dev-mode Vault keeps everything in memory, so a WSL/k3s restart wipes the
# kubernetes auth config and all seeded secrets. The cluster keeps running
# because External Secrets leaves the last-synced k8s Secrets in place —
# this script copies those back into Vault and re-applies the auth config.
#
# Needs: the pf-vault port-forward active, kubectl, terraform, python3.
set -euo pipefail

VAULT_ADDR=${VAULT_ADDR:-http://localhost:8200}
VAULT_TOKEN=${VAULT_TOKEN:-root}
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Re-applying terraform/vault-config (k8s auth, policy, role)"
terraform -chdir="$REPO_ROOT/terraform/vault-config" apply -auto-approve

echo "==> Re-seeding secret/postgres from the cluster's last-synced secret"
kubectl get secret postgres-credentials -n default -o json | python3 -c '
import base64, json, sys
data = json.load(sys.stdin)["data"]
print(json.dumps({"data": {k: base64.b64decode(v).decode() for k, v in data.items()}}))
' | curl -sf -H "X-Vault-Token: $VAULT_TOKEN" -X POST \
      "$VAULT_ADDR/v1/secret/data/postgres" -d @- -o /dev/null

echo "==> Re-seeding secret/ghcr from the cluster's last-synced secret"
kubectl get secret ghcr-pull-secret -n default -o json | python3 -c '
import base64, json, sys
data = json.load(sys.stdin)["data"]
print(json.dumps({"data": {"dockerconfigjson": base64.b64decode(data[".dockerconfigjson"]).decode()}}))
' | curl -sf -H "X-Vault-Token: $VAULT_TOKEN" -X POST \
      "$VAULT_ADDR/v1/secret/data/ghcr" -d @- -o /dev/null

echo "==> Done. ExternalSecrets refresh within ~1 minute."
