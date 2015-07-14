# connect-filter-jsonapi

This is a simple [connect middleware][] (can be used with express, or plain old
`require('http')`) that can filter through an Array of data, and return it as JSON.

### Example

```js
var posts = [{
  {
    id: '1',
    title: 'Foo',
  },
  {
    id: '2',
    title: 'Bar',
  },
  {
    id: '3',
    title: 'Baz',
  },
}];

var filterAPI = require('connect-filter-jsonapi');
var app = require('connect')()
  .use('posts/', filterAPI({ content: posts }));
```

```json
GET /posts?exclude=1
{
  "links": {
    "self": "/posts?only[]=1&only[]=3"
  },
  "data": [
    { "id": "2", "title": "Bar" },
    { "id": "3", "title": "Baz" }
  ]
}
```

```json
GET /posts?only=3
{
  "links": {
    "self": "/posts?only[]=1&only[]=3"
  },
  "data": [
    { "id": "3", "title": "Baz" },
  ]
}
```

```json
GET /posts?exclude[]=1&exclude[]=3
{
  "links": {
    "self": "/posts?only[]=1&only[]=3"
  },
  "data": [
    { "id": "2", "title": "Bar" }
  ]
}
```

```json
GET /posts?only[]=1&only[]=3
{
  "links": {
    "self": "/posts?only[]=1&only[]=3"
  },
  "data": [
    { "id": "1", "title": "Foo" }
    { "id": "3", "title": "Baz" }
  ]
}
```

### Options

#### `filterFunction`

The function that filters the each array item. If it returns false, the item wont show. If it returns true, it will. It is given the arguments `thing, params, request` and the `this` is the whole content array. Example:

```js
var posts = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

var filterAPI = require('connect-filter-jsonapi');
function filterFunction(number, params, request) {
  return number % Number(params.divisibleBy) === 0;
}
var app = require('connect')()
  .use('posts/', filterAPI({
    content: posts,
    filterFunction: filterFunction,
  }));
```

```json
GET /posts?divisibleBy=2
{
  "links": {
    "self": "/posts?divisibleBy=2"
  },
  "data": [ 2, 4, 6, 8, 10 ]
}
```

#### `wrapperFunction`

This wraps the filtered output with some JSON. By default it wraps it with a "JSON API Friendly" output. It takes the arguments `filteredContent, params, request`. Example:

```js
var posts = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

var filterAPI = require('connect-filter-jsonapi');
function filterFunction(number, params, request) {
  return number % Number(params.divisibleBy) === 0;
}
function wrapperFunction(numbers, params, request) {
  return numbers.map(function (number) {
    return { number: number };
  });
}
var app = require('connect')()
  .use('posts/', filterAPI({
    content: posts,
    filterFunction: filterFunction,
    wrapperFunction: wrapperFunction,
  }));
```

```json
GET /posts?divisibleBy=9
[
  { "number": 3 },
  { "number": 6 },
  { "number": 9 },  
]
```


[connect middleware]: https://github.com/senchalabs/connect
