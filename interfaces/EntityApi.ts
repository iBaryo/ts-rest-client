import {AllEntityApi, GeneralEntityApi, SingleEntityApi} from "./EntityApiTypes";
import {Entity, EntityDef, Id} from "./Entity";
import {AtLeastOne, Promisify} from "./Utils";


type SelectApis<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    FromApis extends Partial<AllEntityApi<EntityDef>>
    > =
    Promisify<Pick<SelectedApis, Extract<keyof SelectedApis, keyof FromApis>>>;

type SelectGeneralApis<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    > =
    SelectApis<EDef, SelectedApis, GeneralEntityApi<EDef>>;

type SelectSingleApis<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {}
    > =
    SelectApis<EDef, SelectedApis, SingleEntityApi<EDef>>
    & SubEntities;

export type AccessSingleEntityApi<
    EDef extends EntityDef = EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>> = AllEntityApi<EntityDef>,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    >  = { for(...id: AtLeastOne<Id>): SelectSingleApis<EDef,SelectedApis, SubEntities>; };

type SelectAccessSingleEntityApi<
    EDef extends EntityDef,
    SelectedApis extends Partial<AllEntityApi<EntityDef>>,
    SubEntities extends Record<string, EntityApi<any, any, any>>,
    > =
    EDef extends EntityDef<infer E, any, any> ?
        E extends Entity<infer ID> ?
            AccessSingleEntityApi<EDef, SelectedApis, SubEntities>
        // : E extends Array<any> ?
        //     SelectSingleApis<EDef, Omit<SelectedApis, keyof GetAllApi<EDef>>, SubEntities>
        : SelectSingleApis<EDef, SelectedApis, SubEntities>
    : never;


export type EntityApi<EDef extends EntityDef = EntityDef,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    SelectedApis extends Partial<AllEntityApi<EDef>> = AllEntityApi<EDef>,
    > =
    SelectGeneralApis<EDef, SelectedApis>
    & SelectAccessSingleEntityApi<EDef, SelectedApis, SubEntities>;

export type InferEntityId<T extends EntityApiOrContainer|EntityDef|Entity> = Id;
    // T extends EntityApi<EntityDef<Entity<infer ID>, any, any>, any, any> ? ID
    //     : T extends EntityDef<Entity<infer ID>> ? ID
    //     : T extends Entity<infer ID> ? ID
    //     : Id;

export type EntityApiOrContainer = EntityApi<EntityDef, any, any> | Record<string, EntityApi<EntityDef, any, any>>;
