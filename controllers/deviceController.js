const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { appendFiles } = require("../error-log/LogHandling");
const {
    Device,
    Requisites,
    User,
    Basket,
    Orders,
    Review
} = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom, fileDelete } = require("../S3/s3Upload");
const sequelize = require('../db')

class DeviceController {


    // POST(_1_):
    async createDevice(req, res, next) {
        let { name, value, description, descriptionText, userId, goodId } =
            req.body;
        goodId = goodId || null;

        try {
            let fileLocation = null;
            if (req.files) {
                fileLocation = await fileUploadCustom(
                    req.files.img,
                    "devices/"
                );
            }
            const device = await Device.create({
                name,
                feature: description,
                userId,
                descriptionText,
                img: fileLocation,
                goodId,
                price: +value,
                basket: [
                    {userId}
                ]
            },
            {
              include: [Basket],
            });
            // await Basket.create({ userId, deviceId: device.id });

            return res.json(device);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }


    // POST
    async createRequisites(req, res, next) {
        const {
            directorFullName,
            inn,
            ogrn,
            bik,
            checkingAccount,
            bankName,
            bankAddress,
            korAccount,
            orgFullName,
            legalAddress,
            userId,
        } = req.body;
        try {
            const requisites = await Requisites.create({
                director_full_name: directorFullName,
                inn,
                ogrn,
                bik,
                checking_account: checkingAccount,
                bank_name: bankName,
                bank_address: bankAddress,
                kor_account: korAccount,
                org_full_name: orgFullName,
                legal_address: legalAddress,
                userId,
            });
            return res.json(requisites);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }


    // GET
    async ordersAdminList(req, res, next) {
        let { page } = req.body;
        page = page || 1;
        let limit = 10, itemSort = "createdAt", orderSort = "DESC";
        let offset = page * limit - limit;
        try{
            const order = await Orders.findAndCountAll({
                // where: { userId },
                order: [[itemSort, orderSort]],
                limit,
                offset,
            });
            return res.json(order);
        } catch (e) {
            appendFiles(`\n604: ${e.message}`);
            return next(ApiError.internal(`604: ${e.message}`));
        }
    }


    
    // GET(_2_):
    // async allOrdersAdmin(req, res, next) {
    //     let { itemSort, orderSort, limit, page, id, filter, userId } =
    //         req.query;
    //     page = page || 1;
    //     limit = limit || 10;
    //     itemSort = itemSort || "createdAt";
    //     orderSort = orderSort || "ASC";
    //     let offset = page * limit - limit;
    //     let devices;
        
    //     if (userId) {
    //         try {
    //             devices = await Device.findAndCountAll({
    //                 where: { userId: userId },
    //                 order: [[itemSort, orderSort]],
    //                 limit,
    //                 offset,
    //             });
    //             return res.json(devices);
    //         } catch (e) {
    //             appendFiles(`\n604: ${e.message}`);
    //             return next(ApiError.internal(`604: ${e.message}`));
    //         }
    //     }
    //     if (id == "0") {
    //         try {
    //             devices = await Device.findAndCountAll({
    //                 where: { status_pay: true, name: filter },
    //                 order: [[itemSort, orderSort]],
    //                 limit,
    //                 offset,
    //             });
    //             return res.json(devices);
    //         } catch (e) {
    //             appendFiles(`\n604: ${e.message}`);
    //             return next(ApiError.internal(`604: ${e.message}`));
    //         }
    //     } else {
    //         try {
    //             devices = await Device.findAndCountAll({
    //                 where: { id: id },
    //                 order: [[itemSort, orderSort]],
    //                 limit,
    //                 offset,
    //             });
    //             return res.json(devices);
    //         } catch (e) {
    //             appendFiles(`\n604: ${e.message}`);
    //             return next(ApiError.internal(`604: ${e.message}`));
    //         }
    //     }
    // }


    async changeDoneStatusToDone(req, res, next) {
        const { orderId } = req.body;
        try {
            const result = await Orders.update(
                { status_done: true },
                { where: { id: orderId } }
            );

            if(!result[0]) return res.status(432).json({message: "Заказ не найден!   ~ 201."});

            return res.json({status: 'success'});
        } catch (e) {
            appendFiles(`\n602: ${e.message}`);
            return next(ApiError.internal(`602: ${e.message}`));
        }
    }



    async deleteItemFromBasket(req, res, next) {
        const { deviceId, userId } = req.body;

        // const t = await sequelize.transaction()
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const basketDestroy = await Basket.destroy({
                where: { deviceId, userId }, transaction
            });
            
            const deviceMid = await Device.findOne({ where: {id: deviceId } });
            const deviceDestroy = await Device.destroy({ where: { id: deviceId }, transaction });

            if (basketDestroy && deviceDestroy && deviceMid.img) {

                    let mid1 = deviceMid.img.split("//")[1].split("/");
                    let delObj = { Bucket: mid1[1] + "/" + mid1[2], Key: mid1[3] };
                    const mid2 = await fileDelete(delObj);
            }
            await transaction.commit();
            return res.json({message: `successfully saved order`})
        } catch (e) {
            appendFiles(`\n601: ${e.message}`);
            if(transaction) {
                await transaction.rollback();
             }
            return next(ApiError.internal(`601: ${e.message}`));
        }
    }


    // получить все заказы корзины клиента
    // POST(_5_): `api/device/` + `/basket`
    async fetchBasketDevices(req, res, next) {
        const { userId } = req.body;
        try {
            const basketMid = await Basket.findAll({
                where: { userId, orderId: null },
                attributes: ['deviceId']
            });
            const deviceMid = await Device.findAll({
                where: { id: basketMid.map(item => item.deviceId) },
            })
            return res.json(deviceMid);
        } catch (e) {
            appendFiles(`\n605: ${e.message}`);
            return next(ApiError.internal(`605: ${e.message}`));
        }
    }


    // POST(_6_): `api/device/` + `/pay-basket-list`
    async paymentForCartItems(req, res, next) {
        const { value, userId } = req.body;

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
            amount: { value: String(value), currency: "RUB", },
            capture: true,
            // "payment_method_data": {
            //     "type": 'bank_card'
            // },
            confirmation: {
                type: "redirect",
                return_url: "https://kopi34.ru/admin/user/private-office/",
            },
            description: "Оплата на сайте kopi34.ru",
            // metadata: {
            //     order_id: order.id,
            // },
        };
        try {
            const payItemMid = await fetch("https://api.yookassa.ru/v3/payments", {
                method: "POST",
                body: JSON.stringify(inputBodyP),
                headers: headersP,
            });

            const payItem = await payItemMid.json();

            const newOrder = await Orders.create({ pay_id: payItem.id, value, userId });
            await Basket.update({ orderId: newOrder.id}, {where: { userId, orderId: null }})

            return res.json(payItem);
        } catch (e) {
            appendFiles(`\n629: ${e.message}`);
            return next(ApiError.internal(`629: ${e.message}`));
        }
    }


