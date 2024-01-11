# Helm Chart

 Here provided the sample commands how to install this Helm chart.


## Installing the Chart

 To install the chart with the release name `my-release`:

 ```bash
 helm install --namespace [namespace] --values [values_file] my-release .
 ```

## Uninstalling the Chart

 To uninstall/delete the `my-release` deployment:

 ```bash
 helm delete my-release
 ```


## Configuration

 Configuration for each Helm sub - chart provided in `charts/{component_name}` folder.
