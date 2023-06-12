// Подключение пакета dotenv (1/1)
require('dotenv').config()

// ####################### set_up #################################
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const path = require('path')



const PORT = process.env.PORT || 5000

const app = express()


// ###################### middleware #############################
// Подключение посредников, порядок подключения влияет на исполнение кода
app.use(cors({
  origin: 'https://kopi34.ru'
}));

// app.use((req, res, next) => {
//   res.set('Access-Control-Allow-Origin', 'https://kopi34.ru');
//   // res.set('Access-Control-Allow-Origin', 'https://kopi34.ru');
//   // res.set('Access-Control-Allow-Credentials', 'true');
//   // res.set('Content-Type', 'text/plain')
//   next();
// });



app.use(express.json())

// Подключение хранилища файлов и системы их загрузки
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))



// Подключать предпоследним! - роутер
app.use('/api', router) 
// Подключать последним! - обработка ошибок.

app.get('/', (req, res) => {
  res.send("GET Request Called")
})

// ###################### END ##################################







app.listen(PORT, () => console.log(`Server started on port ${PORT}`))