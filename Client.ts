import {EntityApi, InferEntityId} from "./interfaces/EntityApi";
import {HttpClient} from "./HttpClient";
import {AllEntityApi} from "./interfaces/EntityApiTypes";

export function wrap(httpClient: HttpClient, rootPath = '') {
    function clientFor<T extends EntityApi<any, any, any>>(pathSegments: string[]): T {
        return new Proxy({} as T, {
            get(target: T, p: AllEntityApi<any> & keyof T) {
                const path = pathSegments.join('/');
                switch (p) {
                    case "create":
                        return (...args) => httpClient.post(path, ...args);
                    case "getAll":
                    case "get":
                        return (...args) => httpClient.get(path, ...args);
                    case "update":
                        return (...args) => httpClient.put(path, ...args);
                    case "delete":
                        return (...args) => httpClient.delete(path, ...args);
                    case "for":
                        return (...id: [InferEntityId<T>, ...InferEntityId<T>[]]) => clientFor([
                            ...pathSegments,
                            ...id
                        ]);
                    default:
                        return clientFor([
                            ...pathSegments,
                            p.toString()
                        ]);
                }
            }
        });
    }

    return {
        createClient: <T extends EntityApi<any, any, any>>() => clientFor<T>([rootPath])
    };
}

