export type Id = string;

export interface Entity<T = Id> {
    id: T;
}

type DefaultServerFields<T> = T extends Entity ? 'id' : never;

export type EntityDef<T extends object = object,
    ServerOnlyFields extends keyof T = never,
    CreateOnlyFields extends keyof T = ServerOnlyFields> = {
    type: T;
    createPayload: Omit<T, DefaultServerFields<T> | ServerOnlyFields>
    updatePayload: Omit<T, DefaultServerFields<T> | ServerOnlyFields | CreateOnlyFields>;
};
