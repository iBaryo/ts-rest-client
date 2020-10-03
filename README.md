# TypeScript REST Client
A tiny http client wrapper to get a full TypeScript interface for your REST endpoints!

## Install
npm TBD

## Usage
```typescript
import {wrap, HttpClient, EntityApi, EntityDef, Entity} from "ts-rest-client";

interface EntityA extends Entity {
    f1: number;
}
interface EntityB extends Entity {
    f2: number;
}
interface EntityC extends Entity {
    f3: number;
}
interface EntityD extends Entity {
    f4: number;
    serverOnlyField: string;
}
interface EntityD extends Entity {
    f5: number;
}


const client = wrap({...} as HttpClient, '/api')
    .createClient<EntityApi<EntityDef<EntityA>, {
                nest1: EntityApi<EntityDef<EntityB>, {
                    nest2: EntityApi<EntityDef<EntityC>, {
                        nest3: EntityApi<EntityDef<EntityD, 'id'|'serverOnlyField'>> // mentioning server-only field that will be excluded from modifications
                    }>
                    nest2_2: EntityApi<EntityDef<EntityE>>,
                }>
            }>
>();


// using the provided HttpClient, the following will send this request:
//  POST /api/id1/nest1,  body: {f2:1}
client.for('id1').nest1.create({f2: 1}).then(e => e.f2);

// using the provided HttpClient, the following will send this request:
//  GET /api/id1/nest1
client.for('id1').nest1.getAll().then(entities => entities.map(e => e.f2));

// using the provided HttpClient, the following will send this request:
//  GET /api/id1/nest1/id2/nest2/id3
client.for('id1').nest1.for('id2').nest2.for('id3').get().then(r => r.f3.toFixed(2));

// using the provided HttpClient, the following will send this request:
//  PUT /api/id1/nest1/id2/nest2/id3, body: {f3: 99}
client.for('id1').nest1.for('id2').nest2.for('id3').update({f3: 99}).then(e => e.f3);

// using the provided HttpClient, the following will send this request:
//  DELETE /api/id1/nest1/id2/nest2/id3
client.for('id1').nest1.for('id2').nest2.for('id3').delete().then(() => console.log(`deleted!`));
``` 

### `EntityDef`
```typescript
type EntityDef<T extends Entity,
    ServerOnlyFields extends keyof T = 'id',
    CreateOnlyFields extends keyof T = ServerOnlyFields
>;
```
* `T` describes the full entity model; must extend `Entity<ID_TYPE>` that defined the `id` field.
* `ServerOnlyFields` (optional) is a list of fields from `T` that will be excluded in modifications (`create`/`update`)
* `CreateOnlyFields` (optional) is a list of fields from `T` that will excluded only when trying to update and entity (they'll be available when creating).

### `EntityApi`
```typescript
type EntityApi<
    EDef extends EntityDef,
    SubEntities extends Record<string, EntityApi<any, any, any>> = {},
    SelectedApis extends Partial<AllEntityApi<EDef>> = AllEntityApi<EDef>,
>;
```
* `EDef` see above.
* `SubEntities` (optional) sub-entities to a single entity (via `get`) that will be expose their api.
    * Notice that the name of the sub-entity will part of its path,
* `SelectedApis` (optional, default- `AllEntityApi`) pick which apis to expose for the entity.   

### `HttpClient`
```typescript
export interface HttpClient {
    get: (path: string, query?: object, headers?: Record<string, string>) => Promise<unknown>;
    delete: (path: string, query?: object, headers?: Record<string, string>) => Promise<unknown>;
    put: (path: string, body?: object, query?: object, headers?: Record<string, string>) => Promise<unknown>;
    post: (path: string, body?: object, query?: object, headers?: Record<string, string>) => Promise<unknown>;
}
```

#### Is there an `HttpClient` I can use?
Soon!
Until then, feel free to implement the above interface with an adapter [browser/server].

## Contributing
Clone the repo, `npm i` & `npm test`.
