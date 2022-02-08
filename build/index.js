var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const Option_1 = require("fp-ts/Option");
const port = 3000;
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.listen(port, () => console.log(`Mock API listening on port ${port}`));
if (require.main === module) {
    const schema = JSON.parse(process.argv.slice(2).join(''));
    const isFaker = (v) => v.split(".")[0] === "faker";
    const parseValue = (v) => {
        if (isFaker(v)) {
            return (0, Option_1.some)(Function('faker', `return ${v}`)(faker_1.faker));
        }
        else {
            return Option_1.none;
        }
    };
    console.log(`Generating mock data, this can take a while...`);
    let database = Object.fromEntries(Object.entries(schema)
        .map(([key, value]) => [
        key,
        Array.from({ length: 100 }, (_, i) => ({
            id: (0, Option_1.some)((0, uuid_1.v4)()),
            ...Object.fromEntries(Object.entries(value).map(([key2, value2]) => [key2, parseValue(value2)]))
        }))
    ])
        .map(([key1, value1], i1, arr) => [
        key1,
        value1.map((obj, i2) => Object.fromEntries(Object.entries(obj).map(([key2, value2]) => [key2, (0, Option_1.match)(() => (0, Option_1.match)(() => { throw new Error(`Could not parse value of attribute ${key2} from table ${key1}: ${value2} is neither a faker function nor a reference to another table`); }, (u) => u)(Object.fromEntries(arr)[key2][i2].id), (a) => a)(value2)])))
    ]));
    Object.entries(schema).forEach(([key, value]) => {
        const route = `/${key}`;
        const pageSize = 25;
        const validateBody = (body) => {
            const attributes = Object.keys(schema[key]);
            return attributes.every(a => body.hasOwnProperty(a));
        };
        const unfold = (records) => {
            const table = schema[key];
            const linkedAttributes = Object.entries(table).filter(([k, v]) => !isFaker(v)).map(([k, v]) => k);
            return records.map(record => ({
                ...record,
                ...Object.fromEntries(linkedAttributes.map(a => [a, database[a].filter(b => b.id === record[a])[0]]))
            }));
        };
        app.get(route, (req, res) => {
            res.send(unfold(database[key]));
        });
        app.get(`${route}/:page`, (req, res) => {
            const page = parseInt(req.params.page);
            if (page) {
                res.send({
                    totals: {
                        page: page,
                        records: database[key].length
                    },
                    records: unfold(database[key].slice((page - 1) * pageSize, page * pageSize))
                });
            }
            else {
                res.send(database[key]);
            }
        });
        app.post(route, (req, res) => {
            if (validateBody(req.body)) {
                database[key].push(req.body);
                res.send(database[key][database[key].length - 1]);
            }
            else {
                res.status(400);
                res.send(`Body does not conform to the schema of ${key}`);
            }
        });
        app.put(`${route}/:id`, (req, res) => {
            if (validateBody(req.body)) {
                const id = req.params.id;
                if (id) {
                    database[key] = database[key].map(o => o.id === id ? req.body : o);
                    res.send('OK');
                }
                else {
                    res.status(400);
                    res.send('No ID provided');
                }
            }
            else {
                res.status(400);
                res.send(`Body does not conform to the schema of ${key}`);
            }
        });
        app.delete(`${route}/:id`, (req, res) => {
            const id = req.params.id;
            if (id) {
                database[key] = database[key].filter(o => o.id !== id);
                res.send('OK');
            }
            else {
                res.status(400);
                res.send(`No ID provided`);
            }
        });
    });
}
//# sourceMappingURL=index.js.map