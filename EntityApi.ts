import {HttpCommonParams, HttpCommonParamsWithBody} from "./HttpClient";

export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

export type Payload<T extends Entity> = Omit<T, 'id'>;

export type EntityDef<
    T extends Entity = Entity,
    ServerOnlyFields extends keyof T = 'id',
    CreateOnlyFields extends keyof T = ServerOnlyFields> = {
    type: T;
    createPayload: Omit<T, ServerOnlyFields>
    updatePayload: Omit<T, ServerOnlyFields | CreateOnlyFields>;
};

export type EntityOp = {}

export interface DeleteEntityApi<R = void> extends EntityOp {
    delete(...args: HttpCommonParams): R;
}

export interface CreateEntityApi<T extends EntityDef = EntityDef> extends EntityOp {
    create(...args: HttpCommonParamsWithBody<T['createPayload']>): T['type'];
}

export interface GetEntityApi<T extends EntityDef = EntityDef> extends EntityOp {
    get(...args: HttpCommonParams): T['type'];
}

export interface GetAllEntitiesApi<T extends EntityDef = EntityDef> extends EntityOp {
    getAll(...args: HttpCommonParams): Array<T['type']>;
}

export interface UpdateEntityApi<T extends EntityDef> extends EntityOp {
    update(...args: HttpCommonParamsWithBody<T['updatePayload']>): T['type'];
}

export type SingleEntityApi<T extends EntityDef> =
    GetEntityApi<T> & UpdateEntityApi<T> & DeleteEntityApi<T>;

export type GeneralEntityApi<T extends EntityDef> =
    CreateEntityApi<T> & GetAllEntitiesApi<T>;

export type AllEntityApi<T extends EntityDef> =
    SingleEntityApi<T> & GeneralEntityApi<T>;

export type ReadOnlyApi<T extends EntityDef> =
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

type AtLeastOne<T> = [T, ...T[]];

export type EntityApi<
    EDef extends EntityDef = EntityDef,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    SelectedOps extends Partial<AllEntityApi<EDef>> = AllEntityApi<EDef>,
    > =
    Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof GeneralEntityApi<EDef>>>>      // pick only general entity operations
    & {
    for(...id: AtLeastOne<EDef['type']['id']>):                                                 // for a specific entity
        Promisify<Pick<SelectedOps, Extract<keyof SelectedOps, keyof SingleEntityApi<EDef>>>>   //      pick only single entity operations
        & SubEntities                                                                           //      add to it sub-entities
};

export type InferEntityId<T extends EntityApi<EntityDef<any, any>, any, any>> =
    T extends EntityApi<EntityDef<infer TYPE, any>, any, any> ?
        TYPE['id']
        : never;
