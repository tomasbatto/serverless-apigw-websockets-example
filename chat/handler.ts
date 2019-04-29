import ApiGatewayWebSocketHandler, {WebSocketAction} from "./utils/handlers/ApiGatewayWebSocketHandler";
import { DynamoDB } from "aws-sdk"

const dynamoDB = new DynamoDB.DocumentClient()

class ConnectionsHandler extends ApiGatewayWebSocketHandler<any, String> {
  async subscribe(connectionId: string) {
    const value = {
      TableName: 'connections',
      Item: {
        channel: 'general',
        connectionId: connectionId
      }
    }
    await dynamoDB.put(value).promise()
  }

  async unsubscribe(connectionId: string) {
    const value = {
      TableName: 'connections',
      Key: {
        channel: 'general',
        connectionId: connectionId
      }
    }
    await dynamoDB.delete(value).promise()

  }
  async process(event: WebSocketAction<any>): Promise<String> {
    switch (event.action){
      case 'connect':
        await this.subscribe(event.meta.connectionId)
        break
      case 'disconnect':
        await this.unsubscribe(event.meta.connectionId)
        break
    }
    console.log('Event:', JSON.stringify(event))
    return "OK"
  }
}

class MessageHandler extends ApiGatewayWebSocketHandler<any, String> {
  async getSubscribers(): Promise<any[]>{
    const scan = await dynamoDB.scan({
      TableName: 'connections',
      FilterExpression : 'channel = :this_channel',
      ExpressionAttributeValues : {':this_channel' : "general"}
    }).promise()
    return scan.Items as any[]
  }

  async sendToChannel(event: WebSocketAction<any>, payload: any) {
    const connections = await this.getSubscribers()
    const url = `https://${event.meta.domain}/${event.meta.stage}`
    const promises = connections.map((connection) => {
      const id = connection.connectionId
      return this.sendMessageToClient(url, id, payload)
    })
    await Promise.all(promises)
    return
  }

  async process(event: WebSocketAction<any>): Promise<String> {
    switch (event.action){
      case 'message':
      default:
        console.log('Event:', JSON.stringify(event))
        await this.sendToChannel(event,{from: event.meta.connectionId, message: event.data.message})
        return "OK"
    }
  }
}

export const connect = new ConnectionsHandler().start()
export const message = new MessageHandler().start()