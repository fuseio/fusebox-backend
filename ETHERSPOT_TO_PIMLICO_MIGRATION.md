# Etherspot to Pimlico Migration Plan

## Context

Etherspot is the default ERC-4337 bundler (Pimlico is secondary via `?provider=pimlico`). The Etherspot wallet factory's only usage (`predictWallet()`) is dead code - never called. Wallet creation has moved client-side (SAFE SDK). Goal: remove all Etherspot references, make Pimlico the sole bundler. Keep FuseVerifyingPaymaster as-is.

**Existing AA wallets are unaffected.** The bundler is transport-only - wallets interact with the shared EntryPoint (`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` v0.6), not the bundler. No on-chain changes needed.

---

## Pre-Flight Checks

Before any code changes, confirm externally:

- [ ] Pimlico supports **Fuse mainnet (chain 122)** and **Fuse Spark testnet (chain 123)**
- [ ] Pimlico supports **EntryPoint v0.6** (`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`)
- [ ] Pimlico `eth_estimateUserOperationGas` returns the same gas fields (`callGasLimit`, `verificationGasLimit`, `preVerificationGas`)
- [ ] Clarify ERC-4337 version: the interceptor has v0.7 patterns for Pimlico (separate `paymaster` + `paymasterData` fields). Confirm if the Pimlico endpoint is v0.6 or v0.7

---

## Why Existing Wallets Are Safe

```
Client SDK -> Bundler (transport) -> EntryPoint (on-chain) -> Wallet (on-chain)
```

| Component | Etherspot-Dependent? | Why |
| --- | --- | --- |
| **Deployed wallet contract** | No | Standard ERC-4337 account. Factory is only used at deploy time, never called again |
| **EntryPoint** | No | Shared contract `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` (v0.6). Same for all bundlers |
| **FuseVerifyingPaymaster** | No | Validates signatures and sponsor IDs. Bundler-agnostic |
| **UserOperation format** | No | Standard ERC-4337 struct. Same fields regardless of bundler |
| **Wallet factory** | Only at creation | `predictWallet()` is dead code. No new wallets are created via Etherspot factory |

The `migrateOperatorWallet` endpoint is a **database-only** change (renames `smartWalletAddress` to `etherspotSmartWalletAddress`, stores new SAFE address). Nothing happens on-chain.

---

## Critical Risks

| Risk | Severity | Details |
| --- | --- | --- |
| **Paymaster gas estimation hardcoded to Etherspot** | **Critical** | `paymaster-api.service.ts:214` - breaks immediately if Etherspot URL is removed |
| **EntryPoint version mismatch** | **High** | System uses v0.6. Pimlico branch in interceptor has v0.7 patterns. Must confirm compatibility |
| **Clients passing `?provider=etherspot`** | **High** | Config lookup `bundler.etherspot.*` will crash. Need explicit 400 error |
| **Sponsored quota logic change** | **Medium** | Quota check currently bypasses Etherspot. With Pimlico-only, quota always applies |
| **DB field `etherspotSmartWalletAddress`** | **Low** | Historical data in MongoDB. Leave as-is |

---

## Complete Etherspot Reference Inventory

### Application Code (8 files)

| File | Lines | What |
| --- | --- | --- |
| `apps/charge-api-service/src/bundler-api/interfaces/bundler.interface.ts` | 1-4 | `BundlerProvider.ETHERSPOT` enum |
| `apps/charge-api-service/src/bundler-api/config/configuration.ts` | 3-10 | `bundler.etherspot` config block |
| `apps/charge-api-service/src/bundler-api/bundler-api.interceptor.ts` | 110, 138, 146 | Default provider, Pimlico branching |
| `apps/charge-api-service/src/paymaster-api/paymaster-api.service.ts` | 214 | Hardcoded `bundler.etherspot.${env}` |
| `apps/charge-accounts-service/src/operators/operators.service.ts` | 9, 225, 231, 259, 287-299, 1012-1013 | Factory ABI import, wallet migration refs, `predictWallet()`, quota logic |
| `apps/charge-accounts-service/src/operators/operators.controller.ts` | 96, 102 | Swagger docs mention "Etherspot" |
| `apps/charge-accounts-service/src/common/config/configuration.ts` | 11-12, 19-20 | `etherspotWalletFactoryContractAddress` |
| `apps/charge-accounts-service/src/operators/abi/EtherspotWalletFactory.abi.json` | all | Entire ABI file (delete) |

### Schema / Interfaces (3 files - leave as-is, historical DB data)

| File | Line | Field |
| --- | --- | --- |
| `operators/schemas/operator-wallet.schema.ts` | 12 | `etherspotSmartWalletAddress` |
| `operators/interfaces/operator-wallet.interface.ts` | 7 | `etherspotSmartWalletAddress` |
| `operators/interfaces/operator-user-interface.ts` | 9 | `etherspotSmartWalletAddress` |

### Environment / Docker (3 files)

| File | Lines | What |
| --- | --- | --- |
| `.env.example` | 12-13, 36-37 | `ETHERSPOT_WALLET_FACTORY_*`, `BUNDLER_API_*_URL` (etherspot URLs) |
| `docker-compose.yml` | 111, 114, 175, 178, 236, 239 | `ETHERSPOT_WALLET_FACTORY_*` env vars |
| `docker-compose.yml` | 307-308, 361-362, 412-413 | `BUNDLER_API_PRD_URL` / `BUNDLER_API_SANDBOX_URL` |

