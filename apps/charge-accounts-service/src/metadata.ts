/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./users/dto/create-user.dto"), { "CreateUserDto": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, auth0Id: { required: true, type: () => String } } }], [import("./users/dto/submit-questionnaire.dto"), { "SubmitQuestionnaireDto": { questionnaire: { required: true, type: () => Object } } }], [import("./projects/dto/create-project.dto"), { "CreateProjectDto": { ownerId: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./projects/dto/update-project.dto"), { "UpdateProjectDto": {} }], [import("../../charge-apps-service/src/api-keys/dto/api-keys.dto"), { "ApiKeysDto": { ownerId: { required: true, type: () => String }, appName: { required: true, type: () => String } } }], [import("../../charge-apps-service/src/payments/dto/create-payment-link.dto"), { "CreatePaymentLinkDto": { ownerId: { required: true, type: () => String }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, amount: { required: true, type: () => String }, tokenAddress: { required: true, type: () => String }, tokenSymbol: { required: true, type: () => String }, backendWalletId: { required: true, type: () => String }, redirectUrl: { required: true, type: () => String }, webhookUrl: { required: true, type: () => String } } }], [import("../../charge-apps-service/src/payments/dto/transfer-tokens.dto"), { "TransferTokensDto": { ownerId: { required: true, type: () => String }, tokenAddress: { required: true, type: () => String }, from: { required: true, type: () => String }, to: { required: true, type: () => String }, amount: { required: true, type: () => String } } }], [import("./operators/dto/create-operator-user.dto"), { "CreateOperatorUserDto": { firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, email: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./operators/dto/auth-operator.dto"), { "AuthOperatorDto": { externallyOwnedAccountAddress: { required: true, type: () => String }, message: { required: true, type: () => String }, signature: { required: true, type: () => String } } }], [import("../../charge-notifications-service/src/webhooks/dto/create-webhook-addresses.dto"), { "CreateWebhookAddressesDto": { webhookId: { required: true, type: () => String }, addresses: { required: true, type: () => [String] } } }], [import("./operators/entities/auth-operator.entity"), { "AuthOperator": { externallyOwnedAccountAddress: { required: true, type: () => String }, message: { required: true, type: () => String }, signature: { required: true, type: () => String } } }], [import("./operators/entities/create-operator-user.entity"), { "CreateOperatorUser": { firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, email: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./operators/dto/create-operator-wallet.dto"), { "CreateOperatorWalletDto": { ownerId: { required: true, type: () => String }, smartWalletAddress: { required: true, type: () => String }, isActivated: { required: true, type: () => Boolean } } }], [import("./operators/entities/create-operator-wallet.entity"), { "CreateOperatorWallet": { ownerId: { required: true, type: () => String }, smartWalletAddress: { required: true, type: () => String }, isActivated: { required: true, type: () => Boolean } } }]], "controllers": [[import("./accounts.controller"), { "AccountsController": { "healthCheck": { type: String } } }], [import("./users/users.controller"), { "UsersController": { "submitQuestionnaire": { description: "Submits questionnaire answers for the given user id and verifies that the authenticated\nuser has the given user id", type: Object }, "findOneInternal": { type: Object } } }], [import("./auth/auth.controller"), { "AuthController": { "create": { description: "Registers a new user for the authenticated user", type: Object }, "findOne": {} } }], [import("./projects/projects.controller"), { "ProjectsController": { "create": { description: "Creates a new project for the authenticated user", type: Object }, "findAll": { description: "Finds all the projects of the authenticated user", type: [Object] }, "findOne": { description: "Fetches the project by the given id and verifies that the requesting\nauthenticated user is the owner of the project", type: Object }, "getProjectBySponsorId": { type: [Object] }, "update": { description: "Updates the project with the given id with the given fields for the update\nand verifies that the requesting authenticated user is the owner of the project", type: Object }, "createSecret": { description: "Creates an API key secret for the given project", type: Object }, "checkIfSecretExists": { description: "Checks if an API key secret for the given project exists", type: Boolean }, "getApiKeysInfo": { description: "Gets api keys unsensitive info for the given projectId", type: Object }, "updateSecret": { description: "Revokes the old API key secret and generates a new one for the given project", type: Object }, "getPublic": { description: "Gets the public API key associated with the project", type: Object }, "createSandboxKey": { description: "Creates an sandbox API key for the given project", type: Object }, "getSandboxKey": { description: "Gets the sandbox API key associated with the project", type: Object }, "findOneInternal": { type: Object }, "findOneByIdInternal": { type: Object }, "getPublicInternal": { type: Object } } }], [import("./paymaster/paymaster.controller"), { "PaymasterController": { "getAvailableVersionList": { type: [String] }, "create": { type: [Object] }, "findActivePaymasters": { type: [Object] }, "findActiveByProjectIdAndEnv": { type: Object } } }], [import("./app-store/app-store.controller"), { "AppStoreController": { "activateApp": { description: "*\nActivate an app by appName, if app has API then it also creates a public key for access", type: Object }, "getActivatedApps": { description: "*\nReturns list of apps that are activated in the authenticated account", type: [Object] }, "getAppInfo": { description: "*\nReturns metadata about the activated app in the account", type: Object }, "createSecret": { description: "*\nCreates an API secret key for `appName` of the account", type: Object }, "updateSecret": { description: "*\nRolls the API secret key for `appName` of the account", type: Object }, "getPaymentsAllowedTokens": { type: Object }, "createPaymentLink": { description: "*\nCreates a payment link for the account", type: Object }, "getPaymentLinks": { description: "*\nGets all payment links for the account", type: Object }, "getWalletBalance": { type: Object }, "transferTokensFromPaymentsAccount": { type: Object } } }], [import("./operators/operators.controller"), { "OperatorsController": { "checkOperatorExistence": { description: "Check if operator exist" }, "validate": { description: "Validate operator", type: String }, "getOperatorsUserAndProject": { description: "Get current operator" }, "createOperatorUserAndProjectAndWallet": { description: "Create user, project and AA wallet for an operator" }, "handleWebhookReceiveAndFundPaymaster": { description: "Handle Webhook Receive And Fund Paymaster" }, "checkWalletActivationStatus": { description: "Check if operator wallet is activated" }, "getSponsoredTransactionsCount": { description: "Get sponsored transactions count" }, "findOperatorBySmartWallet": { type: Object }, "findOperatorByOwnerId": { type: Object } } }], [import("../../charge-api-service/src/api-keys/api-keys.controller"), { "ApiKeysController": { "createSecret": { description: "Creates an API key secret for the given project" }, "checkIfSecretExists": { description: "Gets the api_key's for the given projectId" }, "getProjectIdByPublicKey": { description: "Gets the project id for the given public api key", type: Object }, "updateSecret": { description: "Revokes the old API key secret and generates a new one for the given project" }, "createPublic": { description: "Creates the public API key associated with the project" }, "getPublic": { description: "Gets the public API key associated with the project" }, "createSandbox": { description: "Creates the sandBox API key associated with the project" }, "getSandbox": {} } }]] } };
};