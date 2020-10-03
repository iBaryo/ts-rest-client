export type HttpRequestFn = (path: string, query?: object, headers?: Record<string, string>) => Promise<unknown>
export type HttpBodyRequestFn = (path: string, body?: object, query?: object, headers?: Record<string, string>) => Promise<unknown>

export interface HttpClient {
    get: HttpRequestFn;
    delete: HttpRequestFn;
    put: HttpBodyRequestFn;
    post: HttpBodyRequestFn;
}
