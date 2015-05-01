# Cresc Toccata
**Cresc Toccata** is the utility for [AngularJS >= 1.3.14](https://github.com/angular/angular.js) / [Angular 2](https://github.com/angular/angular).

## Motivation
Migrating to Angular 2 is our concern. We make it possible to perform the migration in stages, we propose The Cresc Toccata [krəs təkάːṭə], call me "Toccata". This is currently aware of TypeScript because of it uses the @Decorators syntax a lot. Also we're going to focus even for use in Babel.

## Usage
In TypeScript or ES6 syntax.

```js
import {toccata as toccata_} from 'toccata';
import * as angular from 'angular'; // AngularJS 1.x
// or 
// import * as angular2 from 'angular2/angular2'; // Angular 2

const toccata = toccata_(angular);
// or 
// const toccata = toccata_(angular2);

const {Component, View, bootstrap} = toccata;
displayMode(toccata);

// The syntax such as Angular 2 in AngularJS 1.x
@Component({
  selector: 'hello'
})
@View({
  template: `<p>Hello!</p>`
})
class HelloController {
  constructor() {
    // noop
  }
}

bootstrap(HelloController);
```

NOTICE: Angular 2 is not supported building with Babel currently, we use ugly hacking for tests. Not recommended still you use in Angular 2.

## TODO

- Support default export of toccata (TypeScript 1.5-alpha has a problem)
- Automatically e2e test (Now it has confirmed manually)
- More migration support and further compatibility
- Support without browserify, in other words support `<script src="">`
- Flux in Angular

## Goal

The migration from smooth AngularJS 1.x to Angular 2.

## Author

- [OKUNOKENTARO (armorik83)](https://github.com/armorik83)

## License

MIT