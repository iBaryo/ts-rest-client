export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

export type Payload<T extends Entity> = T;

export type EntityOp = {}

export interface DeleteEntityOp<T extends Entity = Entity, R = void> extends EntityOp {
    delete(): R;
}

export interface CreateEntityOp<T extends Entity = Entity, R = T> extends EntityOp {
    create(entity: Payload<T>): R;
}

export interface GetEntityOp<T extends Entity = Entity> extends EntityOp {
    get(): T;
}

export interface GetAllEntitiesOp<T extends Entity = Entity> extends EntityOp {
    getAll(): T[];
}

export interface UpdateEntityOp<T extends Entity = Entity, R = T> extends EntityOp {
    update(entity: Payload<T>): R;
}

export type SingleEntityOp<T extends Entity> =
    GetEntityOp<T> & UpdateEntityOp<T> & DeleteEntityOp<T>;

export type GeneralEntityOp<T extends Entity> =
    CreateEntityOp<T> & GetAllEntitiesOp<T>;

export type AllEntityOps<T extends Entity> =
    SingleEntityOp<T> & GeneralEntityOp<T>;

export type ReadOnlyOps<T extends Entity> =
    GetEntityOp<T> & GetAllEntitiesOp<T>;

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

export type CRUDEntity<T extends Entity = Entity,
    SubEntities extends Record<string, CRUDEntity<any, any, any>> = {},
    SelectedOps extends Partial<AllEntityOps<T>> = AllEntityOps<T>,
    > =
    Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof GeneralEntityOp<T>>>>      // pick only general entity operations
    & {
    for(...id: [T['id'], ...Array<T['id']>]):                                               // for a specific entity
        Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof SingleEntityOp<T>>>>   //      pick only single entity operations
        & SubEntities                                                                       //      add to it sub-entities
};

type InferEntityType<T extends CRUDEntity<Entity, any, any>> = T extends CRUDEntity<infer E> ? E : never;
export type InferEntityId<T extends CRUDEntity<Entity, any, any>> =
    T extends Entity ? T['id'] : InferEntityType<T>['id'];
