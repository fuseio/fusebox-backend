# apps

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for Kubernetes related apps component

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{"zones":["a"]}` | Affinity (available region zones) |
| autoscaling.hpa | object | `{"max_replicas":5}` | Horizontal Pod Autoscaler |
| autoscaling.hpa.max_replicas | int | `5` | Horizontal Pod Autoscaler - Maximum number of replicas, minimal number is `replicas` value |
| configMap.alchemy_base_url | string | `""` | Alchemy - Base URL |
| configMap.charge_base_url | string | `""` | Charge - Base URL |
| configMap.charge_wallet_phone_number | string | `""` | Charge - Wallet phone number |
| configMap.ethereum_payments_network_name | string | `""` | Ethereum - Payments network name |
| configMap.job_sleep_ms | string | `""` | Job sleep (ms) |
| configMap.unmarshal_base_url | string | `""` | Unmarshal - Base URL |
| global.clusterSecretStore | string | `"gcp-store"` | ClusterSecretStore name (should be created before apply) |
| global.domain | string | `"example.com"` | DNS domain (used for `HTTPRoute` resource) |
| global.environment | string | `"development"` | Kubernetes label `environment`` |
| global.image.repository | string | `"api"` | Repository ID |
| global.image.tag | string | `"latest"` | Tag; overrides the image tag whose default is the chart appVersion. |
| global.project_id | string | `"example-12345"` | Google Cloud - Project ID (used for `Deployment` resource, `container.image` section) |
| global.region | string | `"us-central1"` | Google Cloud - Region (used for `Deployment` resource, `container.image` section) |
| logging | object | `{"enabled":true,"sampleRate":1000000}` | Logging - enabled (`true` or `false`), sampleRate (from 0 to 500000 / 1000000) |
| maxRatePerEndpoint | int | `10` | Service - Annotations - RPS per pod |
| replicas | int | `1` | Replicas |
| resources.limits | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Limits |
| resources.requests | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Requests |
| secret | list | `["mongo_uri","charge_public_key","charge_secret_key","charge_webhook_id","unmarshal_auth_key","charge_payments_ethereum_mnemonic","alchemy_webhook_id","alchemy_auth_key","charge_payment_links_webhook_id"]` | Secret (external; sensitive information; pulled from Google Cloud, Secret Manager) |
| securityPolicy | string | `nil` | Security policy name (Cloud Armor) |

