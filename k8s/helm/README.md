# charge-backend - Helm Chart

* How to install manually [charge-backend](https://github.com/fuseio/fusebox-management-devops/blob/main/docs/Installation.md) application


## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm \
    install \
    --namespace [namespace] \
    --values [values_file] \
    --set accounts.secrets.mongo_uri=$ACCOUNTS_MONGO_URI \
    --set api.secrets.mongo_uri=$API_MONGO_URI \
    --set api.secrets.legacy_jwt_secret=$API_LEGACY_JWT_SECRET \
    --set api.secrets.fuse_studio_admin_jwt=$API_FUSE_STUDIO_ADMIN_JWT \
    --set api.secrets.paymaster_production_signer_private_key_v_0_1_0=$API_PAYMASTER_PRODUCTION_SIGNER_PRIVATE_KEY_V_0_1_0 \
    --set api.secrets.paymaster_sandbox_signer_private_key_v_0_1_0=$API_PAYMASTER_SANDBOX_SIGNER_PRIVATE_KEY_V_0_1_0 \
    --set api.secrets.rpc_url=$API_RPC_URL \
    --set api.secrets.smart_wallets_jwt_secret=$API_SMART_WALLETS_JWT_SECRET \
    --set apps.secrets.alchemy_auth_key=$APPS_ALCHEMY_AUTH_KEY \
    --set apps.secrets.alchemy_webhook_id=$APPS_ALCHEMY_WEBHOOK_ID \
    --set apps.secrets.charge_payments_ethereum_mnemonic="$APPS_CHARGE_PAYMENTS_ETHEREUM_MNEMONIC" \
    --set apps.secrets.charge_public_key=$APPS_CHARGE_PUBLIC_KEY \
    --set apps.secrets.charge_secret_key=$APPS_CHARGE_SECRET_KEY \
    --set apps.secrets.charge_webhook_id=$APPS_CHARGE_WEBHOOK_ID \
    --set apps.secrets.mongo_uri=$APPS_MONGO_URI \
    --set apps.secrets.unmarshal_auth_key=$APPS_UNMARSHAL_AUTH_KEY \
    --set notifications.secrets.full_archive_rpc_url=$NOTIFICATIONS_FULL_ARCHIVE_RPC_URL \
    --set notifications.secrets.mongo_uri=$NOTIFICATIONS_MONGO_URI \
    --set notifications.secrets.rpc_url=$NOTIFICATIONS_RPC_URL \
    --set notifications.secrets.smart_wallets_jwt_secret=$NOTIFICATIONS_SMART_WALLETS_JWT_SECRET \
    --set relay.secrets.mongo_uri=$RELAY_MONGO_URI \
    --set relay.secrets.relay_secret=$RELAY_RELAY_SECRET \
    --set smart-wallets.secrets.centrifugo_api_key=$SMART_WALLETS_CENTRIFUGO_API_KEY \
    --set smart-wallets.secrets.centrifugo_jwt=$SMART_WALLETS_CENTRIFUGO_JWT \
    --set smart-wallets.secrets.fuse_wallet_backend_jwt=$SMART_WALLETS_FUSE_WALLET_BACKEND_JWT \
    --set smart-wallets.secrets.mongo_uri=$SMART_WALLETS_MONGO_URI \
    --set smart-wallets.secrets.smart_wallets_jwt_secret=$SMART_WALLETS_SMART_WALLETS_JWT_SECRET \
    my-release .
```


## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```


## Configuration

 Configuration for each Helm sub - chart provided in `charts/{component_name}` folder.
