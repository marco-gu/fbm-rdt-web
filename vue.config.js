const { configs } = require("@typescript-eslint/eslint-plugin");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    // chainWebpack: config => {
    //     config.module.rule("images")
    //         .test(/\.(jpg|png|gif|svg)$/)
    //         .use("url-loader")
    //         .loader("url-loader")
    //         .options({
    //             limit: 20 * 1024,
    //             name: 'imgages/[name].[ext]'
    //         })
    // },
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