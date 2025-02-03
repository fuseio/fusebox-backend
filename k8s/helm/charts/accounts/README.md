# accounts

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for Kubernetes related accounts component

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{"zones":["a"]}` | Affinity (available region zones) |
| autoscaling.hpa | object | `{"max_replicas":5}` | Horizontal Pod Autoscaler |
| autoscaling.hpa.max_replicas | int | `5` | Horizontal Pod Autoscaler - Maximum number of replicas, minimal number is `replicas` value |
| configMap.auth0_audience | string | `""` | Auth0 audience |
| configMap.auth0_issuer_url | string | `""` | Auth0 issuer URL |
| configMap.console_dapp_url | string | `""` | Console Dapp URL |
| configMap.entrypoint_production_contract_address_v_0_1_0 | string | `""` | Bundler - Entrypoint Production contract address |
| configMap.entrypoint_sandbox_contract_address_v_0_1_0 | string | `""` | Bundler - Entrypoint Sandbox contract address |
| configMap.etherspot_wallet_factory_production_contract_address_v_0_1_0 | string | `""` | Etherspot Wallet Factory Production contract address |
| configMap.etherspot_wallet_factory_sandbox_contract_address_v_0_1_0 | string | `""` | Etherspot Wallet Factory Sandbox contract address |
| configMap.paymaster_funder_api_key | string | `""` | Paymaster Funder API key |
| configMap.paymaster_funder_webhook_id | string | `""` | Paymaster Funder Webhook ID |
| configMap.paymaster_production_contract_address_v_0_1_0 | string | `""` | Bundler - Paymaster Production contract address |
| configMap.paymaster_sandbox_contract_address_v_0_1_0 | string | `""` | Bundler - Paymaster Sandbox contract address |
| configMap.usdc_contract_address_mainnet | string | `""` | USDC contract address - Mainnet |
| configMap.usdc_contract_address_testnet | string | `""` | USDC contract address - Testnet |
| global.clusterSecretStore | string | `"gcp-store"` | ClusterSecretStore name (should be created before apply) |
| global.domain | string | `"example.com"` | DNS domain (used for `HTTPRoute` resource) |
| global.environment | string | `"development"` | Kubernetes label `environment`` |
| global.image.repository | string | `"accounts"` | Repository ID |
| global.image.tag | string | `"latest"` | Tag; overrides the image tag whose default is the chart appVersion. |
| global.project_id | string | `"example-12345"` | Google Cloud - Project ID (used for `Deployment` resource, `container.image` section) |
| global.region | string | `"us-central1"` | Google Cloud - Region (used for `Deployment` resource, `container.image` section) |
| logging | object | `{"enabled":true,"sampleRate":1000000}` | Logging - enabled (`true` or `false`), sampleRate (from 0 to 500000 / 1000000) |
| maxRatePerEndpoint | int | `10` | Service - Annotations - RPS per pod |
| replicas | int | `1` | Replicas |
| resources.limits | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Limits |
| resources.requests | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Requests |
| secret | list | `["mongo_uri","smart_wallets_jwt_secret","paymaster_funder_private_key","paymaster_funder_api_secret_key","amplitude_api_key","incoming_token_transfers_webhook_id","google_operator_form_url","operator_refresh_jwt_secret"]` | Secret (external; sensitive information; pulled from Google Cloud, Secret Manager) |
| securityPolicy | string | `nil` | Security policy name (Cloud Armor) |

