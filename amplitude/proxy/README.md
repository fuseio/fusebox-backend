# Amplitude - Proxy

 Amplitude analytics used to send analytics events.

 By the documentation https://www.docs.developers.amplitude.com/analytics/domain-proxy/ was configured Nginx reverse proxy for one of the endpoint. Endpoint provided [here](https://analytics.fuse.io/amplitude).

 There is a Helm chart to deploy reverse proxy for Amplitude, located in `k8s/helm/charts/amplitude` folder.

 Used SDK's:

 | Name | Endpoint |
 | ---- | -------- |
 | [Amplitude-Node](https://www.docs.developers.amplitude.com/data/sdks/node/) | https://api2.amplitude.com/2/httpapi |
