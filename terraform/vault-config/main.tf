terraform {
  required_version = ">= 1.5"

  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.4"
    }
  }
}

# Applied over `kubectl port-forward -n vault svc/vault 8200:8200`.
# The dev-mode root token is fixed in terraform/platform; a real setup
# would authenticate with a short-lived token from `vault login`.
provider "vault" {
  address = "http://127.0.0.1:8200"
  token   = "root"
}

resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}

resource "vault_kubernetes_auth_backend_config" "this" {
  backend         = vault_auth_backend.kubernetes.path
  kubernetes_host = "https://kubernetes.default.svc:443"
}

# Read-only access to everything under secret/ (KV v2 data paths).
resource "vault_policy" "external_secrets_read" {
  name = "external-secrets-read"

  policy = <<-EOT
    path "secret/data/*" {
      capabilities = ["read"]
    }
    path "secret/metadata/*" {
      capabilities = ["read", "list"]
    }
  EOT
}

# Lets the External Secrets Operator service account log in and read secrets.
resource "vault_kubernetes_auth_backend_role" "external_secrets" {
  backend                          = vault_auth_backend.kubernetes.path
  role_name                        = "external-secrets"
  bound_service_account_names      = ["external-secrets"]
  bound_service_account_namespaces = ["external-secrets"]
  token_policies                   = [vault_policy.external_secrets_read.name]
  token_ttl                        = 3600
}
