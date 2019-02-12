
/* eslint-env node */
/* eslint-disable import/no-commonjs */

const DOCS_CONFIG = {
    "presets": ["@babel/preset-env", "@babel/preset-react"]
};

// we need a seperate config for test because Jest no longer packages
// the regenerator runtime, so support for async functions has to be
// grabbed from NodeJS, which requires extra configuration that won't
// work for browsers!
const TEST_CONFIG = {
    "presets": [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-react"
    ]
};

module.exports = api => {
    const isTestEnv = api.env("test");
    return isTestEnv ? TEST_CONFIG : DOCS_CONFIG;
};
