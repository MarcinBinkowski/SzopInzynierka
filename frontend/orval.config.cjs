module.exports = {
  "allauth-headless": {
    input: {
      target: "./allauth_openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/auth",
      schemas: "./src/api/generated/auth/schemas",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/api/auth-mutator.ts",
          name: "authInstance",
        },
      },
    },
  },

  "allauth-headless-zod": {
    input: {
      target: "./allauth_openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/auth",
      fileExtension: ".zod.ts",
      client: "zod",
      mock: false,
      override: {
        zod: {
          generate: {
            body:     true,
            param:    true,
            query:    true,
            response: true,
          },
          coerce: {
            param: true,
            query: true,
          },
        },
      },
    },
  },
   "shop-django": {
    input: {
      target: "./openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/shop",
      schemas: "./src/api/generated/shop/schemas",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/api/shop-mutator.ts",
          name: "shopInstance",
        },
      },
    },
  },

  "shop-django-zod": {
    input: {
      target: "./openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/shop",
      fileExtension: ".zod.ts",
      client: "zod",
      mock: false,
      override: {
        zod: {
          generate: {
            body: true,
            param: true,
            query: true,
            response: true,
          },
          coerce: {
            param: true,
            query: true,
          },
        },
      },
    },
  },
};
