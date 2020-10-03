export type HttpCommonParams = [query?: object, headers?: Record<string, string>];
export type HttpCommonParamsWithBody<T extends object> = [body?: T, ...args: HttpCommonParams];
export type HttpRequestFn = (path: string, ...args: HttpCommonParams) => Promise<unknown>
export type HttpBodyRequestFn = (path: string, ...args: HttpCommonParamsWithBody<any>) => Promise<unknown>

export interface HttpClient {
    get: HttpRequestFn;
    delete: HttpRequestFn;
    put: HttpBodyRequestFn;
    post: HttpBodyRequestFn;
}
