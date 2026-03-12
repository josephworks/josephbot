import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default {
    files: ["**/*.ts"],
    ignores: ["**/node_modules", "**/dist"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 2024,
        sourceType: "module",
    },

    rules: {
        indent: ["error", 4],
    },
}
