# api

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for Kubernetes related api component

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{"zones":["a"]}` | Affinity (available region zones) |
| autoscaling.hpa | object | `{"max_replicas":5}` | Horizontal Pod Autoscaler |
| autoscaling.hpa.max_replicas | int | `5` | Horizontal Pod Autoscaler - Maximum number of replicas, minimal number is `replicas` value |
| configMap.bundler_api_sandbox_url | string | `""` | Bundler - API Sandbox URL |
| configMap.explorer_api_url | string | `""` | BlockScout API URL |
| configMap.legacy_fuse_admin_api_url | string | `""` | Legacy - Fuse admin API URL |
| configMap.legacy_fuse_wallet_api_url | string | `""` | Legacy - Fuse wallet API URL |
| configMap.qa_mode | string | `""` | QA mode ('true' or 'false') |
| configMap.spark_rpc_url | string | `""` | RPC URL - Spark |
| configMap.voltage_router_api_url | string | `""` | Voltage router API URL |
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
| secret | list | `["mongo_uri","rpc_url","fuse_studio_admin_jwt","legacy_jwt_secret","smart_wallets_jwt_secret","paymaster_production_signer_private_key_v_0_1_0","paymaster_sandbox_signer_private_key_v_0_1_0","explorer_api_key","bundler_api_prd_url","pimlico_api_prd_url","pimlico_api_sandbox_url","amplitude_api_key"]` | Secret (external; sensitive information; pulled from Google Cloud, Secret Manager) |
| securityPolicy | string | `nil` | Security policy name (Cloud Armor) |

