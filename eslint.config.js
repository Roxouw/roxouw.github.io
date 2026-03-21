const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "assets/images/**",
      "*.min.js",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // 🔥 IMPORTANTE
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      // evita variável esquecida
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // evita bug silencioso
      "no-undef": "error",

      // melhora legibilidade
      "no-var": "error",
      "prefer-const": "warn",

      // console liberado (ok pra teu caso)
      "no-console": "off",
    },
  },
];
