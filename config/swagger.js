const swaggerJSDoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hakeela API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "https://hakeela-backend.vercel.app/api"
            }
        ],
    },
    apis: ["../routes/*.js"]
}

const swaggerSpec = swaggerJSDoc(options)

module.exports = swaggerSpec