import {AllEntityApi, EntityApi, InferEntityId} from "./EntityApi";
import {HttpClient} from "./HttpClient";

export function init(httpClient: HttpClient, rootPath = '') {
    function clientFor<T extends EntityApi<any, any, any>>(pathSegments: string[]): T {
        return new Proxy({} as T, {
            get(target: T, p: AllEntityApi<any> & keyof T) {
                const path = pathSegments.join('/');
                switch (p) {
                    case "create":
                        return (payload) => httpClient.post(path, payload);
                    case "getAll":
                    case "get":
                        return () => httpClient.get(path);
                    case "update":
                        return (payload) => httpClient.put(path, payload)
                    case "delete":
                        return () => httpClient.delete(path);
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

