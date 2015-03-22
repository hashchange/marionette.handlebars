require( [

    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'marionette',
    'backbone.declarative.views',
    'precompiled.templates',
    'marionette.handlebars'

], function ( $, _, Backbone, Handlebars ) {

    var domView, precompiledView, lazyLoadedView, lazyLoadedPrecompiledView,

        Marionette = Backbone.Marionette,
        $container = $( ".content" ),
        BaseView = Marionette.ItemView.extend( {
            tagName: "p"
        } );

    // Allow lazy loading of compiled templates
    Backbone.Marionette.TemplateCache.allowCompiledTemplatesOverHttp = true;

    // Expose Handlebars as a browser global. Makes lazy-loading of *compiled* templates possible.
    //
    // See explanation in require-config.js. By contrast, raw HTML templates (ie strings, not code) can be lazy-loaded
    // without a global.
    window.Handlebars = Handlebars;

    // Implement a lazy template loader.
    _.extend( Backbone.Marionette.TemplateCache.prototype, {

        isPrecompiled: function ( templateId ) {
            return templateId.substr( -3 ) === ".js";
        },

        getTemplateUrl: function ( templateId, options ) {
            var isPrecompiled = this.isPrecompiled( templateId ),
                prefix = isPrecompiled ? "templates/precompiled/non-amd/" : "templates/raw/",
                suffix = isPrecompiled ? "" : ".hbs";

            return prefix + templateId + suffix;
        },

        lazyLoadTemplate: function ( templateId, options ) {
            var templateHtml, compiledTemplate,
                isPrecompiled = this.isPrecompiled( templateId ),
                templateUrl = this.getTemplateUrl( templateId, options );

            if ( isPrecompiled ) {

                this.loadResource( { url: templateUrl, isJavascript: true } );

                // The $.ajax call returns a precompiled template as a string, not as Javascript code. We simply throw
                // the string away.
                //
                // But the code has also been executed, which means that it has been added to the Handlebars cache. We
                // must read it from the cache now.
                //
                // Our template IDs for precompiled templates end in ".js" because we needed to fetch the actual files.
                // In the Handlebars cache, the ".js" file extension not part of the ID. We need to remove it before
                // querying the cache.
                templateId = templateId.slice( 0, -3 );
                compiledTemplate = this.getPrecompiledTemplate( templateId );

            } else {

                // Loading a raw HTML template (ie, a string).
                templateHtml = this.loadResource( { url: templateUrl, isJavascript: false } );

            }

            return templateHtml || compiledTemplate;
        },

        loadResource: function ( config ) {
            var content;

            Backbone.$.ajax( {
                url: config.url,
                success: function ( data ) { content = data },

                async: false,
                cache: true,
                dataType: config.isJavascript ? "script" : "text"
            } );

            return content;
        }

    } );

    // Load templates in various ways

    // Load a template from the DOM.
    //
    // The el is defined by the template in this case, using Backbone.Declarative.Views. Hence, we use a plain ItemView,
    // rather than the BaseView which also defines the el.
    domView = new Marionette.ItemView( {
        model: new Backbone.Model( { origin: "DOM-based" } ),
        template: "#dom-template"
    } );

    // Load a precompiled template
    precompiledView = new BaseView( {
        model: new Backbone.Model( { origin: "precompiled" } ),
        template: "precompiled"
    } );

    // Lazy-load a template
    lazyLoadedView= new BaseView( {
        model: new Backbone.Model( { origin: "lazy-loaded" } ),
        template: "lazy-loaded"
    } );

    // Lazy-load a template asynchronously
    createViewWithAsyncTemplate( {
        ViewClass: BaseView,
        model: new Backbone.Model( { origin: "lazy-loaded" } ),
        templateId: "lazy-loaded-async"
    } );

    // Lazy-load a precompiled template
    lazyLoadedPrecompiledView = new BaseView( {
        model: new Backbone.Model( { origin: "lazy-loaded" } ),
        template: "lazy-loaded-precompiled.js"
    } );

    // Lazy-load a precompiled template async
    createViewWithAsyncTemplate( {
        ViewClass: BaseView,
        model: new Backbone.Model( { origin: "lazy-loaded" } ),
        templateId: "lazy-loaded-precompiled-async.js"
    } );

    // Show the synchronous views (the async ones have been handled inside createViewWithAsyncTemplate()).
    addHeadline( "Preloaded" );
    show( domView );
    show( precompiledView );
    addHeadline( "Lazy-loaded" );
    show( lazyLoadedView );
    show( lazyLoadedPrecompiledView );
    addHeadline( "Async lazy-loaded" );

    function addHeadline ( text ) {
        $( "<h2/>" ).text( text ).wrapInner( "<small/>").appendTo( $container );
    }

    function show ( view ) {
        view.render();
        view.$el.appendTo( $container );
    }

    function preloadTemplate ( templateId, deferred ) {
        Marionette.TemplateCache.get( templateId );
        deferred.resolve();
    }

    function createViewWithAsyncTemplate ( config ) {
        // Preload the template before using it in a view. Do it async. Delay the creation of the view until the
        // template has arrived in the cache.
        //
        // The templateLoaded promise triggers view creation. The helper function preloadTemplate() receives the promise
        // and resolves it when the template is ready.
        var templateLoaded = new Backbone.$.Deferred( function ( deferred ) {
            setTimeout( _.partial( preloadTemplate, config.templateId, deferred ), 0 );
        } );

        templateLoaded.done( function () {

            var view = new config.ViewClass( {
                model: config.model,
                template: config.templateId
            } );

            show( view );
        } );
    }

} );
