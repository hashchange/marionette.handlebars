/*global describe, it, $ */
(function () {
    "use strict";

    function isMarionette1x () {
        return ! Backbone.Marionette.VERSION;
    }

    describe( 'Marionette.Handlebars', function () {

        var $template, domTemplateHtml, precompiledTemplateHtml, precompiled;

        beforeEach( function () {

            // Template in the DOM.
            domTemplateHtml = "A template with {{content}} in the DOM.";
            $template = $( '<script id="template" type="text/x-template"></script>' )
                .html( domTemplateHtml )
                .appendTo( "body" );

            // Faking a precompiled template here.
            Handlebars.templates || ( Handlebars.templates = {} );

            precompiledTemplateHtml = "A fake precompiled template with {{content}}, stored in the cache of Handlebars.";
            precompiled = Handlebars.templates[ "fake.precompiled" ] = Handlebars.compile( precompiledTemplateHtml );

            // Spies
            sinon.spy( Backbone.Marionette.TemplateCache.prototype, "loadTemplate" );
            sinon.spy( Backbone.Marionette.TemplateCache.prototype, "compileTemplate" );
            sinon.spy( Handlebars, "compile" );
        } );

        afterEach( function () {
            $template.remove();
            Backbone.Marionette.TemplateCache.clear();
            delete Handlebars.templates;

            Backbone.Marionette.TemplateCache.prototype.loadTemplate.restore();
            Backbone.Marionette.TemplateCache.prototype.compileTemplate.restore();
            Handlebars.compile.restore();
        } );

        describe( 'Templates in the DOM', function () {

            describe( 'If a template is defined by a selector which matches a template in the DOM', function () {

                var returnedFromCache;

                beforeEach( function () {
                    returnedFromCache = Backbone.Marionette.TemplateCache.get( "#template" );
                } );

                it( 'it is returned by loadTemplate()', function () {
                    expect( Backbone.Marionette.TemplateCache.prototype.loadTemplate ).to.have.returned( domTemplateHtml );
                } );

                it( 'it is passed to the compileTemplate() method as the template argument', function () {
                    expect( Backbone.Marionette.TemplateCache.prototype.compileTemplate ).to.have.been.calledWith( domTemplateHtml );
                } );

                it( 'it is passed to the Handlebars.compile() as the template argument', function () {
                    expect( Handlebars.compile ).to.have.been.calledWith( domTemplateHtml );
                } );

                it( 'shows up in the compiled template returned by Marionette.TemplateCache.get()', function () {
                    var compiled = Handlebars.compile( domTemplateHtml ),
                        templateVars = { content: "amazing content" };

                    expect( returnedFromCache( templateVars ) ).to.equal( compiled( templateVars ) );
                } );

                it( 'it is used by a Marionette view if its template property has been set to the selector of the template', function () {
                    var compiled = Handlebars.compile( domTemplateHtml ),
                        content = { content: "amazing content" },
                        view = new Backbone.Marionette.ItemView( {
                            template: "#template",
                            model: new Backbone.Model( content )
                        } );

                    view.render();
                    expect( view.$el.html() ).to.equal( compiled( content ) );
                } );

            } );

            describe( 'If the template is requested with an options object', function () {

                var options;

                beforeEach( function () {
                    options = {
                        data: { level: Handlebars.logger.WARN }
                    };
                    Backbone.Marionette.TemplateCache.get( "#template", _.clone( options ) );
                } );

                itUnless( isMarionette1x(), "Skipped test. Options are not supported in Marionette 1.x",
                    'the options object is passed on to Handlebars when the template is being compiled', function () {
                        expect( Handlebars.compile ).to.have.been.calledWithExactly( domTemplateHtml, options );
                    }
                );

            } );

        } );

        describe( 'Precompiled templates', function () {

            describe( 'If a template is in the Handlebars template cache', function () {

                var returnedFromCache;

                beforeEach( function () {
                    returnedFromCache = Backbone.Marionette.TemplateCache.get( "fake.precompiled" );
                } );

                it( 'it is returned by loadTemplate()', function () {
                    expect( Backbone.Marionette.TemplateCache.prototype.loadTemplate ).to.have.returned( precompiled );
                } );

                it( 'it is passed to the compileTemplate() method as the template argument', function () {
                    expect( Backbone.Marionette.TemplateCache.prototype.compileTemplate ).to.have.been.calledWith( precompiled );
                } );

                it( 'it is returned by compileTemplate(), without a recompilation having taken place', function () {
                    // Ie, compileTemplate must return the exact same function object
                    expect( Backbone.Marionette.TemplateCache.prototype.compileTemplate ).to.have.returned( precompiled );
                } );

                it( 'it is returned by Marionette.TemplateCache.get()', function () {
                    expect( returnedFromCache ).to.equal( precompiled );
                } );

                it( 'it is used by a Marionette view if its template property has been set to the ID of the cached template', function () {
                    var content = { content: "amazing content" },
                        view = new Backbone.Marionette.ItemView( {
                            template: "fake.precompiled",
                            model: new Backbone.Model( content )
                        } );

                    view.render();
                    expect( view.$el.html() ).to.equal( precompiled( content ) );
                } );

                it( 'it takes precedence over a template in the DOM with the same template ID', function () {
                    Handlebars.templates[ "#template" ] = Handlebars.compile( precompiledTemplateHtml );
                    expect( Backbone.Marionette.TemplateCache.get( "#template" ) ).to.equal( Handlebars.templates[ "#template" ] );
                } );

            } );

        } );

        describe( 'Custom lazy loader', function () {

            var defaultNoopLazyLoader;

            beforeEach( function () {
                defaultNoopLazyLoader = Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate;
            } );

            afterEach( function () {
                Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = defaultNoopLazyLoader;
            } );

            describe( 'The lazyLoadTemplate() method is not called', function () {

                beforeEach( function () {
                    sinon.spy( Backbone.Marionette.TemplateCache.prototype, "lazyLoadTemplate" );
                } );

                afterEach( function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate.restore();
                } );

                it( 'if a matching template is found in the cache of Handlebars for precompiled templates', function () {
                    Backbone.Marionette.TemplateCache.get( "fake.precompiled" );
                    expect( Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate ).not.to.have.been.called;
                } );

                it( 'if the template is found in the DOM', function () {
                    Backbone.Marionette.TemplateCache.get( "#template" );
                    expect( Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate ).not.to.have.been.called;
                } );

            } );

            describe( 'The lazyLoadTemplate() method receives', function () {

                beforeEach( function () {
                    sinon.spy( Backbone.Marionette.TemplateCache.prototype, "lazyLoadTemplate" );
                } );

                afterEach( function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate.restore();
                } );

                it( 'the template ID as the first argument', function () {
                    // We ask for a template which doesn't exist in either the Handlebars template cache or the DOM,
                    // so that the query is forwarded to the lazy loader. Because we use the default no-op loader,
                    // we need to catch the resulting no-template error.
                    try {
                        Backbone.Marionette.TemplateCache.get( "fictional.id" );
                    } catch ( err ) {}

                    expect( Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate ).to.have.been.calledWith( "fictional.id" );
                } );

                itUnless( isMarionette1x(), "Skipped test. Options are not supported in Marionette 1.x",
                    'an options object as second argument, if passed to Marionette.TemplateCache.get()', function () {
                        var options = { foo: "bar" };
                        try {
                            Backbone.Marionette.TemplateCache.get( "fictional.id", _.clone( options ) );
                        } catch ( err ) {}

                        expect( Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate ).to.have.been.calledWithExactly( "fictional.id", options );
                    }
                );

            } );

            describe( 'The lazyLoadTemplate() method triggers a friendly error in subsequent processing', function () {

                var lazyLoadedTemplateId, expectedError;

                beforeEach( function () {
                    lazyLoadedTemplateId = "lazyLoaded";
                    expectedError = 'Could not find template: "' + lazyLoadedTemplateId + '"';
                } );

                it( 'if its return value is undefined', function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function () { return undefined; };
                    expect( function () { Backbone.Marionette.TemplateCache.get( lazyLoadedTemplateId ); } ).to.throw( expectedError );
                } );

                it( 'if its return value is false', function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function () { return false; };
                    expect( function () { Backbone.Marionette.TemplateCache.get( lazyLoadedTemplateId ); } ).to.throw( expectedError );
                } );

                it( 'if its return value is not a string', function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function () { return { foo: "bar" }; };
                    expect( function () { Backbone.Marionette.TemplateCache.get( lazyLoadedTemplateId ); } ).to.throw( expectedError );
                } );

                it( 'if its return value is an empty string', function () {
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function () { return ""; };
                    expect( function () { Backbone.Marionette.TemplateCache.get( lazyLoadedTemplateId ); } ).to.throw( expectedError );
                } );

            } );

            describe( 'The return value of lazyLoadTemplate()', function () {

                var lazyLoadedTemplateHtml, returnedFromCache;

                beforeEach( function () {
                    lazyLoadedTemplateHtml = "A fake lazy-loaded template with {{content}}.";
                    Backbone.Marionette.TemplateCache.prototype.lazyLoadTemplate = function () { return lazyLoadedTemplateHtml; };

                    returnedFromCache = Backbone.Marionette.TemplateCache.get( "lazyLoaded" );
                } );

                it( 'is passed to the compileTemplate() method as the template argument', function () {
                    expect( Backbone.Marionette.TemplateCache.prototype.compileTemplate ).to.have.been.calledWith( lazyLoadedTemplateHtml );
                } );

                it( 'shows up in the compiled template returned by Marionette.TemplateCache.get()', function () {
                    var compiled = Handlebars.compile( lazyLoadedTemplateHtml ),
                        templateVars = { content: "amazing content" };

                    expect( returnedFromCache( templateVars ) ).to.equal( compiled( templateVars ) );
                } );

                it( 'is used by a Marionette view if its template property has been set to the ID of a lazy-loaded template', function () {
                    // Along the way, we check that the Marionette view can deal with an entirely arbitrary ID string
                    // without any hiccups.
                    var compiled = Handlebars.compile( lazyLoadedTemplateHtml ),
                        content = { content: "amazing content" },
                        view = new Backbone.Marionette.ItemView( {
                            template: "a! very! weird! template! id!",
                            model: new Backbone.Model( content )
                        } );

                    view.render();
                    expect( view.$el.html() ).to.equal( compiled( content ) );
                } );

            } );

        } );

        describe( 'Load errors', function () {

            describe( 'A friendly error is thrown', function () {

                it( 'if the template cannot be found', function () {
                    var templateId = "nonexistent";
                    expect( function () { Backbone.Marionette.TemplateCache.get( templateId ); } ).to.throw( 'Could not find template: "' + templateId + '"' );
                } );

            } );

        } );

    } );

})();