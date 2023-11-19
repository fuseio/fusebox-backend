## Description

Fusebox is a comprehensive development framework designed for constructing applications on the Fuse Network. It provides a set of APIs that cater to various functionalities:

1. Account Abstraction API: This API enables the creation and administration of smart wallet accounts built on the ERC4337 standard.
2. Data API: Utilize this API to retrieve on-chain data related to your users, including information such as balances, token specifics, and transaction history.
3. Feed API: The Feed API offers a user-friendly stream of wallet actions, making it easy to display wallets activity.
4. Notification API: Subscribing to the Notification API allows you to receive updates on wallet events and activities pertaining to your customers.
5. Trading API: This API facilitates trading activities and provides access to trading-related data.


## Tech Stack
Fusebox Backend API developed with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Environment

Set the environment variables by running

```bash
cp .env.example .env
cp apps/charge-api-service/.env.example apps/charge-api-service/.env
cp apps/charge-network-service/.env.example apps/charge-network-service/.env
cp apps/charge-relay-service/.env.example apps/charge-relay-service/.env

```

Make sure you update the .env files with necessary variable values before proceeding to the next step.

## Running the app

```bash
#docker dev
$ npm run docker:dev

#docker debug
$ npm run docker:debug

"Then run the 'Debug: Charge' configuration in launch.json through the debugger in VS Code"

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
