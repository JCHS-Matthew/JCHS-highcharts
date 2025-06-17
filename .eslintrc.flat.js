// .eslintrc.flat.js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ recommendedConfig: "eslint:recommended" });

export default [
  ...compat.env({
    es6: true,
    jquery: true,
    qunit: true
  }),
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        Highcharts: "readonly"
      }
    },
    rules: {
      indent: ["warn", 2],
      semi: ["warn", "never"],
      "no-confusing-arrow": "warn",
      "no-magic-numbers": "off"
    }
  }
];
