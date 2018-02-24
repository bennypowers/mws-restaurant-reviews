# Mobile Web Specialist Certification Course
---

# Starting the Dev Server

We opted not to use the [development server provided by udacity]( https://github.com/udacity/mws-restaurant-stage-2), instead we have created our own much simpler dev server within this very repository. It uses [local-web-server](https://github.com/lwsjs/local-web-server/wiki) to serve the static HTML, JS, and CSS, as well as provide database access via a mocked REST API available at `/api/`. As such, we have obviated the need for a database URL and port in the client side JS, as all requests now share a common origin.

To start the local server, simply clone down the repo and run `npm start`

```
git clone git@github.com:bennypowers/mws-restaurant-stage-1.git
cd mws-restaurant-stage-1
npm i && npm start
```

# HTTPS

The development server is set to serve over http2, which requires a secure connection. In order to make this work locally, you must trust [lws' certicates](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate), or you can use your own [self-signed cert](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-with-a-new-self-signed-certificate).

# Opinions

Throughout this project, we have attempted to express a small number of reasoned opinions about The Right Way™ to do web development:

## Standards
> Whenever possible, prefer standards over bespoke implementations.

When making AJAX requests, prefer native browser APIs over libraries such as `$.ajax()`. Furthermore, prefer recently adopted standards to legacy APIs: use `fetch()` instead of `new XMLHttpRequest()`.

## Browser Support
> Support Evergreen Browsers Only

As long as IE11 support is not a stated requirement, we ignore it, preferring to focus on supporting evergreen browsers instead.

## Polyfills
> Use polyfills to bring browsers up to spec.

Even among evergreen browsers, ES2015 and API support is not uniform, therefore, we use polyfills to bring browsers up to speed.

# Style
> Prefer a functional style over imperative or object oriented

* Whenever possible, prefer to write small. pure transformations.
* Prefer a point-free style so as to make borrowing the functor interface of `Array#map` or `Promise#then` more declarative.
* Prefer to pass generalized curried functions first class over writing case-specific lambdas.
* Make use of functional techniques like function composition.
* Treat Promises like monads, even though they have a [divergent API](https://github.com/promises-aplus/promises-spec/issues/94).
* Try to keep impure code (code that involves side effects like querying the DOM or an external API, or writing changes to the DOM) separate from the pure code.

Having said that, we stop short of incorporating production-ready FP libraries like [Crocks](https://github.com/evilsoft/crocks) or functional templating engines like [lit-html](https://github.com/Polymer/lit-html) for the sake of simplicity. So in cases where FP-purism conflicts with the KISS principle, we opt for simplicity.

# Conformance to the Rubric

The rubric for this stage requires the use of the IndexedDB API. We found we were able to satisfactorily implement all features (offline caching of API requests) using the service worker's `caches` API. Therefore we have submitted two versions of this stage, one that relies on the `caches` API, and one that uses the indexedDB API as required in the rubric. The IDB version is found on the `idb` branch of this repository.

```
git checkout idb
npm start
```
