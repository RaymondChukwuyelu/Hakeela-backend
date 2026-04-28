const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hakeela API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://hakeela-backend.vercel.app/api",
      },
    ],
  },

  apis: [
    "../routes/authRoutes.js",
    "../routes/apiRoutes.js",
    "../routes/userRoute.js",
  ],
};

module.exports = swaggerJSDoc(options);