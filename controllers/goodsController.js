const { Goods } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom } = require("../S3/s3Upload");

class GoodsController {
    async createGoods(req, res, next) {
        const { name, description, group, price, userId } = req.body;

        let fileLocation;
        try {
            fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
        } catch (e) {
            return next(
                ApiError.badRequest(`ERROR:S3_backet ${e.code} + ${e.message}`)
            );
        }

        console.log(fileLocation);

        const device = await Goods.create({
            name,
            description,
            group,
            price,
            image: fileLocation,
            userId
        });

        return res.json(device);
    }

    async fetchGoodsList(req, res, next) {
        let { limit, page, category } = req.query;
        page = page || 1;
        limit = limit || 24;
        let itemSort = "ASC";
        let orderSort = "createdAt";
        let offset = page * limit - limit;
        let devices;

        try {
            devices = await Goods.findAndCountAll({
                where: { group: category },
                order: [[orderSort, itemSort]],
                limit,
                offset,
            });
            return res.json(devices);
        } catch (e) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
        }
    }
    async fetchOneGoods(req, res, next) {
        let { id } = req.query;
        try {
            const goods = await Goods.findOne({ where: { id } });
            return res.json(goods);
        } catch (e) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
        }
    }

    async deleteOneGoods(req, res, next) {
        let { id } = req.query;
        try {
            const goods = await Goods.destroy({ where: { id } });
            return res.json(goods);
        } catch (e) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
        }
    }
    async updateGoods(req, res, next) {
        const { name, description, group, price, userId, id } = req.body;

        let fileLocation;
        try {
            fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
        } catch (e) {
            return next(
                ApiError.badRequest(`ERROR:S3_backet ${e.code} + ${e.message}`)
            );
        }
        try{
                const goods = await Goods.update({
                name,
                description,
                group,
                price,
                image: fileLocation,
                userId
            }, {where: {id}});
            console.log(goods)
            return res.json({success: true});
        } catch (error) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${error.code} + ${error.message}`
                )
            );
    }

        
    }
}

module.exports = new GoodsController();
