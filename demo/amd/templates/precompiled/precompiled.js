define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['precompiled'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "This paragraph is served with a <strong>"
    + this.escapeExpression(((helper = (helper = helpers.origin || (depth0 != null ? depth0.origin : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"origin","hash":{},"data":data}) : helper)))
    + " template</strong>.";
},"useData":true});
});