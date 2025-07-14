module.exports = {
  // 'shop-django': {
  //   input: './openapi.json',
  //   output: {
  //     mode: 'tags-split',
  //     target: './src/api/generated',
  //     schemas: './src/api/generated/schemas',
  //     client: 'react-query',
  //     mock: false,
  //     override: {
  //       mutator: {
  //         path: './src/api/mutator.ts',
  //         name: 'customInstance',
  //       },
  //       zod: {
  //         generate: {
  //           body: true,
  //           param: true,
  //           query: true,
  //           response: true,
  //         },
  //         coerce: {
  //           param: true,
  //           query: true,
  //         },
  //       },
  //     },
  //   },
  // },
  'allauth-headless': {
    input: './allauth_openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/api/generated/auth',
      schemas: './src/api/generated/auth/schemas',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './src/api/auth-mutator.ts',
          name: 'authInstance',
        },
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