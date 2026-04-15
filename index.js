//NECESSARY IMPORTS
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const app = express()
const authRoutes = require("./routes/authRoutes")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec =  require('./config/swagger')

//MIDDLEWARES
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

//MONGODB DATABASE CONNECTION 
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("mongoDB connected succesfully"))
.catch((err) => console.log("mongoDB connection failed", err))

// THE PORT EXPRESS IS LISTENING ON PROD/DEV 
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`))