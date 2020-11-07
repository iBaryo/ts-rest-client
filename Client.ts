import {InferEntityId, EntityApiOrContainer, PeakerProps} from "./interfaces/EntityApi";
import {HttpClient} from "./HttpClient";
import {AllEntityApi} from "./interfaces/EntityApiTypes";

export function wrap(httpClient: HttpClient, rootPath = '') {
    function clientFor<T extends EntityApiOrContainer>(pathSegments: string[]): T {
        return new Proxy({} as T, {
            get(target: T, p: keyof (AllEntityApi<any> & T & PeakerProps<any>)) {
                const path = pathSegments.filter(Boolean).join('/');
                switch (p) {
                    // case "create":
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
                    case "id":
                        return pathSegments[pathSegments.length - 1];
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
        createClient: <T extends EntityApiOrContainer>() => clientFor<T>([rootPath])
    };
}

