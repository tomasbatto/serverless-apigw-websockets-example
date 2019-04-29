import { APIGatewayEvent, APIGatewayEventRequestContext, APIGatewayProxyResult } from "aws-lambda";
import LambdaHandler from "./LambdaHandler";

export default abstract class ApiGatewayLambdaHandler<P, R> extends LambdaHandler<APIGatewayEvent, APIGatewayEventRequestContext, P, R, APIGatewayProxyResult> {
    async postProcess(result: R): Promise<APIGatewayProxyResult> {
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    }

    async onError(error: Error){
        console.log(JSON.stringify(error))
    }
}