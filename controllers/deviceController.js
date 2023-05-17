require('dotenv').config()

const uuid = require('uuid');
const path = require('path');

// const sgMail = require('@sendgrid/mail')
const fetch = require('node-fetch');

class DeviceController {

    /* GET: - http://localhost:5000/api/device/ 
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

      const {value, side, vid, lam, num, tel} = req.body;
      // console.log(req.files.img)
      const img = req.files.img;
      const fileName = uuid.v4() + ".jpg"
      img.mv(path.resolve(__dirname, '..', 'static', fileName))

      const IP = process.env.IP;

        console.log(fileName)
        const headers = {
          'Content-Type':'application/json',
          'Accept':'application/json',
          'X-API-KEY':'65wsww4y9dhybukuf6qkz6sp6p8oxzsx988tgr8y'
        };
        
        const inputBody = {
          "message": {
            "recipients": [
              {
                "email": "info@kopi34.ru"
              }
            ],
            "body": {
              "html": "<p><b>Цена: " +value+"</b><br>Сторонность: " +side+"<br>Бумага: " +vid+"<br>Ламинация: " +lam+"<br>Кол-во: " +num+"<br>Телефон: " +tel+"<br>Телефон: "+fileName+"</p><img src='http://"+IP+":5000/"+fileName+"'>",
              "plaintext": "Hello, {{to_name}}",
            },
            "subject": "string",
            "from_email": "one@kopi34.ru",
            "from_name": "John Smith"
          }
        };
        fetch('https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
        {
          method: 'POST',
          body: JSON.stringify(inputBody),
          headers: headers
        })
        .then(function(res) {
            return res.json();
        }).then(function(body) {
            console.log(body);
        });


          return res.json('fhf: "ddjdj"')
        

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
            // const userId = req.user.id;
            const img = req.files.img;
            const fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            // const device = await Device.create({name, price, old_price, sale, category, userId, img: fileName});
            const device = await Device.create({name, price, old_price, sale, category, img: fileName});

            return res.json(device)
            
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }





}

module.exports = new DeviceController()
