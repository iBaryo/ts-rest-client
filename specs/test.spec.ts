import {wrap, HttpClient, EntityApi, Entity, Id, EntityDef, ReadOnlyApi} from "../index";
import {HttpBodyRequestFn, HttpRequestFn} from "../HttpClient";
import {genId, normalizeParams, padArray, paramsLengthWithBody} from "./utils";

describe('testing client', () => {
    const mockRoot = `/api`;
    let factory: ReturnType<typeof wrap>;
    let mockHttpClient: HttpClient;

    interface HttpRequest<K extends keyof HttpClient> {
        method: K;
        path: string;
        body?: object;
        query?: object;
        headers?: Record<string, string>;
    }

    function getClient() {
        return factory.createClient<EntityApi<EntityDef<Entity & { f1: number }>, {
            nest1: EntityApi<EntityDef<Entity & { f2: number }>, {
                nest2: EntityApi<EntityDef<Entity & { f3: number }>, {
                    nest3: EntityApi<EntityDef<Entity & { f4: number; serverOnlyField: string }, 'id' | 'serverOnlyField'>>
                }>
                nest2_2: EntityApi<EntityDef<Entity & { f5: number }>, {}, ReadOnlyApi<EntityDef<Entity & { f5: number }>>>,
            }>
        }>>()
    }

    beforeEach(() => {
        genId.reset();
        mockHttpClient = {
            get: jasmine.createSpy().and.callFake(async function (...args: Parameters<HttpRequestFn>) {
                return [{
                    method: 'get',
                    ...normalizeParams(...padArray(args, paramsLengthWithBody - 1))
                } as HttpRequest<'get'>]
            }),
            post: jasmine.createSpy().and.callFake(async function (...args: Parameters<HttpBodyRequestFn>) {
                return [{
                    method: 'post',
                    ...normalizeParams(...padArray(args, paramsLengthWithBody))
                } as HttpRequest<'post'>]
            }),
            delete: jasmine.createSpy().and.callFake(async function (...args: Parameters<HttpRequestFn>) {
                return [{
                    method: 'delete',
                    ...normalizeParams(...padArray(args, paramsLengthWithBody - 1))
                } as HttpRequest<'delete'>]
            }),
            put: jasmine.createSpy().and.callFake(async function (...args: Parameters<HttpBodyRequestFn>) {
                return [{
                    method: 'put',
                    ...normalizeParams(...padArray(args, paramsLengthWithBody))
                } as HttpRequest<'put'>]
            })
        };
        factory = wrap(mockHttpClient, mockRoot);
    });

    it('should create a simple client', function () {
        const cli = factory.createClient();
        expect(cli).toBeDefined();
    });

    it('should provide basic crud methods', function () {
        const cli = getClient();

        expect(cli.create).toBeDefined();
        cli.create({f1: 42}).then(e => e.f1);

        expect(cli.getAll).toBeDefined();
        cli.getAll().then(es => es.map(e => e.f1));

        const single = cli.for(genId());

        expect(cli.for(genId()).get).toBeDefined();
        single.get().then(e => e.f1);

        expect(cli.for(genId()).update).toBeDefined();
        single.update({f1: 42}).then(e => e.f1);

        expect(cli.for(genId()).delete).toBeDefined();
        single.delete().then(() => {
        });

        // nested:
        single.nest1.create({f2: 13});
        const entity = single.nest1.for(genId()).nest2.for(genId()).nest3;
        entity.create({f4: 42})
        entity.for(genId()).update({f4: 43}).then(e => e.serverOnlyField);

        // allowed apis
        single.nest1.for('').nest2_2.for('').get().then(x => x.f5);
    });

    describe('deep nesting', function () {
        const nestingLevel = 3;


        function expectResponse(res: object | void) {
            return {
                toEqual: <T extends HttpRequest<keyof HttpClient>>(expectedReq: T) =>
                    expect(res[0]).toEqual(expectedReq)
            };
        }

        let cli: ReturnType<typeof getClient>;
        let mockIds: Id[];
        let mockPayload: any;

        beforeEach(() => {
            cli = getClient();
            mockIds = new Array(nestingLevel + 1).fill(0).map(() => genId());
            mockPayload = {};
        });

        describe('getAll', function () {
            it('should build req in nesting level 0', async () => {
                expectResponse(await cli.getAll()).toEqual({
                    method: 'get', path: `${mockRoot}`, query: undefined, headers: undefined
                });
            });
            it('should build req in nesting level 1', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.getAll()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 2', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.getAll()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 3', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).nest3.getAll()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}/nest3`,
                    query: undefined,
                    headers: undefined
                });
            });
        });

        describe('create', function () {
            it('should build req in nesting level 0', async () => {
                expectResponse(await cli.create(mockPayload)).toEqual({
                    method: 'post', path: `${mockRoot}`, query: undefined, headers: undefined, body: mockPayload
                });
            });
            it('should build req in nesting level 1', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.create(mockPayload)).toEqual({
                    method: 'post',
                    path: `${mockRoot}/${mockIds[0]}/nest1`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
            it('should build req in nesting level 2', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.create(mockPayload)).toEqual({
                    method: 'post',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
            it('should build req in nesting level 3', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).nest3.create(mockPayload)).toEqual({
                    method: 'post',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}/nest3`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
        });

        describe('get', function () {
            it('should build req in nesting level 0', async () => {
                expectResponse(await cli.for(mockIds[0]).get()).toEqual({
                    method: 'get', path: `${mockRoot}/${mockIds[0]}`, query: undefined, headers: undefined
                });
            });
            it('should build req in nesting level 1', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).get()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 2', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).get()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 3', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).nest3.for(mockIds[3]).get()).toEqual({
                    method: 'get',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}/nest3/${mockIds[3]}`,
                    query: undefined,
                    headers: undefined
                });
            });
        });

        describe('update', function () {
            it('should build req in nesting level 0', async () => {
                expectResponse(await cli.for(mockIds[0]).update(mockPayload)).toEqual({
                    method: 'put', path: `${mockRoot}/${mockIds[0]}`, query: undefined, headers: undefined,
                    body: mockPayload
                });
            });
            it('should build req in nesting level 1', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).update(mockPayload)).toEqual({
                    method: 'put',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
            it('should build req in nesting level 2', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).update(mockPayload)).toEqual({
                    method: 'put',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
            it('should build req in nesting level 3', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).nest3.for(mockIds[3]).update(mockPayload)).toEqual({
                    method: 'put',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}/nest3/${mockIds[3]}`,
                    query: undefined,
                    headers: undefined,
                    body: mockPayload
                });
            });
        });

        describe('delete', function () {
            it('should build req in nesting level 0', async () => {
                expectResponse(await cli.for(mockIds[0]).delete()).toEqual({
                    method: 'delete', path: `${mockRoot}/${mockIds[0]}`, query: undefined, headers: undefined
                });
            });
            it('should build req in nesting level 1', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).delete()).toEqual({
                    method: 'delete',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 2', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).delete()).toEqual({
                    method: 'delete',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}`,
                    query: undefined,
                    headers: undefined
                });
            });
            it('should build req in nesting level 3', async () => {
                expectResponse(await cli.for(mockIds[0]).nest1.for(mockIds[1]).nest2.for(mockIds[2]).nest3.for(mockIds[3]).delete()).toEqual({
                    method: 'delete',
                    path: `${mockRoot}/${mockIds[0]}/nest1/${mockIds[1]}/nest2/${mockIds[2]}/nest3/${mockIds[3]}`,
                    query: undefined,
                    headers: undefined
                });
            });
        });


    });
});
