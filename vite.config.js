import vituum from "vituum";
import pug from "@vituum/vite-plugin-pug";
import path from "path";

export default {
    build: {
        assetsInlineLimit: 0,
    },
    plugins: [
        vituum({
            imports: {
                filenamePattern: {
                    "+.css": [],
                    "+.scss": [],
                },
            },
        }),
        pug({ root: "./src" }),
        {
            name: "pug-page-html-name",
            enforce: "post",
            generateBundle: {
                order: "post",
                handler(_, bundle) {
                    const page = Object.values(bundle).find(
                        (file) => file.type === "asset" && file.fileName === "index.pug.html",
                    );

                    if (page) {
                        page.fileName = "index.html";
                    }
                },
            },
        },
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
            "@assets": path.resolve(import.meta.dirname, "src/assets"),
        },
    },
};
