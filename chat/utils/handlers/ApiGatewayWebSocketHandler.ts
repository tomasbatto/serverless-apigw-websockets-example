import ApiGatewayLambdaHandler from './ApiGatewayLambdaHandler'
import {APIGatewayEvent, APIGatewayEventRequestContext} from "aws-lambda";
import {ApiGatewayManagementApi} from "aws-sdk";

export interface WebSocketAction<Data> {
    action: string,
    data: Data,
    meta: {
        connectionId: string,
        domain: string
        stage: string
    }
}

export default abstract class ApiGatewayWebSocketHandler<D, R> extends ApiGatewayLambdaHandler<WebSocketAction<D>, R>{
    async preProcess(event: APIGatewayEvent, context: APIGatewayEventRequestContext) : Promise<WebSocketAction<D>>{
        if(event && event.requestContext){
            const body = event.body ? JSON.parse(event.body) : {}
            const requestContext = event.requestContext
            const connectionId = requestContext.connectionId
            const domain = requestContext.domainName
            const stage = requestContext.stage
            const action = requestContext.routeKey ? requestContext.routeKey.replace('$', '') : ''
            const webSocketAction = Object.assign(body,{action},{ meta: { connectionId, domain, stage }})
            return webSocketAction as WebSocketAction<any>
        } else {
            return {} as WebSocketAction<any>
        }
    }

    async sendMessageToClient (url: string, connectionId: string, payload: any) : Promise<any> {
        console.log(url, connectionId, JSON.stringify(payload))
        const apigatewaymanagementapi = new ApiGatewayManagementApi({apiVersion: '2029', endpoint: url});
        await apigatewaymanagementapi.postToConnection({
            ConnectionId: connectionId, // connectionId of the receiving ws-client
            Data: JSON.stringify(payload)
        }).promise()
        console.log('Sent')
        return
    }
}