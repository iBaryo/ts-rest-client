import {
    AllEntityOps,
    CreateEntityOp,
    CRUDEntity,
    DeleteEntityOp, Entity,
    GetAllEntitiesOp,
    GetEntityOp,
    ReadOnlyOps,
    UpdateEntityOp
} from "../RESTEntity";
import {init} from "../index";
import {HttpBodyRequestFn, HttpClient, HttpRequestFn} from "../HttpClient";
import {mockId, normalizeParams} from "./utils";

describe('testing client', () => {

    let factory: ReturnType<typeof init>;
    let mockHttpClient: HttpClient;
    interface HttpRequest<K extends keyof HttpClient> {
        method: K;
        path: string;
        body?: object;
        query?: object;
        headers?: Record<string, string>;
    }

    beforeEach(() => {
        mockId.reset();
        mockHttpClient = {
            async get(...args: Parameters<HttpRequestFn>) {
                return [{
                    method: 'get',
                    // ...normalizeParams(args)
                } as HttpRequest<'get'>];
            },
            async post(...args: Parameters<HttpBodyRequestFn>) {
                return [{
                    method: 'post',
                    // ...normalizeParams(args)
                } as HttpRequest<'post'>];
            },
            async delete(...args: Parameters<HttpRequestFn>) {
                return [{
                    method: 'delete',
                    // ...normalizeParams(args)
                } as HttpRequest<'delete'>];
            },
            async put(...args: Parameters<HttpBodyRequestFn>) {
                return [{
                    method: 'put',
                    // ...normalizeParams(args)
                } as HttpRequest<'put'>];
            }
        };
        factory = init(mockHttpClient);
    });

    it('should create a simple client', function () {
        const cli = factory.createClient();
        expect(cli).toBeDefined();
        expect(cli.for).toEqual(jasmine.any(Function));
    });

    it('should provide basic crud methods', function () {
        const cli = factory.createClient<CRUDEntity<Entity & { f1: number; }>>();

        expect(cli.create).toBeDefined();
        cli.create({id: mockId(), f1: 42}).then(e => e.f1);

        expect(cli.getAll).toBeDefined();
        cli.getAll().then(es => es.map(e => e.f1));

        const single = cli.for(mockId());

        expect(cli.for(mockId()).get).toBeDefined();
        single.get().then(e => e.f1);

        expect(cli.for(mockId()).update).toBeDefined();
        single.update({id: mockId(), f1: 42}).then(e => e.f1);

        expect(cli.for(mockId()).delete).toBeDefined();
        single.delete().then(() => {
        });
    });

    describe('deep nesting', function () {
        function getClient() {
            return factory.createClient<CRUDEntity<Entity & {f1: number}, {
                nest1: CRUDEntity<Entity & {f2: number}, {
                    nest2_1: CRUDEntity<Entity & {f3: number}>,
                    nest2_2: CRUDEntity<Entity & {f4: number}, {
                        nest3: CRUDEntity<Entity & {f5: number}>
                    }>
                }>
            }>>()
        }

        describe('get', function () {
            it('should ', async () => {
                const cli = getClient();
                // expect(await cli.for(mockId()).get()).toEqual({});
                // cli.for(mockId()).nest1.for(mockId()).
            });
        });
    });
});
