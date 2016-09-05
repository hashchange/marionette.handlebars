({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.main",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.radio",
        "marionette",
        "handlebars",
        "handlebars.runtime",
        "backbone.declarative.views",
        "marionette.handlebars"
    ],
    out: "../../output/parts/app.js"
})