import {AllEntityApi, GeneralEntityApi, GetAllApi, SingleEntityApi} from "./EntityApiTypes";
import {AtLeastOne, Promisify} from "./Utils";
import {Entity, EntityDef, Id} from "./Entity";
import {EntityApi} from "./EntityApi";

type SelectApis<
    SelectedApis extends Partial<AllEntityApi>,
    FromApis extends string,
    > = Pick<SelectedApis, Extract<keyof SelectedApis, FromApis>>;

type SelectPromisifiedApis<
    SelectedApis extends Partial<AllEntityApi>,
    FromApis extends string
    > =
    Promisify<SelectApis<SelectedApis, FromApis>>;

type SelectGeneralApis<
    SelectedApis extends Partial<AllEntityApi>,
    > =
    SelectPromisifiedApis<SelectedApis, keyof GeneralEntityApi<EntityDef>>;

export type SelectAccessGeneralEntityApi<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi>,
    > =
    EDef extends EntityDef<infer E, any, any> ?
        E extends Entity<infer ID> ?
            SelectGeneralApis<SelectedApis>
            : SelectGeneralApis<
                SelectApis<SelectedApis,
                    Exclude<keyof GeneralEntityApi<EntityDef>, keyof GetAllApi>>>
        : never;

type SelectSingleApis<
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {}
    > =
    SelectPromisifiedApis<SelectedApis, keyof SingleEntityApi<EntityDef>>
    & SubEntities;

export type AccessSingleEntityApi<
    SelectedApis extends Partial<AllEntityApi<EntityDef>> = AllEntityApi<EntityDef>,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    >  = { for(...id: AtLeastOne<Id>): SelectSingleApis<SelectedApis, SubEntities>; };

export type SelectAccessSingleEntityApi<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    SubEntities extends Record<string, EntityApi<any, any, any>>,
    > =
    EDef extends EntityDef<infer E, any, any> ?
        E extends Entity<infer ID> ?
            AccessSingleEntityApi<SelectedApis, SubEntities>
            : SelectSingleApis<SelectedApis, SubEntities>
        : never;