### Helm / K8s (8 files)

| File | What |
| --- | --- |
| `helm/values/prod.yaml` | Etherspot factory addresses (134-135), bundler sandbox URL (281) |
| `helm/values/qa.yaml` | Same (134-135, 281) |
| `k8s/helm/production.yaml` | Factory addresses (61-62), bundler URLs (141), Skandha config (343-356) |
| `k8s/helm/staging.yaml` | Factory addresses (61-62), bundler URLs (140), Skandha disabled (343-353) |
| `k8s/helm/charts/skandha/` | Entire directory (Chart, templates, values, README) |
| `k8s/helm/charts/accounts/values.yaml` | `etherspot_wallet_factory_*` (81-84) |
| `k8s/helm/charts/accounts/README.md` | Docs for factory addresses (21-22) |
| `k8s/helm/Chart.yaml` | Skandha dependency (46-47) |

---

## Implementation Steps

### Phase 1: Application Code

#### Step 1 - Simplify BundlerProvider enum

**File:** `apps/charge-api-service/src/bundler-api/interfaces/bundler.interface.ts`

- Remove `ETHERSPOT` value, keep only `PIMLICO`

#### Step 2 - Flatten bundler config

**File:** `apps/charge-api-service/src/bundler-api/config/configuration.ts`

- Remove nested `etherspot` / `pimlico` structure
- Flatten to: `bundler.production.url` / `bundler.sandbox.url`
- Use env vars `PIMLICO_API_PRD_URL` / `PIMLICO_API_SANDBOX_URL`

#### Step 3 - Clean up bundler interceptor

**File:** `apps/charge-api-service/src/bundler-api/bundler-api.interceptor.ts`

- Remove `?provider=` query param routing. If `?provider=etherspot` passed, return 400 error
- `prepareUrl()`: use flat config `bundler.${environment}.url`
- `constructUserOp()`: remove Etherspot/Pimlico branching, keep Pimlico format as the only format

#### Step 4 - Fix paymaster gas estimation URL (CRITICAL)

**File:** `apps/charge-api-service/src/paymaster-api/paymaster-api.service.ts`

- Line 214: `bundler.etherspot.${environment}` -> `bundler.${environment}`

#### Step 5 - Clean up operators service

**File:** `apps/charge-accounts-service/src/operators/operators.service.ts`

- Remove `import etherspotWalletFactoryAbi` (line 9)
- Delete `predictWallet()` method (lines 287-299) - dead code, never called
- Line 1012: Default `BundlerProvider.ETHERSPOT` -> `BundlerProvider.PIMLICO`
- Lines 1013-1015: Remove Etherspot bypass in quota check (quota now always applies)

#### Step 6 - Update controller docs

**File:** `apps/charge-accounts-service/src/operators/operators.controller.ts`

- Lines 96, 102: Update Swagger descriptions from "Etherspot" to "legacy"

#### Step 7 - Remove Etherspot wallet factory config + ABI

- `apps/charge-accounts-service/src/common/config/configuration.ts` -> remove `etherspotWalletFactoryContractAddress`
- Delete `apps/charge-accounts-service/src/operators/abi/EtherspotWalletFactory.abi.json`

#### Step 8 - DB fields (NO CHANGES)

- `etherspotSmartWalletAddress` stays in schema, interface, and service
- Existing MongoDB documents have this field name - changing it requires a data migration
- The migration endpoint (`migrateOperatorWallet`) still writes to this field for any future migrations

### Phase 2: Environment and Infrastructure

#### Step 9 - `.env.example`

- Remove `ETHERSPOT_WALLET_FACTORY_*` vars
- Remove `BUNDLER_API_PRD_URL` / `BUNDLER_API_SANDBOX_URL` (Etherspot URLs)
- Keep `PIMLICO_API_PRD_URL` / `PIMLICO_API_SANDBOX_URL`

#### Step 10 - `docker-compose.yml`

- Remove `ETHERSPOT_WALLET_FACTORY_*` env vars (6 occurrences)
- Update `BUNDLER_API_*` to point to Pimlico or remove if using `PIMLICO_API_*` vars

#### Step 11 - Helm values

- `helm/values/prod.yaml` - remove factory addresses, update bundler URLs
- `helm/values/qa.yaml` - same

#### Step 12 - K8s configs

- `k8s/helm/production.yaml` - remove factory addresses, update bundler URLs, remove Skandha section
- `k8s/helm/staging.yaml` - same

#### Step 13 - Remove Skandha

- Delete `k8s/helm/charts/skandha/` directory
- Remove Skandha dependency from `k8s/helm/Chart.yaml` (line 46-47)

#### Step 14 - Accounts helm chart

- `k8s/helm/charts/accounts/values.yaml` - remove `etherspot_wallet_factory_*`
- `k8s/helm/charts/accounts/README.md` - remove corresponding docs

---

## Verification

1. `npm run build` - clean compilation
2. `npm run lint` - passes
3. `grep -ri "etherspot" --include="*.ts" apps/` - only hits: `etherspotSmartWalletAddress` in schema/interface/service (historical DB field)
4. `grep -ri "skandha" k8s/` - zero results
5. Manual: Bundler API routes to Pimlico for both environments
6. Manual: Paymaster `eth_estimateUserOperationGas` hits Pimlico URL
7. Manual: `?provider=etherspot` returns 400 error
