export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

export type EntityDef<T extends Entity = Entity,
    ServerOnlyFields extends keyof T = 'id',
    CreateOnlyFields extends keyof T = ServerOnlyFields> = {
    type: T;
    createPayload: Omit<T, ServerOnlyFields>
    updatePayload: Omit<T, ServerOnlyFields | CreateOnlyFields>;
};
