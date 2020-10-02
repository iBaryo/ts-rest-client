import {CRUDEntity} from "../RESTEntity";
import {init} from "../index";


const log = (r: unknown) => console.log(...r as Array<string>);

const x = init({
    async get(...args) {
        return ['get', ...args];
    },
    async post(...args) {
        return ['post', ...args];
    },
    async delete(...args) {
        return ['delete', ...args];
    },
    async put(...args) {
        return ['put', ...args];
    }
}, 'workspaces').createClient<
    CRUDEntity<{ id: string, x: number }, {
        sub: CRUDEntity<{ id: string; y: string; }, {
            sub2: CRUDEntity<{ id: string; z: { t: { x: boolean; } } }>,
            par: CRUDEntity<{ id: string; popoo: string; }>
        }>
    }>
    >();

(async () => {
    x.for('ws1').delete().then(log);
    x.for('ws2').sub.for('sub1').par.for('1', '2').delete().then(log);
})()