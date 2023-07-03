const uuid = require('uuid');
const path = require('path');
const {Device, User} = require('../models/models');
const ApiError = require('../error/ApiError');


const fetch = require('node-fetch');

/*
* 1. Клиенты
*       - post - заказ со страниц заказа
*       - get - подтверждение оплаты заказа
*
* 2. Администраторы
*       - get - таблица с заказами
*           - изменить статус готовностио
*       - 
*
*/


class DeviceController {


// (1)  POST - http://localhost:5000/api/device/ - Покупка отдельных товаров с занесением в базу данных
        async testFirst(req, res, next) { // Done
            const {value, description, tel} = req.body;
            // console.log(req.files.img)
            // const img = req.files.img;      
            // const fileName = uuid.v4() + ".jpg"
            // img.mv(path.resolve(__dirname, '..', 'static', fileName))
            return res.json({value, description, tel})
        }


// (2)  POST - http://localhost:5000/api/device/ - Покупка отдельных товаров с занесением в базу данных
        async homePage(req, res, next) { // Done

                    const {name, value, description, userId} = req.body;
                    
                    const img = req.files.img;      
                    const fileName = uuid.v4() + ".jpg"
                    img.mv(path.resolve(__dirname, '..', 'static', fileName))

                    const user = await User.findOne({where: {id: userId}})
                    const userDescription = `Имя клиента: ${user.name}; ID-клиента: ${user.id}; Телефон клиента: ${user.phone}; Email клиента: ${user.email}; Адрес клиента: ${user.address};`;

                    const device = await Device.create({name, feature: description, userDescription: userDescription, img: fileName});



                // Send to YOOMONEY
                    const payV = String(value);
                    const IdempotenceKey = uuid.v4();
                    const headersP = {
                    'Content-Type':'application/json',
                    'Idempotence-Key': IdempotenceKey,
                // TODO - Заменить открытые пароли на env
                    'Authorization': 'Basic ' + btoa(process.env.MARKET_ID+':'+process.env.SECRET_KEY_UMONEY)
                    };
                    const inputBodyP = {
                        "amount": {
                            "value": payV,
                            "currency": 'RUB'
                        },
                        "payment_method_data": {
                            "type": 'bank_card'
                        },
                        "confirmation": {
                            "type": 'redirect',
                            "return_url": 'https://kopi34.ru'
                        }
                    };

                    fetch('https://api.yookassa.ru/v3/payments',
                    {
                    method: 'POST',
                    body: JSON.stringify(inputBodyP),
                    headers: headersP
                    })
                    .then(function(res) {
                        return res.json();
                    }).then(function(body) {
                    return res.json(body)
                    });
        }


// (3) GET: - http://localhost:5000/api/device/device-view/:id - подтверждение оплаты заказа
        async getPay(req, res, next) { // Done

          const headersP = {
            'Authorization': 'Basic ' + btoa('322722:live_k25GTirGEy6mpQ9SrTNrIVf1XX9spgXAWz96GBER9UQ')
          };
          
          const {payinfo} = req.body;
          
          console.log(payinfo)
          fetch('https://api.yookassa.ru/v3/payments/'+payinfo,
          {
            method: 'GET',
            headers: headersP
            
          })
          .then(function(res) {
              return res.json();
          }).then(function(body) {
            return res.json(body)
          });
        }


// (4) GET: - http://localhost:5000/api/device/admin/devices-view/ - Просмотр всех заказов
        async allOrdersAdmin(req, res, next) { // Done
            // createdAt
            
            let {itemSort, orderSort, limit, page} = req.query
            page = page || 1
            limit = limit || 10
            itemSort = itemSort || 'ASC'
            orderSort = orderSort || 'createdAt'
            let offset = page * limit - limit
            let devices;
            
            devices = await Device.findAndCountAll({order: [[itemSort, orderSort]], limit, offset});
            console.log(devices)
            return res.json(devices)
        }


}

module.exports = new DeviceController()
