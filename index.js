// Подключение пакета dotenv (1/1)
require('dotenv').config()

// ####################### set_up #################################
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors());

app.use(express.json())

// app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));

app.use('/api', router) 

app.use(errorHandler)

app.get('/api', (req, res) => {
  res.send("GET Request Called")
})

const start = async () => {
  try {
      await sequelize.authenticate()
      await sequelize.sync()
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
      console.log(e)
  }
}


start()





