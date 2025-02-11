# network

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for Kubernetes related network component

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{"zones":["a"]}` | Affinity (available region zones) |
| autoscaling.vpa | object | `{"max_allowed":{"cpu":"4000m","memory":"8Gi"}}` | Vertical Pod Autoscaler |
| autoscaling.vpa.max_allowed | object | `{"cpu":"4000m","memory":"8Gi"}` | Vertical Pod Autoscaler - Maximum number of CPU & Memory, minimal number is `resources.requests` values |
| configMap.coin_gecko_url | string | `""` | CoinGecko URL |
| configMap.explorer_api_url | string | `""` | BlockScout API URL |
| configMap.primary_service | string | `""` | Primary Service |
| configMap.unmarshal_base_url | string | `""` | Unmarshal - Base URL |
| global.clusterSecretStore | string | `"gcp-store"` | ClusterSecretStore name (should be created before apply) |
| global.domain | string | `"example.com"` | DNS domain (used for `HTTPRoute` resource) |
| global.environment | string | `"development"` | Kubernetes label `environment`` |
| global.image.repository | string | `"accounts"` | Repository ID |
| global.image.tag | string | `"latest"` | Tag; overrides the image tag whose default is the chart appVersion. |
| global.project_id | string | `"example-12345"` | Google Cloud - Project ID (used for `Deployment` resource, `container.image` section) |
| global.region | string | `"us-central1"` | Google Cloud - Region (used for `Deployment` resource, `container.image` section) |
| replicas | int | `1` | Replicas |
| resources.limits | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Limits |
| resources.requests | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Requests |
| secret | list | `["rpc_url","unmarshal_auth_key","explorer_api_key","coin_gecko_api_key"]` | Secret (external; sensitive information; pulled from Google Cloud, Secret Manager) |

