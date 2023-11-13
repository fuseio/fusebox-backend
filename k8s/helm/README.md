# Helm Chart

* How to install manually [fusebox-backend](https://github.com/fuseio/fusebox-management-devops/blob/main/docs/Installation.md) application.


## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install --namespace [namespace] --values [values_file] my-release .
```

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```


## Configuration

 Configuration for each Helm sub - chart provided in `charts/{component_name}` folder.
