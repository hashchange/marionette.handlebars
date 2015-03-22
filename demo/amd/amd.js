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

    var domView, precompiledView, lazyLoadedView,
        Marionette = Backbone.Marionette,
        $container = $( ".content" ),
        BaseView = Marionette.ItemView.extend( {
            tagName: "p"
        } );

    // Implement a lazy template loader.
    Backbone.Marionette.TemplateCache.prototype.getTemplateUrl = function ( templateId, options ) {
        return "templates/raw/" + templateId + ".hbs";
    };

    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function ( templateId, options ) {
        var templateHtml,
            templateUrl = this.getTemplateUrl( templateId, options );

        Backbone.$.ajax( {
            url: templateUrl,
            success: function( data ) {
                templateHtml = data;
            },
            async: false
        } );

        return templateHtml;
    };

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

    show( domView );
    show( precompiledView );
    show( lazyLoadedView );

    function show ( view ) {
        view.render();
        view.$el.appendTo( $container );
    }

    function preloadTemplate ( templateId, deferred ) {
        Marionette.TemplateCache.get( templateId );
        deferred.resolve();
    }

    function createViewWithAsyncTemplate ( config ) {
        // Preload the template before using it in a view. Do it async. Resolve the promise when the template is ready.
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
