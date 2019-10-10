
/*
* E: event type
* C: context type
* P: parsed event type
* R: result type of processed event
* F: result of handler type
* */
export default abstract class LambdaHandler<E, C, P, R, F> {

    public start(): (e: E, c: C, cl: any) => Promise<F> {
        return async (event: E, context: C, callback: any) => {
            try {
                const event2 = await this.preProcess(event, context)
                const processResult = await this.process(event2)
                return await this.postProcess(processResult)
            } catch (e) {
                await this.onError(e)
                throw e
            }
        }
    }

    abstract preProcess(event: E, context: C) : Promise<P>
    abstract process(event: P): Promise<R>
    abstract postProcess(result: R): Promise<F>
    abstract onError(error: Error): Promise<void>
}