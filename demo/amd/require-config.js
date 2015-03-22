requirejs.config( {

    baseUrl: '../../bower_components',

    paths: {
        // Using a different jQuery here than elsewhere (1.x, instead of 2.x in node_modules).
        // Makes the demo work in oldIE, too.
        'jquery': '../demo/bower_demo_components/jquery/dist/jquery',

        'underscore': 'underscore/underscore',
        'backbone': 'backbone/backbone',
        'marionette': 'marionette/lib/backbone.marionette',
        'handlebars': 'handlebars/handlebars',
        'backbone.declarative.views': '../demo/bower_demo_components/backbone.declarative.views/dist/amd/backbone.declarative.views',
        'marionette.handlebars': '/dist/amd/marionette.handlebars',

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
        // Alternatively, there are a number of plugins handling precompiled templates:
        //
        // - SlexAxton/require-handlebars-plugin
        // - epeli/requirejs-hbs
        //
        // ... and probably more. Not used here, though.
        'precompiled.templates': '../demo/amd/templates/precompiled/precompiled'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'handlebars': {
            exports: 'Handlebars'
        }
    },

    // Templates precompiled with the --amd switch require 'handlebars.runtime' rather than 'handlebars'. As we don't
    // use the runtime here, we need to map 'handlebars' to a 'handlebars.runtime' alias.
    map: {
        '*': {
            'handlebars.runtime': 'handlebars'
        }
    }

} );
