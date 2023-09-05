const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { appendFiles } = require("../error-log/LogHandling");
const { Device, Requisites } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom, fileDelete } = require("../S3/s3Upload");

class DeviceController {
    // POST(_1_): `api/device/` + `/`
    async createDevice(req, res, next) {
        let { name, value, description, descriptionText, userId, goodId } =
            req.body;
        goodId = goodId || null;
        try {
                let fileLocation = null
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
                    });

            return res.json(device);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }

    // GET(_2_): `api/device/` + `/admin/devices-view/`
    async allOrdersAdmin(req, res, next) {
        let { itemSort, orderSort, limit, page, id, filter, userId } =
            req.query;
        page = page || 1;
        limit = limit || 10;
        itemSort = itemSort || "createdAt";
        orderSort = orderSort || "ASC";
        let offset = page * limit - limit;
        let devices;
        // console.log(id);
        // if (id)
        if (userId) {
            try {
                devices = await Device.findAndCountAll({
                    where: { userId: userId },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset,
                });
                return res.json(devices);
            } catch (e) {
                appendFiles(`\n604: ${e.message}`);
                return next(ApiError.internal(`604: ${e.message}`));
            }
        }
        if (id == "0") {
            try {
                devices = await Device.findAndCountAll({
                    where: { status_pay: true, name: filter },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset,
                });
                return res.json(devices);
            } catch (e) {
                appendFiles(`\n604: ${e.message}`);
                return next(ApiError.internal(`604: ${e.message}`));
            }
        } else {
            try {
                devices = await Device.findAndCountAll({
                    where: { id: id },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset,
                });
                return res.json(devices);
            } catch (e) {
                appendFiles(`\n604: ${e.message}`);
                return next(ApiError.internal(`604: ${e.message}`));
            }
        }
    }

    // POST(_3_): `api/device/` + `/delete-item/`
    // изменить статус готовности заказа
    async deleteOrdersAdmin(req, res, next) {
        // Done
        // createdAt
        const { id } = req.body;
        try {
            const device = await Device.update(
                { status_done: true },
                { where: { id } }
            );

            return res.json(device);
        } catch (e) {
            appendFiles(`\n602: ${e.message}`);
            return next(ApiError.internal(`602: ${e.message}`));
        }
    }

    // удвалить один заказ
    // POST(_4_): `api/device/` + `/delete-basket-item/`
    async deleteOneItem(req, res, next) {
        const { id } = req.body;
        try {
            const getOneGoods = await Device.findOne({ where: { id } });
            console.log(getOneGoods.img);
            const goods = await Device.destroy({ where: { id } });
            if (goods == 1 && getOneGoods.img) {
                let mid1 = getOneGoods.img.split("//")[1].split("/");
                let delObj = { Bucket: mid1[1] + "/" + mid1[2], Key: mid1[3] };
                const mid2 = await fileDelete(delObj);
                console.log(mid2);
            }
            return res.json(goods);
        } catch (e) {
            appendFiles(`\n601: ${e.message}`);
            return next(ApiError.internal(`601: ${e.message}`));
        }
    }

    // получить все заказы корзины клиента
    // POST(_5_): `api/device/` + `/basket`
    async getBasketItems(req, res, next) {
        const { id } = req.body;
        try {
            const devices = await Device.findAndCountAll({
                where: { status_pay: false, userId: id },
            });
            return res.json(devices);
        } catch (e) {
            appendFiles(`\n605: ${e.message}`);
            return next(ApiError.internal(`605: ${e.message}`));
        }
    }

    // оплата товаров в корзине + создание заказа +
    // POST(_6_): `api/device/` + `/pay-basket-list`
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
            description: "Оплата на сайте kopi34.ru",
            //    metadata: {
            //        order_id: device.id,
            //    },
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
                appendFiles(`\n606: ${e.message}`);
                return next(ApiError.internal(`606: ${e.message}`));
            });
    }

    // POST(_7_): `api/device/` + `/getpay`
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

        console.log(payinfo);
        fetch("https://api.yookassa.ru/v3/payments/" + payinfo, {
            method: "GET",
            headers: headersP,
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (body) {
                if (body.status == "success") {
                    const order = JSON.parse(orderid);
                    order.forEach((i) =>
                        Device.update(
                            { status_pay: true },
                            { where: { id: order[i] } }
                        )
                    );
                    return res.json({ status: body.status });
                }

                return res.json({ status: body.status });
            })
            .catch((e) => {
                appendFiles(`\n607: ${e.message}`);
                return next(ApiError.internal(`607: ${e.message}`));
            });
    }

    // POST(_8_): `api/device/` + `/recive-basket-count`
    // получить все заказы корзины клиента
    async reciveBasketCount(req, res, next) {
        const { id } = req.body;
        try {
            const numberBasket = await Device.count({
                where: { status_pay: false, userId: +id },
            });
            return res.json(numberBasket);
        } catch (e) {
            appendFiles(`\n608: ${e.message}`);
            return next(ApiError.internal(`608: ${e.message}`));
        }
    }

    // POST(_9_): `api/device/` + `/user-pay-goods/`
    async getUserGoods(req, res, next) {
        let { page, userId } = req.body;
        let limit = 10;
        let orderSort = "ASC";
        let itemSort = "createdAt";
        let offset = +page * limit - limit;
        try {
            const devices = await Device.findAndCountAll({
                where: { userId: +userId, status_pay: true },
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

    // POST(_10_): `api/device/` + `/fetch-requisites`
    async fetchRequisites(req, res, next) {
        const { id } = req.body;

        try {
            const requisites = await Requisites.findOne({
                where: { userId: id },
            });
            console.log(requisites);
            return res.json(requisites);
        } catch (e) {
            appendFiles(`\n603: ${e.message}`);
            return next(ApiError.internal(`603: ${e.message}`));
        }
    }

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
}

module.exports = new DeviceController();
