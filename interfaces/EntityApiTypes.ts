import {HttpCommonParams, HttpCommonParamsWithBody} from "../HttpClient";
import {EntityDef} from "./Entity";

export type Api = {}

export const AccessHeaders = Symbol('headers');
export type WithHeaders = { [AccessHeaders]: Record<string, string> };

export interface DeleteApi<R = void> extends Api {
    delete(...args: HttpCommonParams): Promise<R & WithHeaders>;
}

export interface CreateApi<T extends EntityDef = EntityDef> extends Api {
    create(entity: T['createPayload'], ...args: HttpCommonParams): Promise<T['type'] & WithHeaders>;
}

export interface GetApi<T extends EntityDef = EntityDef> extends Api {
    get(...args: HttpCommonParams): Promise<T['type'] & WithHeaders>;
}

export interface GetAllApi<T extends EntityDef = EntityDef> extends Api {
    getAll(...args: HttpCommonParams): Promise<Array<T['type']> & WithHeaders>;
}

export interface UpdateApi<T extends EntityDef> extends Api {
    update(entity: T['updatePayload'], ...args: HttpCommonParams): Promise<T['type'] & WithHeaders>;
}

export type SingleEntityApi<T extends EntityDef> =
    GetApi<T> & UpdateApi<T> & DeleteApi<T>;

export type GeneralEntityApi<T extends EntityDef> =
    CreateApi<T> & GetAllApi<T>;

export type AllEntityApi<T extends EntityDef = EntityDef> =
    SingleEntityApi<T> & GeneralEntityApi<T>;

export type ReadOnlyApi<T extends EntityDef = EntityDef> =
    GetApi<T> & GetAllApi<T>;
