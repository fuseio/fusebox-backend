## Description

Fuse Charge Backend API developed with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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
