import ApiGatewayLambdaHandler from './ApiGatewayLambdaHandler'
import {APIGatewayEvent, APIGatewayEventRequestContext} from "aws-lambda";
import {ApiGatewayManagementApi} from "aws-sdk";

export interface WebSocketAction<Data> {
    action: string,
    data: Data,
    meta: {
        connectionId: string,
        domain: string,
        stage: string,
        channel: string,
        language: string
    }
}

export default abstract class ApiGatewayWebSocketHandler<D, R> extends ApiGatewayLambdaHandler<WebSocketAction<D>, R>{
    async preProcess(event: APIGatewayEvent, context: APIGatewayEventRequestContext) : Promise<WebSocketAction<D>>{
        console.log(JSON.stringify(event))
        if(event && event.requestContext ){
            const body = event.body ? JSON.parse(event.body) : {}
            let channel
            let language = 'en'
            if (!event.queryStringParameters || !event.queryStringParameters.channel){
                channel = body.channel
            } else {
                channel = event.queryStringParameters.channel
                if(event.queryStringParameters.lang) {
                    language = event.queryStringParameters.lang
                }
            }
            const requestContext = event.requestContext
            const connectionId = requestContext.connectionId
            const domain = requestContext.domainName
            const stage = requestContext.stage
            const action = requestContext.routeKey ? requestContext.routeKey.replace('$', '') : ''
            const webSocketAction = Object.assign(body,{action},{ meta: { connectionId, domain, stage, channel, language}})
            return webSocketAction as WebSocketAction<any>
        } else {
            return {} as WebSocketAction<any>
        }
    }

    async sendMessageToClient (url: string, connectionId: string, payload: any) : Promise<any> {
        const apigatewaymanagementapi = new ApiGatewayManagementApi({apiVersion: '2029', endpoint: url});
        try {
            await apigatewaymanagementapi.postToConnection({
                ConnectionId: connectionId, // connectionId of the receiving ws-client
                Data: JSON.stringify(payload)
            }).promise()
        } catch (e) {
            if(e.message === "410") {
                console.log(e.message)
                return
            } else {
                throw e
            }
        }
        return
    }
}