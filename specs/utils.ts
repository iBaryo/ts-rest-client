import {HttpBodyRequestFn, HttpRequestFn} from "../HttpClient";

export function normalizeParams(...args: Parameters<HttpBodyRequestFn|HttpRequestFn>) {
    function isWithBody(test: typeof args): test is Parameters<HttpBodyRequestFn> {
        return test.length == 4;
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
export const mockId: (() => string)&{reset(): void} = () => `mockId${_id}`;
mockId.reset = () => _id = 1;
