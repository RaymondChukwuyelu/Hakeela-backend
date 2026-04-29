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
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: '/api-docs/swagger.json',
      persistAuthorization: true
    }
  })
);
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api', apiRoutes)
//MONGODB DATABASE CONNECTION 
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

  } catch (err) {
    console.log("MongoDB connection failed", err);
  }
};

startServer();

module.exports = app