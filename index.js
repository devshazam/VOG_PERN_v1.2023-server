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





// ###################### middleware #############################
// Подключение посредников, порядок подключения влияет на исполнение кода
app.use(cors({
  origin: ["https://kopi34.ru","http://localhost:3000"] 
}));


app.use(express.json())



// Подключение хранилища файлов и системы их загрузки
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))



// Подключать предпоследним! - роутер
app.use('/api', router) 
// Подключать последним! - обработка ошибок.
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send("GET Request Called")
})

// ###################### END ##################################



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





