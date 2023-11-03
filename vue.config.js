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
    chainWebpack: config => {
        config.resolve.alias.set("vue-i18n", "vue-i18n/dist/vue-i18n.cjs.js")
    },
    devServer: {
        proxy: {
            "^/workflow": {
                target: "http://101.132.69.151:8100/fbm-wms-rdt/RDTEngine/",
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    "^/workflow": ""
                },
                logLevel: "debug"
            }
        }
    },
})