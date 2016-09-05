({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.main",
    excludeShallow: [
        "local.main",
        "precompiled.templates"
    ],
    out: "../../output/parts/vendor.js"
})