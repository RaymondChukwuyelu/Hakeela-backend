const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

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
    path.join(__dirname, "../routes/authRoutes.js"),
    path.join(__dirname, "../routes/apiRoutes.js"),
    path.join(__dirname, "../routes/userRoute.js"),
  ],
};

module.exports = swaggerJSDoc(options);