// Marionette.Handlebars, v2.0.0
// Copyright (c) 2015-2016 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/marionette.handlebars

;( function ( root, factory ) {
    "use strict";

    // UMD for a Marionette plugin. Supports AMD, Node.js, CommonJS and globals.
    //
    // - Code lives in the Marionette namespace.
    // - The module does not export a meaningful value.
    // - The module does not create a global.

    var supportsExports = typeof exports === "object" && exports && !exports.nodeType && typeof module === "object" && module && !module.nodeType;

    // AMD:
    // - Some AMD build optimizers like r.js check for condition patterns like the AMD check below, so keep it as is.
    // - Check for `exports` after `define` in case a build optimizer adds an `exports` object.
    // - The AMD spec requires the dependencies to be an array **literal** of module IDs. Don't use a variable there,
    //   or optimizers may fail.
    if ( typeof define === "function" && typeof define.amd === "object" && define.amd ) {

        // AMD module
        define( [ "exports", "underscore", "backbone", "handlebars", "marionette" ], factory );

    } else if ( supportsExports ) {

        // Node module, CommonJS module
        factory( exports, require( "underscore" ), require( "backbone" ), require( "handlebars" ), require( "marionette" ) );

    } else  {

        // Global (browser or Rhino)
        factory( {}, _, Backbone, Handlebars );

    }

}( this, function ( exports, _, Backbone, Handlebars ) {
    "use strict";

    var origLoadTemplate,
        Marionette = Backbone.Marionette;

    if ( ! Marionette ) throw new Error( "Load error: Backbone.Marionette is not available" );

    origLoadTemplate = Marionette.TemplateCache.prototype.loadTemplate;

    /** @type {boolean}  flag allowing the lazy loading of compiled templates */
    Marionette.TemplateCache.allowCompiledTemplatesOverHttp = false;

    Marionette.TemplateCache.MarionetteHandlebarsVersion = "2.0.0";

    _.extend( Marionette.TemplateCache.prototype, {

        /**
         * Loads and returns a template from the Handlebars cache, the DOM, or the server (if set up to do so). Throws
         * an error if the template can't be found.
         *
         * Unlike the original Marionette implementation, this version of loadTemplate does not always return the raw
         * template HTML. If the template is fetched from the Handlebars cache of precompiled templates, it is returned
         * as is, ie as a compiled template function.
         *
         * That does not cause issues in Marionette.TemplateCache, as long as the compileTemplate function can handle it
         * correctly. (And here, it obviously does.)
         *
         * If a template can't be found in either the Handlebars cache or the DOM, the job is passed on to the
         * lazyLoadTemplate() method. It is a noop by default. To use an actual loader and make it work for your needs,
         * assign your own implementation to Marionette.TemplateCache.prototype.lazyLoadTemplate.
         *
         * @param   {string}           templateId  a selector, usually, or the file ID if the Handlebars cache is used
         * @param   {Object|undefined} options
         * @returns {string|Function}
         */
        loadTemplate: function ( templateId, options ) {
            var templateHtml,
                precompiledTemplate = this.getPrecompiledTemplate( templateId );

            if ( ! precompiledTemplate || ! _.isFunction( precompiledTemplate ) ) {
                try {
                    templateHtml = origLoadTemplate.call( this, templateId, options );
                } catch ( err ) {}

                if ( ! isValidTemplateHtml( templateHtml ) ) templateHtml = this.lazyLoadTemplate( templateId, options );

                // Throw an error if the template is missing, just like the original implementation.
                if ( ! isValidTemplateReturnValue( templateHtml ) ) this.throwTemplateError( templateId );
            }

            return templateHtml || precompiledTemplate;
        },

        /**
         * Returns the compiled template.
         *
         * Unlike the original Marionette implementation, the method does not just accept a raw template HTML string as
         * its first argument, but an existing precompiled template as well. Such a template function is simply returned
         * as it is.
         *
         * @param   {string|Function}  template
         * @param   {Object|undefined} options
         * @returns {Function}
         */
        compileTemplate: function ( template, options ) {
            return _.isFunction( template ) ? template : Handlebars.compile( template, options );
        },

        /**
         * Returns the precompiled Handlebars template for a given template ID, if it exists.
         *
         * NB In this case, the template ID is not a selector, but derived from the file name of the original template.
         * See http://handlebarsjs.com/precompilation.html
         *
         * Override it if you have to perform some special magic for matching a Marionette templateId to the templateId
         * of the Handlebars cache.
         *
         * @param   {string} templateId
         * @returns {Function|undefined}
         */
        getPrecompiledTemplate: function ( templateId ) {
            return Handlebars.templates && Handlebars.templates[templateId];
        },

        /**
         * Lazy-load the template.
         *
         * Noop by default. Provide your own loader by implementing this method. It must return the templateHtml if
         * successful, or undefined otherwise. And it MUST NOT be async (set async: false in an $.ajax() call).
         *
         * @param   {string}           templateId
         * @param   {Object|undefined} options
         * @returns {string|undefined}
         */
        lazyLoadTemplate: function ( templateId, options ) {
            return undefined;
        },

        /**
         * Throws a NoTemplateError in a way which is compatible with any Marionette version.
         *
         * @param {string} templateId
         */
        throwTemplateError: function ( templateId ) {

            var errType = 'NoTemplateError',
                errMsg = 'Could not load template: "' + templateId + '". It does not exist, is of an illegal type, or has content which cannot be processed.';

            if ( Marionette.Error ) {
                // Error handling in Marionette 2.x
                throw new Marionette.Error( { name: errType, message: errMsg } );
            } else if ( typeof throwError === "function" ) {
                // Error handling in Marionette 1.x
                throwError( errMsg, errType );                                              // jshint ignore:line
            } else {
                // Being future proof, we throw our own errors if all else has failed
                throw new Error( errMsg );
            }

        }

    } );

    /**
     * Checks if the template data is a non-empty string.
     *
     * @param   {*} templateData
     * @returns {boolean}
     */
    function isValidTemplateHtml ( templateData ) {
        return _.isString( templateData ) && templateData.length > 0;
    }

    /**
     * Checks if the template data is a valid return value for loadTemplate().
     *
     * - A non-empty string always passes the test. This is the format of raw template HTML.
     * - A function may or may not be acceptable, depending on the allowCompiledTemplatesOverHttp flag.
     *
     * @param   {*} templateData
     * @returns {boolean}
     */
    function isValidTemplateReturnValue ( templateData ) {
        return isValidTemplateHtml( templateData ) || Marionette.TemplateCache.allowCompiledTemplatesOverHttp && _.isFunction( templateData );
    }


    // Module return value
    // -------------------
    //
    // A return value may be necessary for AMD to detect that the module is loaded. It ony exists for that reason and is
    // purely symbolic. Don't use it in client code. The functionality of this module lives in the Backbone namespace.
    exports.info = "Marionette.Handlebars has loaded. Don't use the exported value of the module. Its functionality is available inside the Backbone namespace.";

} ) );
