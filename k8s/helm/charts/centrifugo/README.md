# centrifugo

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for Kubernetes related centrifugo component

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{"zones":["a"]}` | Affinity (available region zones) |
| autoscaling.hpa | object | `{"max_replicas":5}` | Horizontal Pod Autoscaler |
| autoscaling.hpa.max_replicas | int | `5` | Horizontal Pod Autoscaler - Maximum number of replicas, minimal number is `replicas` value |
| global.clusterSecretStore | string | `"gcp-store"` | ClusterSecretStore name (should be created before apply) |
| global.domain | string | `"example.com"` | DNS domain (used for `HTTPRoute` resource) |
| global.environment | string | `"development"` | Kubernetes label `environment`` |
| global.image.repository | string | `"centrifugo/centrifugo"` | Repository ID |
| global.image.tag | string | `"v5.4.4"` | Tag; overrides the image tag whose default is the chart appVersion. |
| global.project_id | string | `"example-12345"` | Google Cloud - Project ID (used for `Deployment` resource, `container.image` section) |
| global.region | string | `"us-central1"` | Google Cloud - Region (used for `Deployment` resource, `container.image` section) |
| logging | object | `{"enabled":true,"sampleRate":1000000}` | Logging - enabled (`true` or `false`), sampleRate (from 0 to 500000 / 1000000) |
| maxRatePerEndpoint | int | `10` | Service - Annotations - RPS per pod |
| replicas | int | `1` | Replicas |
| resources.limits | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Limits |
| resources.requests | object | `{"cpu":"500m","memory":"1Gi"}` | Resources - Requests |
| securityPolicy | string | `nil` | Security policy name (Cloud Armor) |