    // POST(_7_): `api/device/` + `/getpay`
    // оповещение о статусе оплаты юмани TODO - обнуление карзины юзера +
    async checkPayStatus(req, res, next) {
        const { orderId } = req.body;

        const headersP = {
            Authorization:
                "Basic " +
                btoa(
                    process.env.MARKET_ID + ":" + process.env.SECRET_KEY_UMONEY
                ),
        };
        try {
            let orderMid = await Orders.findByPk(orderId);

            if(orderMid){
                const payItemMid = await fetch("https://api.yookassa.ru/v3/payments/" + orderMid.pay_id, {
                    method: "GET",
                    headers: headersP,
                });

                const payItem = await payItemMid.json();
                console.log(payItem)

                if (payItem.status === "success") {
                    orderMid.set({ status_pay: true });
                    await orderMid.save(); 
                }else if(payItem.status === "canceled"){
                    await orderMid.destroy();
                }
            }
            return res.json({ status: "success!" });
        } catch (e) {
            appendFiles(`\n634: ${e.message}`);
            return next(ApiError.internal(`634: ${e.message}`));
        }

    }


    async reciveBasketCount(req, res, next) {
        const { userId } = req.body;
        try {
            const numberBasket = await Basket.count({
                where: { userId, orderId: null },
            });
            return res.json(numberBasket);
        } catch (e) {
            appendFiles(`\n608: ${e.message}`);
            return next(ApiError.internal(`608: ${e.message}`));
        }
    }


    
    async getUserGoods(req, res, next) {
        let { page, userId } = req.body;
        let limit = 10;
        let orderSort = "ASC";
        let itemSort = "createdAt";
        let offset = +page * limit - limit;
        try {
            const devices = await Orders.findAndCountAll({
                where: { userId: +userId },
                order: [[itemSort, orderSort]],
                limit,
                offset,
            });
            return res.json(devices);
        } catch (e) {
            appendFiles(`\n609: ${e.message}`);
            return next(ApiError.internal(`609: ${e.message}`));
        }
    }


    

    async fetchRequisites(req, res, next) {
        const { id } = req.body;

        try {
            const requisites = await Requisites.findOne({
                where: { userId: id },
            });
            return res.json(requisites);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }




    
    async reciveOrderCount(req, res, next) {
        const { userId } = req.body;
        try {
            const orders = await Orders.count({
                where: { userId, status_pay: false },
            });

            return res.json(orders);
        } catch (e) {
            appendFiles(`\n628: ${e.message}`);
            return next(ApiError.internal(`628: ${e.message}`));
        }
    }



    async fetchAllDevicesFromOneOrder(req, res, next) {
        const { orderId } = req.body;
        try {
            const basketMid = await Basket.findAll({ where: { orderId },
                attributes: ['deviceId'] });
            const deviceMid = await Device.findAll({
                where: { id: basketMid.map(item => item.deviceId) },
            })
            return res.json(deviceMid);
        } catch (e) {
            appendFiles(`\n627: ${e.message}`);
            return next(ApiError.internal(`627: ${e.message}`));
        }
    }


    
    async fetchUserByOrderId(req, res, next) {
        const { orderId } = req.body;

        try {
            const midUser = await Orders.findOne({
                where: { id: orderId }, 
                include: [User]
            });
            return res.json(midUser);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }

    async test(req, res, next) {

        try {
            throw new Error('my-error!')
            return res.json({test: 'test'});
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }
}

module.exports = new DeviceController();
