import {AllEntityApi} from "./EntityApiTypes";
import {Entity, EntityDef, Id} from "./Entity";
import {SelectAccessGeneralEntityApi, SelectAccessSingleEntityApi} from "./SelectApis";

export type EntityApi<EDef extends EntityDef = EntityDef,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    SelectedApis extends Partial<AllEntityApi<EDef>> = AllEntityApi<EDef>,
    > =
    SelectAccessGeneralEntityApi<EDef, SelectedApis>
    & SelectAccessSingleEntityApi<EDef, SelectedApis, SubEntities>;

export type InferEntityId<T extends EntityApiOrContainer|EntityDef|Entity> = Id;
    // T extends EntityApi<EntityDef<Entity<infer ID>, any, any>, any, any> ? ID
    //     : T extends EntityDef<Entity<infer ID>> ? ID
    //     : T extends Entity<infer ID> ? ID
    //     : Id;

export type EntityApiOrContainer = EntityApi<EntityDef, any, any> | Record<string, EntityApi<EntityDef, any, any>>;
