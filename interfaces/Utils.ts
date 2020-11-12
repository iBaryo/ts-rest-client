export type Promisify<T> =
    T extends (...args: any) => any ?           // if function
        ReturnType<T> extends Promise<unknown> ?                    //    if already returns a promise
            T                                           //        then return it as is;
            : (...args: Parameters<T>) => Promise<ReturnType<T>>                //        else Promise the response
        : T extends Promise<unknown> ?                  // else if already a promise
        T                                           //    then return as is
        : T extends object ?                        // else if object
            { [K in keyof T]: Promisify<T[K]> }     //    then promisify each property (recursive)
            : Promise<T>;                           // else Promise it (as it's just a primitive)

export type AtLeastOne<T> = [T, ...T[]];
