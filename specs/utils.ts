import {HttpBodyRequestFn, HttpRequestFn} from "../HttpClient";

export const paramsLengthWithBody = 4;

export function normalizeParams(...args: Parameters<HttpBodyRequestFn>|Parameters<HttpRequestFn>) {
    function isWithBody(test: typeof args): test is Parameters<HttpBodyRequestFn> {
        return test.length == paramsLengthWithBody;
    }

    if (isWithBody(args))
        return {
            path: args[0],
            body: args[1],
            query: args[2],
            headers: args[3]
        };
    else
        return {
            path: args[0],
            query: args[1],
            headers: args[2]
        };
}

let _id: number;
export const genId: (() => string)&{reset(): void} = () => `mockId${_id++}`;
genId.reset = () => _id = 1;

export function padArray<T extends Array<any>>(arr: T, size: number): T {
    return arr.concat(new Array(size - arr.length).fill(undefined)) as T;
}
