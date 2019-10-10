
import { Translate } from 'aws-sdk'

interface TranslateClient {
    translateText(text: string, srcLang: string, targetLang: string): Promise<string>
}

const translate = new Translate()

export default class AWSTranslateClient implements TranslateClient{
    public async translateText(text: string, srcLang: string, targetLang: string): Promise<string> {
        const translation = await translate.translateText({
            Text: text,
            SourceLanguageCode: srcLang,
            TargetLanguageCode: targetLang
        }).promise()
        const { TranslatedText } = translation
        return TranslatedText as string
    }
}