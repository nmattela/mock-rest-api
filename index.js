const express = require('express')
const app = express()
const port = 3000

const { faker } = require('@faker-js/faker')

app.get('/users', (req, res) => {
    res.send({
        name: faker.name.findName(),
        age: faker.datatype.number({min: 0, max: 99})
    })
})

app.listen(port, () => console.log(`Mock API listening on port ${port}`))