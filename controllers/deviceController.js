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
              "html": "<p><b>Цена: " +value+"</b><br>Сторонность: " +side+"<br>Бумага: " +vid+"<br>Ламинация: " +lam+"<br>Кол-во: " +num+"<br>Телефон: " +tel+"</p><img src='http://"+IP+":5000/"+fileName+"'>",
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

          const payV = String(value);

        const IdempotenceKey = uuid.v4();

        const headersP = {
          'Content-Type':'application/json',
          'Idempotence-Key': IdempotenceKey,
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
            "return_url": 'https://kopi34.ru/payinfo'
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


    

}

module.exports = new DeviceController()
