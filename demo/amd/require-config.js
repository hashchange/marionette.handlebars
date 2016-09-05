requirejs.config( {

    baseUrl: '../../',

    paths: {
        "jquery-legacy-v1": "bower_components/jquery-legacy-v1/dist/jquery",
        "jquery-legacy-v2": "bower_components/jquery-legacy-v2/dist/jquery",
        "jquery-modern": "bower_components/jquery/dist/jquery",

        "underscore": "bower_components/underscore/underscore",
        "backbone": "bower_components/backbone/backbone",
        "backbone.radio": "bower_components/backbone.radio/build/backbone.radio",
        "marionette-modern": "bower_components/marionette/lib/backbone.marionette",
        "marionette-legacy": "bower_components/marionette-legacy/lib/backbone.marionette",

        "handlebars-modern": "bower_components/handlebars/handlebars",
        "handlebars-legacy-v2": "bower_components/handlebars-legacy-v2/handlebars",
        "handlebars-legacy-v3": "bower_components/handlebars-legacy-v3/handlebars",

        "backbone.declarative.views": "demo/bower_demo_components/backbone.declarative.views/dist/backbone.declarative.views",
        "marionette.handlebars": "/dist/amd/marionette.handlebars",

        // Pulling in precompiled templates. The templates are compiled with the '--amd' switch, e.g. with
        //
        //     handlebars --amd precompiled.handlebars -f precompiled.js
        //
        // A potential gotcha when compiling: If the file extension is `.handlebars`, the extension is dropped from the
        // template ID in the Handlebars cache (foo.bar.handlebars becomes "foo.bar"). That does _not_ happen if the
        // extension is `.hbs`: foo.bar.hbs becomes "foo.bar.hbs".
        //
        // For more on using precompiled templates, see http://goo.gl/rgNG2Y
        //
        // ATTN:
        //
        // Only the templates defined here, which are loaded by Require.js, are compiled with the '--amd' switch.
        // Compiled templates which are lazy-loaded later on, by the client code in main.js, must be compiled without it!
        //
        // A lazy loader implementation for Marionette.Handlebars must be synchronous. Hence, A(synchronous)MD does not
        // work for it. Granted, the template code could still be injected synchronously, with a synchronous AJAX call
        // (ok so far). But the actual template would be wrapped in a `define` function, which executes async - too late
        // for the loader.
        //
        // Compiling them without the '--amd' switch gets rid of the `define` wrapper. But it creates another problem:
        // Now the templates depend on a `Handlebars` global. Because Handlebars is loaded by Require.js, that global is
        // missing. The client code (in main.js) must expose Handlebars before compiled templates are lazy-loaded. A
        // simple `window.Handlebars = Handlebars;` statement does the trick.

        "precompiled.templates-legacy": "demo/amd/templates/precompiled/legacy/amd/precompiled",
        "precompiled.templates-modern": "demo/amd/templates/precompiled/modern/amd/precompiled",

        "local.main": "demo/amd/main"
    },

    map: {
        "*": {
            // Picking the versions of jQuery and Marionette.
            "jquery": "jquery-modern",
            "marionette": "marionette-modern",

            // Picking the Handlebars version. ATTN:
            // - The handlebars.runtime mapping, below, must point to the same version.
            // - The templates mapping, also below, must be changed accordingly, too.
            "handlebars": "handlebars-modern",

            // Templates precompiled with the --amd switch require 'handlebars.runtime' rather than 'handlebars'. As we
            // don't use the runtime here, we need to map 'handlebars' to a 'handlebars.runtime' alias.
            "handlebars.runtime": "handlebars-modern",

            // Legacy templates, "precompiled.templates-legacy", work for Handlebars <=3. For Handlebars 4, map to
            // "precompiled.templates-modern".
            "precompiled.templates": "precompiled.templates-modern"
        }
    },

    shim: {
        "jquery-legacy-v1": {
            exports: "jQuery"
        },
        "jquery-legacy-v2": {
            exports: "jQuery"
        },
        "jquery-modern": {
            exports: "jQuery"
        },
        "handlebars-legacy-v2": {
            exports: "Handlebars"
        },
        "handlebars-legacy-v3": {
            exports: "Handlebars"
        },
        "handlebars-modern": {
            exports: "Handlebars"
        },

        "marionette": ["backbone.declarative.views"]
    }

} );
