<a name="Client"></a>

## Client
**Kind**: global class  

* [Client](#Client)
    * [new Client()](#new_Client_new)
    * [.BASE_URL](#Client+BASE_URL) : <code>String</code>
    * [.SEARCH_PORTAL_URL](#Client+SEARCH_PORTAL_URL) : <code>String</code>
    * [.AIRLINE_CODES_URL](#Client+AIRLINE_CODES_URL) : <code>String</code>
    * [.AIRPORT_CODES_URL](#Client+AIRPORT_CODES_URL) : <code>String</code>
    * [.airport(search)](#Client+airport) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.airline(search)](#Client+airline) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="new_Client_new"></a>

### new Client()
The IATA client

**Example**  
```js
const client = new Client();
```
<a name="Client+BASE_URL"></a>

### client.BASE\_URL : <code>String</code>
The base URL for IATA website

**Kind**: instance property of [<code>Client</code>](#Client)  
<a name="Client+SEARCH_PORTAL_URL"></a>

### client.SEARCH\_PORTAL\_URL : <code>String</code>
The URL for the search portal

**Kind**: instance property of [<code>Client</code>](#Client)  
<a name="Client+AIRLINE_CODES_URL"></a>

### client.AIRLINE\_CODES\_URL : <code>String</code>
The base URL for airline codes search

**Kind**: instance property of [<code>Client</code>](#Client)  
<a name="Client+AIRPORT_CODES_URL"></a>

### client.AIRPORT\_CODES\_URL : <code>String</code>
The base URL for airport codes search

**Kind**: instance property of [<code>Client</code>](#Client)  
<a name="Client+airport"></a>

### client.airport(search) ⇒ <code>Promise.&lt;Object&gt;</code>
Airport codes search.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| search | <code>string</code> | query for the search |

**Example**  
```js
client.airport("JFK")
```
<a name="Client+airline"></a>

### client.airline(search) ⇒ <code>Promise.&lt;Object&gt;</code>
Airline codes search.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| search | <code>string</code> | query for the search |

**Example**  
```js
client.airline("KL")
```
