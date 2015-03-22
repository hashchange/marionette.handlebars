# Marionette.Handlebars

Marionette.Handlebars does exactly what its name suggests: it adds support for Handlebars and Mustache templates to Marionette. 

Marionette.Handlebars supports [precompiled templates][hlb-precompiled] as well. It does its job entirely behind the scenes – load it, and you are all set.

There really isn't much in terms of an API – nothing, in fact, except for an extension point in case you want to [lazy-load some templates][lazy-loading].

## Dependencies and setup

Marionette.Handlebars, somewhat unsurprisingly, depends on the Marionette stack ([Underscore][], [Backbone][], [Marionette][]) and [Handlebars][]. Include marionette.handlebars.js after those are loaded.

The stable version of Marionette.Handlebars is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install marionette.handlebars`. With npm, it is `npm install marionette.handlebars`.

## Precompiled templates

If you have [precompiled your templates][hlb-precompiled], Marionette.Handlebars retrieves them from the Handlebars cache. All you need to do is set the `template` property of a Marionette view to the ID of the compiled template (derived from the name of the template file). 

## Lazy loading of templates

If you want to lazy-load some of your templates, you must implement a loader which works for your requirements – such as your URL scheme, for instance. Marionette.Handlebars just provides an extension point for you.

A caveat: Loading templates on demand is _terrible_ for the performance of an application. The additional overhead of an HTTP request, particularly on mobile, is way beyond acceptable levels for UI elements which the user is already waiting for. Lazy template loading can make sense, though, for elements which are pre-rendered, but not yet exposed to the user. Use it judiciously.

### How to implement a loader

The method you need to overwrite, `Marionette.TemplateCache.prototype.lazyLoadTemplate`, doesn't do anything out of the box. Replace it with your own implementation. Here is what you need to know.

- Your loader is called with the template ID as the first argument. 

  The template ID is the value of the `template` property, or `template` constructor option, in your Marionette views. The template ID _would_ be a selector if your templates were read from the DOM. But because you provide your own loader, it can be any string you choose.

- Your loader also receives an options argument which is passed around by Marionette. 

  That argument [can initially be provided to][Marionette.TemplateCache-basic-usage] `Marionette.TemplateCache.get()`, but is usually `undefined`. Have a look at the few bits of information [in the Marionette documentation][Marionette.TemplateCache-basic-usage] to get started. 

  Overall, though, the `options` argument is not very useful. Marionette views never pass it in when requesting a template. At a minimum, you'd have to override `Marionette.Renderer.render()` to make it work at all.

- The loader must return the raw template HTML if successful, or `undefined` if it fails to fetch the template.

  For security reasons, you cannot lazy-load compiled templates, ie executable Javascript code. If you want to go down that route, you must override the implementation of `Marionette.TemplateCache.prototype.loadTemplate()` which is provided by Marionette.Handlebars, and roll your own.

- Your loader **must not** be async.

  Yes, synchronous loading is terribly inefficient. But asynchronous template loading is well beyond what a generic Handlebars integration can provide to Marionette views. 

  That said, you can certainly fill in the blanks. If the templates are lazy-loaded asynchronously, the rendering of views must happen async as well. Also, there should probably be a mechanism to prevent multiple requests of the same template URL, which might be happening in parallel. (I have seen [Traffic Cop][traffic-cop] being [mentioned][los-techies-traffic-cop] as a helpful tool, but it seems abandoned. [More here.][traffic-cop-docs])

  A _very_ basic implementation of async loading can be seen [in the AMD demo][amd-demo-async-loading] of Marionette.Handlebars.

Please be aware that the lazy loader is only called as a last resort. The search for a matching template begins in the Handlebars cache of precompiled templates, then moves on to the DOM. Only if the template is not found in any of these places, the lazy loader gets its turn.

### An example

A loader might look like this:

```javascript
Marionette.TemplateCache.prototype.lazyLoadTemplate = function ( templateId, options ) {
    var templateHtml,
        templateUrl = "templates/" + templateId + ".hbs";
      
    Backbone.$.ajax( {
        url: templateUrl,
        success: function( data ) {
            templateHtml = data;
        },
        async: false
    } );
    
    return templateHtml;
};
```

This is a very basic implementation. In real life, there should probably be a mechanism to prevent multiple requests of the same URL, which might be happening in parallel. (I have seen [Traffic Cop][traffic-cop] being [mentioned][los-techies-traffic-cop] as a helpful tool, but it seems abandoned. [More here.][traffic-cop-docs])

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone, edit `bower.json` first.

### Running tests, creating a new build

#### Considerations for testing

To run the tests on remote clients (e.g. mobile devices), start a web server with `grunt interactive` and visit `http://[your-host-ip]:9400/web-mocha/` with the client browser. Running the tests in a browser like this is slow, so it might make sense to disable the power-save/sleep/auto-lock timeout on mobile devices. Use `grunt test` (see below) for faster local testing.

#### Tool chain and commands

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- If the live reload bothers you, you can also run the tests in a browser without it: `grunt webtest`.
- Run the linter only with `grunt lint` or `grunt hint`. (The linter is part of `grunt test` as well.)
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## License

MIT.

Copyright (c) 2015 Michael Heim.

[dist-dev]: https://raw.github.com/hashchange/marionette.handlebars/master/dist/marionette.handlebars.js "marionette.handlebars.js"
[dist-prod]: https://raw.github.com/hashchange/marionette.handlebars/master/dist/marionette.handlebars.min.js "marionette.handlebars.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/marionette.handlebars/master/dist/amd/marionette.handlebars.js "marionette.handlebars.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/marionette.handlebars/master/dist/amd/marionette.handlebars.min.js "marionette.handlebars.min.js, AMD build"

[amd-demo-async-loading]: https://github.com/hashchange/marionette.handlebars/blob/master/demo/amd/amd.js#L134-149 "Marionette.Handlebars: AMD demo – Async view creation"

[lazy-loading]: #lazy-loading-of-templates

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Underscore]: http://underscorejs.org/ "Underscore.js"
[Marionette]: http://marionettejs.com/ "Marionette.js – The Backbone Framework"
[Handlebars]: http://handlebarsjs.com/ "Handlebars.js – Minimal Templating on Steroids"
[hlb-precompiled]: http://handlebarsjs.com/precompilation.html "Handlebars.js: Precompiling templates"
[Marionette.TemplateCache-basic-usage]: http://marionettejs.com/docs/marionette.templatecache.html#basic-usage "Marionette.TemplateCache: Basic Usage"
[traffic-cop]: https://github.com/ifandelse/TrafficCop "Traffic Cop – Simple js lib to prevent multiple simultaneous client requests to same HTTP endpoint"
[traffic-cop-docs]: http://web.archive.org/web/20130224223736/http://freshbrewedcode.com/jimcowart/2011/11/25/traffic-cop/ "Jim Cowart: Traffic Cop"
[los-techies-traffic-cop]: http://lostechies.com/derickbailey/2012/03/20/trafficcop-a-jquery-plugin-to-limit-ajax-requests-for-a-resource/ " Derick Bailey – TrafficCop: A jQuery Plugin To Limit AJAX Requests For A Resource"

[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha – the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS – Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"