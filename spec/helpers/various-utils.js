/**
 * Returns the basic Marionette view type: Marionette.ItemView for Marionette 1 and 2, Marionette.View for Marionette 3.
 *
 * @returns {Backbone.Marionette.ItemView|Backbone.Marionette.View}
 */
function getMarionetteView () {
    return Backbone.Marionette.ItemView || Backbone.Marionette.View;
}
