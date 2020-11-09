import {HttpCommonParams, HttpCommonParamsWithBody} from "../HttpClient";
import {EntityDef} from "./Entity";

export type Api = {}

export interface DeleteApi<R = void> extends Api {
    delete(...args: HttpCommonParams): R;
}

export interface CreateApi<T extends EntityDef = EntityDef> extends Api {
    create(...args: HttpCommonParamsWithBody<T['createPayload']>): T['type'];
}

export interface GetApi<T extends EntityDef = EntityDef> extends Api {
    get(...args: HttpCommonParams): T['type'];
}

export interface GetAllApi<T extends EntityDef = EntityDef> extends Api {
    getAll(...args: HttpCommonParams): Array<T['type']>;
}

export interface UpdateApi<T extends EntityDef> extends Api {
    update(...args: HttpCommonParamsWithBody<T['updatePayload']>): T['type'];
}

export type SingleEntityApi<T extends EntityDef> =
    GetApi<T> & UpdateApi<T> & DeleteApi<T>;

export type GeneralEntityApi<T extends EntityDef> =
    CreateApi<T> & GetAllApi<T>;

export type AllEntityApi<T extends EntityDef = EntityDef> =
    SingleEntityApi<T> & GeneralEntityApi<T>;

export type ReadOnlyApi<T extends EntityDef = EntityDef> =
    GetApi<T> & GetAllApi<T>;
