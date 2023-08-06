const uuid = require("uuid");
const path = require("path");
const fs = require('fs')
const { Device, User } = require("../models/models");
const ApiError = require("../error/ApiError");

const fetch = require("node-fetch");

const { fileUploadCustom } = require("../S3/s3Upload");


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
    async testFirst(req, res, next) {
        // Done
        const { value, description, tel } = req.body;
        // console.log(req.files.img)
        // const img = req.files.img;
        // const fileName = uuid.v4() + ".jpg"
        // img.mv(path.resolve(__dirname, '..', 'static', fileName))
        return res.json({ value, description, tel });
    }

    // (2)  POST - http://localhost:5000/api/device/ - Покупка отдельных товаров с занесением в базу данных
    async homePage(req, res, next) {
        const { name, value, description, descriptionText, userId } = req.body;

        let fileLocation;
        try{
            fileLocation = await fileUploadCustom(req.files.img); // вставить 
        }catch(e){
            return next(
                ApiError.internal(`ERROR:S3_backet ${e.code} + ${e.message}`));}

        const user = await User.findOne({ where: { id: userId } });
        const userDescription = `Имя клиента: ${user.name}; ID-клиента: ${user.id}; Телефон клиента: ${user.phone}; Email клиента: ${user.email};`;

        const device = await Device.create({
            name,
            feature: description,
            userDescription: userDescription,
            img: fileLocation,
            userId,
            descriptionText
        });

        // Send to YOOMONEY
        const payV = String(value);
        const IdempotenceKey = uuid.v4();
        const headersP = {
            "Content-Type": "application/json",
            "Idempotence-Key": IdempotenceKey,
            // TODO - Заменить открытые пароли на env
            Authorization:
                "Basic " +
                btoa(
                    process.env.MARKET_ID + ":" + process.env.SECRET_KEY_UMONEY
                ),
        };
        const inputBodyP = {
            amount: {
                value: payV,
                currency: "RUB",
            },
            capture: true,
            // "payment_method_data": {
            //     "type": 'bank_card'
            // },
            confirmation: {
                type: "redirect",
                return_url: "https://kopi34.ru/payinfo/",
            },
            description: device.id,
            metadata: {
                order_id: device.id,
            },
        };

        fetch("https://api.yookassa.ru/v3/payments", {
            method: "POST",
            body: JSON.stringify(inputBodyP),
            headers: headersP,
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (body) {
                return res.json(body);
            })
            .catch((e) => {
                return next(
                    ApiError.badRequest(
                        `Ошибка вызова Юманни на сервере (deviceController.homePage): ${e.code} + ${e.message}`
                    )
                );
            });
    }

    // (3) POST: - http://localhost:5000/api/device/getpay - подтверждение оплаты заказа
    async getPay(req, res, next) {
        // Done

        const headersP = {
            Authorization:
                "Basic " +
                btoa(
                    process.env.MARKET_ID + ":" + process.env.SECRET_KEY_UMONEY
                ),
        };

        const { payinfo, orderid } = req.body;

        await User.update({ status_pay: true }, { where: { id: orderid } });

        console.log(payinfo);
        fetch("https://api.yookassa.ru/v3/payments/" + payinfo, {
            method: "GET",
            headers: headersP,
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (body) {
                return res.json(body);
            })
            .catch((e) => {
                return next(
                    ApiError.badRequest(
                        `Ошибка вызова Юманни на сервере (deviceController.homePage): ${e.code} + ${e.message}`
                    )
                );
            });
    }

    // (4) GET: - http://localhost:5000/api/device/admin/devices-view/ - Просмотр всех заказов

    async allOrdersAdmin(req, res, next) {
        let { itemSort, orderSort, limit, page, id, filter, userId } = req.query;
        console.log(userId)
        page = page || 1;
        limit = limit || 10;
        itemSort = itemSort || "ASC";
        orderSort = orderSort || "createdAt";
        let offset = page * limit - limit;
        let devices;
        // console.log(id);
        // if (id)
            if(userId){
                  try{devices = await Device.findAndCountAll({
                    where: { userId: userId },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset});
                  return res.json(devices);
                }catch(e){
                      return next(
                        ApiError.badRequest(
                            `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                        )
                    );
                }
            }
            if (id == "0") {
                try{devices = await Device.findAndCountAll({
                    where: { status_pay: true, name: filter },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset});
                    return res.json(devices);
                  }catch(e){
                    return next(
                      ApiError.badRequest(
                          `Ошибка БД2 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                      )
                  );
                  }
            } else {
              try{devices = await Device.findAndCountAll({
                  where: { id: id },
                  order: [[itemSort, orderSort]],
                  limit,
                  offset});
                  return res.json(devices);
              }catch(e){
                return next(
                  ApiError.badRequest(
                    `Ошибка БД3 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                  )
              );
              }
            }
        
    }

    // (4) POST: - http://localhost:5000/api/device/delete-item/ - Просмотр всех заказов
    async deleteOrdersAdmin(req, res, next) {
        // Done
        // createdAt
        const { id } = req.body;
        try{
          const device = await Device.update(
            { status_done: true },
            { where: { id } }
        );

        return res.json(device);
      }catch(e){
        return next(
          ApiError.badRequest(
            `Ошибка БД (deviceController.deleteOrdersAdmin): ${e.code} + ${e.message}`
          )
        );
      }
        
    }




// (5) POST: - http://localhost:5000/api/device/delete-item/ - Просмотр всех заказов
        // async handleYandexImg(req, res, next) {

        // const img = req.files.img;
        // const fileName = uuid.v4() + ".jpg";


        // fetch("https://cloud-api.yandex.net/v1/disk/resources/upload?path=/sites&overwrite=true", {
        //     "Content-Type": "application/json",
        //     // сюда нужно вставить Пример: Authorization: OAuth 0c4181a7c2cf4521964a72ff57a34a07
        //     Authorization:
        //         "Basic " +
        //         btoa(
        //             process.env.MARKET_ID + ":" + process.env.SECRET_KEY_UMONEY
        //         ),

        // }).then(function (res) {
        //         return res.json();
        //         console.log(res)
        //     })
        //     .then(function (body) {
        //         return res.json(body);
        //     })
        //     .catch((e) => {
        //         return next(
        //             ApiError.badRequest(
        //                 `Ошибка вызова Юманни на сервере (deviceController.homePage): ${e.code} + ${e.message}`
        //             )
        //         );
        //     });
        // // Дальше нужно 



        // }
}

module.exports = new DeviceController();
