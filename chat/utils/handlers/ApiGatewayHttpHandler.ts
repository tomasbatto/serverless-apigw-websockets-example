import ApiGatewayLambdaHandler from './ApiGatewayLambdaHandler'
import {APIGatewayEvent, APIGatewayEventRequestContext} from "aws-lambda";

export default abstract class ApiGatewayHttpHandler<P, R> extends ApiGatewayLambdaHandler<P, R>{
    async preProcess(event: APIGatewayEvent, context: APIGatewayEventRequestContext) : Promise<P>{
        if(event && event.body){
            return JSON.parse(event.body) as P
        } else {
            return {} as P
        }
    }
}