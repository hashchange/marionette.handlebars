;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' ),
            require( 'handlebars' ),
            require( 'marionette' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone',
            'handlebars',
            'marionette'
        ], factory );

    }
}( this, function ( _, Backbone, Handlebars ) {
    "use strict";

    // @include marionette.handlebars.js

} ));

