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
    console.log(process.argv.slice(2));
    console.log(process.argv.slice(2).join(''));
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
    const database = Object.fromEntries(Object.entries(schema)
        .map(([key, value]) => [
        key,
        Array.from({ length: 10 }, (_, i) => ({
            id: (0, Option_1.some)((0, uuid_1.v4)()),
            ...Object.fromEntries(Object.entries(value).map(([key2, value2]) => [key2, parseValue(value2)]))
        }))
    ])
        .map(([key1, value1], i1, arr) => [
        key1,
        value1.map((obj, i2) => Object.fromEntries(Object.entries(obj).map(([key2, value2]) => [key2, (0, Option_1.match)(() => (0, Option_1.match)(() => { throw new Error(`Could not parse value of attribute ${key2} from table ${key1}: ${value2} is neither a faker function nor a reference to another table`); }, (u) => u)(Object.fromEntries(arr)[key2][i2].id), (a) => a)(value2)])))
    ]));
    console.log(JSON.stringify(database, null, 4));
    Object.entries(schema).forEach(([key, value]) => {
        const route = `/${key}`;
        app.get(route, (req, res) => {
            res.send({
                name: faker_1.faker.name.findName(),
                age: faker_1.faker.datatype.number({ min: 0, max: 99 })
            });
        });
        app.post(route, (req, res) => {
            res.send('hehe');
        });
        app.put(route, (req, res) => {
            res.send('muahaha');
        });
        app.delete(route, (req, res) => {
            res.send('kek');
        });
    });
}
//# sourceMappingURL=index.js.map