//NECESSARY IMPORTS
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors');
const app = express()
const authRoutes = require("./routes/authRoutes")
const userRoutes =  require("./routes/userRoute")
const apiRoutes = require("./routes/apiRoutes")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec =  require('./config/swagger')

//MIDDLEWARES
app.use(express.json())
app.use(cors());
app.use(cookieParser())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api', apiRoutes)
//MONGODB DATABASE CONNECTION 
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("mongoDB connected succesfully"))
.catch((err) => console.log("mongoDB connection failed", err))

module.exports = app