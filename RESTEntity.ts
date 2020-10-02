export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

export type Payload<T extends Entity> = T;

export type EntityOp = {}

export interface DeleteEntity<T extends Entity = Entity, R = void> extends EntityOp {
    delete(): R;
}

export interface CreateEntity<T extends Entity = Entity, R = T> extends EntityOp {
    create(entity: Payload<T>): R;
}

export interface GetEntity<T extends Entity = Entity> extends EntityOp {
    get(): T;
}

export interface GetEntities<T extends Entity = Entity> extends EntityOp {
    getAll(): T[];
}

export interface UpdateEntity<T extends Entity = Entity, R = T> extends EntityOp {
    update(entity: Payload<T>): R;
}

export type SingleEntityOp<T extends Entity> = GetEntity<T> & UpdateEntity<T> & DeleteEntity<T>;
export type GeneralEntityOp<T extends Entity> = CreateEntity<T> & GetEntities<T>;
export type AllEntityOps<T extends Entity> = SingleEntityOp<T> & GeneralEntityOp<T>;
export type ReadOnlyOps<T extends Entity> = GetEntity<T> & GetEntities<T>;

type Promisify<T> =
    T extends (...args: infer P) => infer R ?   // if function
        R extends Promise<unknown> ?            //    if already returns a promise
            T                                   //        then return it as is;
            : (...args: P) => Promise<R>        //        else Promise the response
        : T extends object ?                    // else if object
        { [K in keyof T]: Promisify<T[K]> }     //    then promisify each property (recursive)
        : Promise<T>;                           //    else Promise it (as it's just a primitive)

export type CRUDEntity<T extends Entity = Entity,
    SubEntities extends Record<string, CRUDEntity> = {},
    Ops extends Partial<AllEntityOps<any>> = AllEntityOps<T>,
    > =
    Promisify<Pick<GeneralEntityOp<T>, Extract<keyof GeneralEntityOp<T>, keyof Ops>>>
    & {
    for: (...id: [T['id'], ...Array<T['id']>]) =>
        SubEntities & Promisify<Pick<SingleEntityOp<T>, Extract<keyof SingleEntityOp<T>, keyof Ops>>>
};

export type EntityType<T extends CRUDEntity<Entity>> = T extends CRUDEntity<infer E> ? E : never;
export type GetEntityId<T extends CRUDEntity<Entity>> = EntityType<T>['id'];