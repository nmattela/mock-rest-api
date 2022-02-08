In need of a mock CRUD API that returns some silly random data with no rhyme or reason to it?
This is the app you're looking for.

I still need to do some additional work on it to add some extra features, but this suffices for my own goals at the moment...

# Usage
After cloning, `yarn` to install necessary packages, `yarn start $(cat schema.json)` to run with a provided schema file.

# Schema
A schema file is a JSON file which looks like e.g.:
```json
{
  "users": {
    "name": "faker.name.findName()",
    "age": "faker.datatype.number({min: 0, max: 99})",
    "address": "address"
  },
  "address": {
    "street": "faker.address.streetName()",
    "zip": "faker.address.zipCode()",
    "city": "faker.address.city()"
  }
}
```
This will create GET, POST, UPDATE, and DELETE routes for `/users` and `/address`. A user consists of a name and age,
both of which are a faker.js value. Visit https://github.com/faker-js/faker to find documentation on the faker API. All
methods provided by faker.js are supported. Additionally, a user also has an address. You can refer to the address by providing `address` as value.
It will simply pair the user with a random address, there is no real logic behind this.