import express from 'express'
import bodyParser from 'body-parser'
import { faker } from '@faker-js/faker'
import { v4 as uuid } from 'uuid'
import {match, none, Option, some} from "fp-ts/Option";
import ro from "@faker-js/faker/dist/types/locales/ro";

const port = 3000
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(port, () => console.log(`Mock API listening on port ${port}`))

if(require.main === module) {
    console.log(process.argv.slice(2))
    console.log(process.argv.slice(2).join(''))
    const schema: Schema = JSON.parse(process.argv.slice(2).join(''))

    const isFaker = (v: string) => v.split(".")[0] === "faker"

    const parseValue = (v: string): Option<any> => {
        if(isFaker(v)) {
            return some(Function('faker', `return ${v}`)(faker))
        } else {
            return none
        }
    }

    console.log(`Generating mock data, this can take a while...`)

    let database: Database = Object.fromEntries(Object.entries(schema)
        .map<[string, Array<{[key: string]: Option<any>}>]>(([key, value]) => [
            key,
            Array.from({ length: 100 }, (_, i) => ({
                id: some(uuid()),
                ...Object.fromEntries(Object.entries(value).map(([key2, value2]) => [key2, parseValue(value2)]))
            }))])
        .map<[string, Array<{[key: string]: any}>]>(([key1, value1]: [string, Array<{[key: string]: Option<any>}>], i1, arr) => [
            key1,
            value1.map((obj, i2) => Object.fromEntries(Object.entries(obj).map(([key2, value2]: [string, Option<any>]) => [key2, match(
                () => match(
                    () => {throw new Error(`Could not parse value of attribute ${key2} from table ${key1}: ${value2} is neither a faker function nor a reference to another table`)},
                    (u) => u)
                (Object.fromEntries(arr)[key2][i2].id),
                (a) => a)
            (value2)])))])
    )



    //console.log(JSON.stringify(database, null, 4))


    Object.entries(schema).forEach(([key, value]) => {

        const route = `/${key}`
        const pageSize = 25

        const validateBody = (body) => {
            const attributes = Object.keys(schema[key])
            return attributes.every(a => body.hasOwnProperty(a))
        }

        app.get(route, (req, res) => {
            res.send(database[key])
        })

        app.get(`${route}/:page`, (req, res) => {
            const page = parseInt(route.params.page)

            if(page) {
                const page = route.params.page

                res.send({
                    totals: {
                        page: page,
                        records: database[key].length
                    },
                    records: database[key].slice((page - 1) * pageSize, page * pageSize)
                })
            } else {
                res.send(database[key])
            }
        })

        app.post(route, (req, res) => {

            if(validateBody(req.body)) {
                database[key].push(req.body)
                res.send(database[key][database[key].length - 1])
            } else {
                res.status(400)
                res.send(`Body does not conform to the schema of ${key}`)
            }

        })

        app.put(`${route}/:id`, (req, res) => {

            if(validateBody(req.body)) {
                const id = req.params.id
                if(id) {
                    database[key] = database[key].map(o => o.id === id ? req.body : o)
                    res.send('OK')
                } else {
                    res.status(400)
                    res.send('No ID provided')
                }
            } else {
                res.status(400)
                res.send(`Body does not conform to the schema of ${key}`)
            }
        })

        app.delete(`${route}/:id`, (req, res) => {
            const id = req.params.id
            if(id) {
                database[key] = database[key].filter(o => o.id !== id)
                res.send('OK')
            } else {
                res.status(400)
                res.send(`No ID provided`)
            }
        })
    })
}