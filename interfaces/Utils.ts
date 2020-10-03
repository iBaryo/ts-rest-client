export type Promisify<T> =
    T extends (...args: infer P) => infer R ?           // if function
        R extends Promise<unknown> ?                    //    if already returns a promise
            T                                           //        then return it as is;
            : (...args: P) => Promise<R>                //        else Promise the response
        : T extends Promise<unknown> ?                  // else if already a promise
        T                                           //    then return as is
        : T extends object ?                        // else if object
            { [K in keyof T]: Promisify<T[K]> }     //    then promisify each property (recursive)
            : Promise<T>;                           // else Promise it (as it's just a primitive)

export type AtLeastOne<T> = [T, ...T[]];
