# iata-search.js

[![axios](https://img.shields.io/github/package-json/dependency-version/LockBlock-dev/iata-search.js/axios)](https://www.npmjs.com/package/axios)

[![GitHub stars](https://img.shields.io/github/stars/LockBlock-dev/iata-search.js.svg)](https://github.com/LockBlock-dev/iata-search.js/stargazers) ![npm](https://img.shields.io/npm/dm/iata-search.js)

iata-search.js is a Node.js module that allows you to headlessly search airline codes from https://www.iata.org/en/about/members/airline-list/ and airport codes from https://www.iata.org/en/publications/directories/code-search/

## Installation

-   Install [NodeJS](https://nodejs.org).

### With GitHub:

-   Download or clone the project.
-   Go to the `iata-search.js` folder and run `npm install`.
-   Require [`client.js`](/src/client.js).

### With npm:

-   Run `npm install iata-search.js`.
-   Require the library.

## Documentation

-   [API documentation](/API.md)
-   [Changelog](/CHANGELOG.md)

## Example usage

The library can be used in both CommonJS and ES Modules

### Using the library - API

The library is async, be sure to use [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#syntax) or [`.then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then#syntax)

```js
const { Client } = require("iata-search.js");
// OR
import { Client } from "iata-search.js";

const client = new Client();

client.airport("JFK").then((data) => {
    console.log(data);
});
// OR
const getAirport = async () => {
    const data = await client.airport("JFK");
    console.log(data);
};

getAirport();
```

## Credits

-   [IATA](https://www.iata.org)

## Copyright

See the [license](/LICENSE)
