// Подключение пакета dotenv (1/1)
require('dotenv').config()

// ####################### set_up #################################
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const path = require('path')



const https = require("https");
// const fs = request("fs");








  const PORT = process.env.PORT || 5000

const app = express()

const fs = require("fs");

// ###################### middleware #############################
// Подключение посредников, порядок подключения влияет на исполнение кода
app.use(cors({
  origin: ['https://kopi34.ru/', 'https://api.kopi34.ru/']
}));
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




const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};
  



// https.createServer(options, app)
// .listen(5000, function (req, res) {
//   console.log("Server started at port 5000");
// });

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))