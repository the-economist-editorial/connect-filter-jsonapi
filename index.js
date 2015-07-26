'use strict';
var url = require('url');
var qs = require('qs');
var ap = Array.prototype;
// var debug = require('debug')('content-api');

function defaultFilterFunction(thing, params, request) {
  if (Array.isArray(params.exclude) && ap.indexOf.call(params.exclude, thing.id) !== -1) {
    return false;
  }
  if (typeof params.exclude === 'string' && thing.id === params.exclude) {
    return false;
  }
  if (Array.isArray(params.only) && ap.indexOf.call(params.only, thing.id) === -1) {
    return false;
  }
  if (typeof params.only === 'string' && thing.id !== params.only) {
    return false;
  }
  return true;
}

function defaultWrapperFunction(content, params, request) {
  return {
    "links": {
      "self": request.originalUrl || request.url,
    },
    "data": content,
  }
}

module.exports = function contentAPI(options) {
  var content = options.content;
  var filterFunction = options.filterFunction || defaultFilterFunction;
  var wrapperFunction = options.wrapperFunction || defaultWrapperFunction;
  return function reactRouterMiddleware(request, response) {
    var requestURL = url.parse(request.url);
    // debug('Parsing request: ' + requestURL.pathname);
    var params = qs.parse(requestURL.query);
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    var filteredContents = ap.filter.call(content, function (thing) {
      return defaultFilterFunction.call(content, thing, params, request);
    });
    var wrappedContents = wrapperFunction(filteredContents, params, request);
    response.end(JSON.stringify(wrappedContents));
  };
};
