## Description

Chareg Notifications Micro Service's responsibility is to manage projects' webhooks, listen to different types of events on the blockchain and send the events to webhook addresses that are subscribed to addresses that are involved in transactions. 

## Components

The Micro Service consists of several components:
* Webhooks Service - for creating and managing webhooks for projects. This service receives requests from the API Micro Service over TCP connection and applies them. The Webhooks are stored in a dedicated MongoDB. 

* Events Scanner Service - for listening to ERC20 and ERC721 token transfer events (through transaction logs). This service uses Ethersjs RPC provider to listen to such events on the blockchain. This service runs in an endless loop to listen to the blockchain from the moment its module is initiated. 

* Transactions Scanner Service - for listening to Native Fuse token transfer events (both external and internal txs). This service uses Web3js for listening to transactions in blocks and Ethersjs RPC provider to listen to internal transactions with the `trace-block` function. This service runs in an endless loop to listen to the blockchain from the moment its module is initiated. 

* Broadcaster Service - for sending the events to relevant listeners. When Events and Transactions Scanner Services detect events, they forward it to this service and its responsibility is to check if there are any webhooks that are supposed to receive events for ay of the involved addresses. The address check is done through the Webhook Service connection which in turn checks the addresses in MongoDB. 

## Architecture Diagram

For a visual representation of the moving parts, see: https://miro.com/app/board/uXjVOnPsWts=/?share_link_id=270636867995





