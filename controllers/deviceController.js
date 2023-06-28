const uuid = require('uuid');
const path = require('path');
const {Device} = require('../models/models');
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


/* (1) GET: - http://localhost:5000/api/device/test1    
*
* Тестирование - 
* 
* */

        async test1(req, res, next) { // Done

            const {value, side, vid, lam, num, tel} = req.body;

            return res.json({q: value, w: side, e: vid, r: lam, t: num, y: tel});
        }


/* (2)  POST - http://localhost:5000/api/device/    
*
*   1. Покупка отдельных товаров с занесением в базу данных
* 
* 
* 
* */

        async homePage(req, res, next) { // Done

        const {value, side, vid, lam, num, tel} = req.body;
        // console.log(req.files.img)
        const img = req.files.img;      
        const fileName = uuid.v4() + ".jpg"
        img.mv(path.resolve(__dirname, '..', 'static', fileName))

    

           

            // 
            const payV = String(value);

            const IdempotenceKey = uuid.v4();

            const headersP = {
            'Content-Type':'application/json',
            'Idempotence-Key': IdempotenceKey,
            // TODO - Заменить открытые пароли на env
            'Authorization': 'Basic ' + btoa('322722:live_k25GTirGEy6mpQ9SrTNrIVf1XX9spgXAWz96GBER9UQ')
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


/* (3) GET: - http://localhost:5000/api/device/device-view/:id
*
* 1. подтверждение оплаты заказа
*/

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




/* (4) GET: - http://localhost:5000/api/device/ 
* 
* @param req.body      |   <form_input>        -> 0 
*        req.file      |   <form_input_file>   -> 0 
* @param req.params    |   /:id                -> 0 
* @param req.query     |   /?param=1&          -> 0 
* 
* @return (json) 
* 
*/
    
    async homePage(req, res, next) { // Done
            try {
                    let created = await Device.findAll({
                        order: [['createdAt', 'DESC']], // DESC -> from hight to low
                        limit: 4
                    });
                    let price = await Device.findAll({
                        order: [['price', 'ASC']], // ASC -> from low to hight
                        limit: 4
                    });
                    let sale = await Device.findAll({
                        order: [['sale', 'DESC']], // 
                        limit: 4
                    });
                    // TODO: add custom list of devices by session
                    return res.json({created: created, price: price, sale: sale})
            } catch (e) {
                    next(ApiError.badRequest(e.message))
            }

    }


        /* GET: - http://localhost:5000/api/device/device-view/:id 
     * 
     * @param req.body      |   <form_input>        ->  0
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */

        async getOne(req, res, next) {
           try{
            const {id} = req.params
            // console.log(id);
            
            const device = await Device.findOne(
                {
                    where: {id: id}
                }
            )
            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        }


        /* POST: - http://localhost:5000/api/category/:category/:page   
     * 
     * @param req.body      |   <form_input>        ->  1
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */
    
        async getAll(req, res, next) {
           try{
            // return res.status(401).json({tt: 34})
        //    const {order} = req.body;
        const { category, page } = req.params;
            const offset = (page - 1) * 8;
            
            const devices = await Device.findAndCountAll({
                where: {category: category},
                order: [['name', 'DESC']], // DESC -> from hight to low
                // offset: offset,
                limit: 8
            });
    
     
            return res.json(devices)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        }

    

// ################################# CLOSED:


    
    /* POST: - http://localhost:5000/api/device/create-device/      
     * 
     * @param req.body      |   <form_input>        ->  1   
     *        req.file      |   <form_input_file>   ->  1
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */
    
    async create(req, res, next) {
        try {
            const {name, price, old_price, sale, category} = req.body;
            const userId = req.user.id;
            const img = req.files.img;
            const fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Device.create({name, price, old_price, sale, category, userId, img: fileName});
            
            return res.json(device)
            
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }






    /* GET: - http://localhost:5000/api/device/del/:id 
     * 
     * @param req.body      |   <form_input>        -> 0 
     *        req.file      |   <form_input_file>   -> 0 
     * @param req.params    |   /:id                -> 1 
     * @param req.query     |   /?param=1&          -> 0 
     * 
     * @return (json) 
     * 
     */ 

    async delete(req, res) {
        try{  
        const {id} = req.params;
        
        
        const device = await Device.destroy(
            {
                where: {id: id}
            }
        )
        return res.json(device)
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }
    }
    
    /* GET: - http://localhost:5000/api/user-devices/
     * 
     * @param req.body      |   <form_input>        ->  0
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  0
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */

    async deviceListUser(req, res) {
        try{
        const userId = req.user.id;
        
        
        const devices = await Device.findAll({
            where: {userId: userId}
        });

        return res.json(devices)
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }
    }




}

module.exports = new DeviceController()
