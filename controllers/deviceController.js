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
                        "capture": true,
                        // "payment_method_data": {
                        //     "type": 'bank_card'
                        // },
                        "confirmation": {
                            "type": 'redirect',
                            "return_url": 'https://kopi34.ru/payinfo/'
                        },
                        "description": device.id,
                        "metadata": {
                            "order_id": device.id
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


// (3) POST: - http://localhost:5000/api/device/getpay - подтверждение оплаты заказа
        async getPay(req, res, next) { // Done

          const headersP = {
            'Authorization': 'Basic ' + btoa(process.env.MARKET_ID+':'+process.env.SECRET_KEY_UMONEY)
          };
          
          const {payinfo, orderid} = req.body;
          
          await User.update({ status_pay: true }, {where: {id : orderid}});

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
            
            let {itemSort, orderSort, limit, page, id, filter} = req.query
            page = page || 1
            limit = limit || 10
            itemSort = itemSort || 'ASC'
            orderSort = orderSort || 'createdAt'
            let offset = page * limit - limit
            let devices;
            console.log(id)
            if(id)
            if(id == '0'){
              devices = await Device.findAndCountAll({where: {status_pay : true, name : filter}, order: [[itemSort, orderSort]], limit, offset});
              
            }else{
              devices = await Device.findAndCountAll({where: {id : id}, order: [[itemSort, orderSort]], limit, offset});
              
            }
            return res.json(devices)
        }

        
// (4) POST: - http://localhost:5000/api/device/delete-item/ - Просмотр всех заказов
        async deleteOrdersAdmin(req, res, next) { // Done
            // createdAt
            const {id} = req.body;
            const device = await Device.update({ status_done: true }, {where: {id}});

            return res.json(device)
        }


}

module.exports = new DeviceController()
