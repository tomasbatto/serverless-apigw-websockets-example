
# Serverless Api Gateway Websockets Example

Chat translated in real-time to put into practice the use of Api Gateway Websockets using the Serverless Framework.
The user selects its language and every message received will be translated to the selected language, making the communication fluent for every one in the the chat room.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- Serverless Framework v1.5+ (https://serverless.com/framework/docs/getting-started/)
- Node v8+ (https://nodejs.org/en/)

### Installing

How to deploy it in your AWS Account

Configure AWS Credentials in Serverless (https://serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

```
serverless config credentials --provider aws --key 1234 --secret 5678
```

Deploy it:
```
serverless deploy
```

End with an example of getting some data out of the system or using it for a little demo

## Use the chat

The `docs` directory contains a UI, just edit the `main.js` file to use the websocket url generated when deploying and then open `docs/index.html` in any browser. Copy the url and paste it in another one and you are done!

To use an already deployed one try this one: https://tomasbatto.github.io/serverless-apigw-websockets-example

## Built With

* [Serverless Framework](https://serverless.com)
* [Typescript](http://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en/)
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [DynamoDb](https://aws.amazon.com/dynamodb/)
* [Amazon Translate](https://aws.amazon.com/translate/)