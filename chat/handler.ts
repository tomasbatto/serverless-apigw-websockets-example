import ApiGatewayWebSocketHandler, {WebSocketAction} from "./utils/handlers/ApiGatewayWebSocketHandler";
import { DynamoDB } from "aws-sdk"
import TranslateClient from "./utils/TranslateClient";
import {flatMap} from "./utils/arrays";

const dynamoDB = new DynamoDB.DocumentClient()
const translate = new TranslateClient()

class ConnectionsHandler extends ApiGatewayWebSocketHandler<any, String> {
  async subscribe(channel: string, connectionId: string, meta: any) {
    const value1 = {
      TableName: 'connections',
      Item: {
        channel: channel,
        connectionId: connectionId,
        meta: meta
      }
    }
    const value2 = {
      TableName: 'connections-channels',
      Item: {
        connectionId: connectionId,
        channel: channel
      }
    }
    await Promise.all([await dynamoDB.put(value1).promise(), await dynamoDB.put(value2).promise()])

  }

  async unsubscribe(connectionId: string) {
    const scan = await dynamoDB.scan({
      TableName: 'connections-channels',
      FilterExpression : 'connectionId = :this_connection',
      ExpressionAttributeValues : {':this_connection' : connectionId}
    }).promise()
    if(scan.Items){
      const channelsDeletes = flatMap((obj: any)=> {
        const value1= {
          TableName: 'connections-channels',
          Key: {
            connectionId: connectionId,
            channel: obj.channel
          }
        }
        const value2= {
          TableName: 'connections',
          Key: {
            channel: obj.channel,
            connectionId: connectionId
          }
        }
        return [dynamoDB.delete(value1).promise(), dynamoDB.delete(value2).promise()]
      }, scan.Items)
      await Promise.all(channelsDeletes)
    }


  }
  async process(event: WebSocketAction<any>): Promise<String> {
    switch (event.action){
      case 'connect':
        await this.subscribe(event.meta.channel, event.meta.connectionId, event.meta)
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
  async getSubscribers(channel: string): Promise<any[]>{
    const scan = await dynamoDB.scan({
      TableName: 'connections',
      FilterExpression : 'channel = :this_channel',
      ExpressionAttributeValues : {':this_channel' : channel}
    }).promise()
    return scan.Items as any[]
  }

  async sendToChannel(event: WebSocketAction<any>, payload: any) {
    const connections = await this.getSubscribers(event.meta.channel)
    const url = `https://${event.meta.domain}/${event.meta.stage}`
    const translations = {}
    const srcConnection = connections.find((conn) => conn.connectionId === event.meta.connectionId)
    const promises = connections.map(async (connection) => {
      if(!connection){
        return
      }
      let translatedText = payload.message
      if(connection.meta && connection.meta.language) {
        translatedText = translations[connection.meta.language]
        if (!translatedText) {
          translatedText = await translate.translateText(payload.message, srcConnection.meta.language, connection.meta.language)
        }
      }
      const id = connection.connectionId
      payload.message = translatedText
      return this.sendMessageToClient(url, id, payload)
    })
    await Promise.all(promises)
    return
  }

  async process(event: WebSocketAction<any>): Promise<String> {
    switch (event.action){
      case 'message':
      default:
        await this.sendToChannel(event,{from: event.meta.connectionId, message: event.data.message})
        return "OK"
    }
  }
}

export const connect = new ConnectionsHandler().start()
export const message = new MessageHandler().start()