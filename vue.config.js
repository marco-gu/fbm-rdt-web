const { configs } = require("@typescript-eslint/eslint-plugin");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: ["quasar"],
    pluginOptions: {
        quasar: {
            importStrategy: "kebab",
            rtlSupport: false,
        },
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `
          @import "@/styles/index.scss";
        `,
            },
        },
    },



});