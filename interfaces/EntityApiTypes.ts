import {HttpCommonParams, HttpCommonParamsWithBody} from "../HttpClient";
import {EntityDef} from "./Entity";

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
