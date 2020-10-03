export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

export type Payload<T extends Entity> = T;

export type EntityOp = {}

export interface DeleteEntityApi<T extends Entity = Entity, R = void> extends EntityOp {
    delete(): R;
}

export interface CreateEntityApi<T extends Entity = Entity, R = T> extends EntityOp {
    create(entity: Payload<T>): R;
}

export interface GetEntityApi<T extends Entity = Entity> extends EntityOp {
    get(): T;
}

export interface GetAllEntitiesApi<T extends Entity = Entity> extends EntityOp {
    getAll(): T[];
}

export interface UpdateEntityApi<T extends Entity = Entity, R = T> extends EntityOp {
    update(entity: Payload<T>): R;
}

export type SingleEntityApi<T extends Entity> =
    GetEntityApi<T> & UpdateEntityApi<T> & DeleteEntityApi<T>;

export type GeneralEntityApi<T extends Entity> =
    CreateEntityApi<T> & GetAllEntitiesApi<T>;

export type AllEntityApi<T extends Entity> =
    SingleEntityApi<T> & GeneralEntityApi<T>;

export type ReadOnlyApi<T extends Entity> =
    GetEntityApi<T> & GetAllEntitiesApi<T>;

type Promisify<T> =
    T extends (...args: infer P) => infer R ?           // if function
        R extends Promise<unknown> ?                    //    if already returns a promise
            T                                           //        then return it as is;
            : (...args: P) => Promise<R>                //        else Promise the response
        : T extends Promise<unknown> ?                  // else if already a promise
            T                                           //    then return as is
            : T extends object ?                        // else if object
                { [K in keyof T]: Promisify<T[K]> }     //    then promisify each property (recursive)
                : Promise<T>;                           // else Promise it (as it's just a primitive)

export type EntityApi<T extends Entity = Entity,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    SelectedOps extends Partial<AllEntityApi<T>> = AllEntityApi<T>,
    > =
    Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof GeneralEntityApi<T>>>>      // pick only general entity operations
    & {
    for(...id: [T['id'], ...Array<T['id']>]):                                               // for a specific entity
        Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof SingleEntityApi<T>>>>   //      pick only single entity operations
        & SubEntities                                                                       //      add to it sub-entities
};

type InferEntityType<T extends EntityApi<Entity, any, any>> = T extends EntityApi<infer E> ? E : never;
export type InferEntityId<T extends EntityApi<Entity, any, any>> =
    T extends Entity ? T['id'] : InferEntityType<T>['id'];
