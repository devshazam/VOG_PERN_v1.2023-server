const uuid = require("uuid");
const path = require("path");
const fs = require('fs')
const fetch = require("node-fetch");

const { Device, User } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom } = require("../S3/s3Upload");


class DeviceController {

    // Создание одного заказа для карзины клиента
    async homePage(req, res, next) {
        const { name, value, description, descriptionText, userId, goodId } = req.body;
        try{
            const fileLocation = await fileUploadCustom(req.files.img); // вставить 
            const userMid = await User.findOne({where: {id : userId}});
            await User.update({ basket: userMid.basket + 1 }, { where: { id: userId } });
            const device = await Device.create({
                name,
                feature: description,
                img: fileLocation,
                userId,
                descriptionText,
                goodId, 
                price: +value
            });
            return res.json(device);
        }catch(e){
            return next(
                ApiError.internal(`dev_server: ${e.code} + ${e.message}`));}   
    }




    // список заказов для администрауции
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
                        ApiError.internal(
                            `dev_server: ${e.code} + ${e.message}`
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
                      ApiError.internal(
                          `dev_server: ${e.code} + ${e.message}`
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
                  ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
                  )
              );
              }
            }
        
    }


    
    // изменить статус готовности заказа
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
          ApiError.internal(
            `dev_server: ${e.code} + ${e.message}`
          )
        );
      }
        
    }


    // получить все заказы корзины клиента
    async getBasketItems(req, res, next) {
        const { id } = req.body;
        try{
            const devices = await Device.findAndCountAll({
                where: { status_pay: false, userId: id }
            });
            return res.json(devices);
        }catch(e){
            return next(
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
                )
            );
        }
        
    }


    // оплата товаров в корзине 
    async payBasketList(req, res, next) {
                const { value } = req.body;        
               // Send to YOOMONEY
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
                       value: String(value),
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
                           ApiError.internal(
                               `dev_server: ${e.code} + ${e.message}`
                           )
                       );
                   });
    }


    // оповещение о статусе оплаты юмани TODO - обнуление карзины юзера + 
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
                    ApiError.internal(
                        `dev_server: ${e.code} + ${e.message}`
                    )
                );
            });
    }


}

module.exports = new DeviceController();
