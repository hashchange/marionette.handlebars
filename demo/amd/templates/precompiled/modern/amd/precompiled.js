define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['precompiled'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "This paragraph is served with a <strong>"
    + container.escapeExpression(((helper = (helper = helpers.origin || (depth0 != null ? depth0.origin : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"origin","hash":{},"data":data}) : helper)))
    + " template</strong>.";
},"useData":true});
});