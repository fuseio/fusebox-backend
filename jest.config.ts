import dotenv from "dotenv"
dotenv.config()

export default {
    "moduleFileExtensions": [
        "js",
        "json",
        "ts"
    ],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
        "**/*.(t|j)s"
    ],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
    "roots": [
        "<rootDir>/apps/",
        "<rootDir>/libs/",
        "<rootDir>/tests/",
        "<rootDir>/scripts/"
    ],
    "moduleNameMapper": {
        "^@app/common(|/.*)$": "<rootDir>/libs/common/src$1",
        "^@app/accounts-service(|/.*)$": "<rootDir>/apps/charge-accounts-service/src$1",
        "^@app/api-service(|/.*)$": "<rootDir>/apps/charge-api-service/src$1",
        "^@app/notifications-service(|/.*)$": "<rootDir>/apps/charge-notifications-service/src$1",
        "^@app/relay-service(|/.*)$": "<rootDir>/apps/charge-relay-service/src$1",
        "^@app/network-service(|/.*)$": "<rootDir>/apps/charge-network-service/src$1",
        "^@app/apps-service(|/.*)$": "<rootDir>/apps/charge-apps-service/src$1",
        "^@app/smart-wallets-service(|/.*)$": "<rootDir>/apps/charge-smart-wallets-service/src$1",
        "^@scripts(|/.*)$": "<rootDir>/scripts$1",
        "^axios$": require.resolve('axios')
    }
}
