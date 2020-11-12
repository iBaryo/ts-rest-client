import {AllEntityApi, GeneralEntityApi, GetAllApi, SingleEntityApi} from "./EntityApiTypes";
import {AtLeastOne} from "./Utils";
import {Entity, EntityDef, Id} from "./Entity";
import {EntityApi} from "./EntityApi";

export type SelectApis<EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    FromApis extends keyof SelectedApis,
    > = Pick<SelectedApis, Extract<keyof SelectedApis, FromApis>>;


// export type SelectPromisifiedApis<EDef extends EntityDef,
//     SelectedApis extends Partial<AllEntityApi<EDef>>,
//     FromApis extends string> =
//     Promisify<SelectApis<EDef, SelectedApis, FromApis>>;

export type SelectGeneralApis<EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    > =
    SelectApis<EDef, SelectedApis, keyof GeneralEntityApi<EntityDef>>;

export type SelectAccessGeneralEntityApi<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    > =
    SelectedApis extends Partial<AllEntityApi<EntityDef<Entity<infer ID>>>> ?
        SelectGeneralApis<EDef, SelectedApis>
        : SelectGeneralApis<EDef,
            SelectApis<EDef, SelectedApis,
                keyof Omit<GeneralEntityApi<EntityDef>, keyof GetAllApi>>>;

type SelectSingleApis<EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {}> =
    SelectApis<EDef, SelectedApis, keyof SingleEntityApi<EntityDef>>
    & SubEntities;

export type AccessSingleEntityApi<EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    SubEntities extends Record<string, EntityApi<EntityDef, any, any>>,
    > = { for(...id: AtLeastOne<Id>): SelectSingleApis<EDef, SelectedApis, SubEntities>; };

export type SelectAccessSingleEntityApi<EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EDef>>,
    SubEntities extends Record<string, EntityApi<EntityDef, any, any>> = {},
    > =
    SelectedApis extends Partial<AllEntityApi<EntityDef<Entity<infer ID>>>> ?
        AccessSingleEntityApi<EDef, SelectedApis, SubEntities>
        : SelectSingleApis<EDef, SelectedApis, SubEntities>;