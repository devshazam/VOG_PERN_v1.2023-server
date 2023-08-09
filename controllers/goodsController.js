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
                ApiError.internal(`dev_server: ${e.code} + ${e.message}`)
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
        let { itemSort, orderSort, limit, page, categoryIt } = req.query;
        page = page || 1;
        limit = limit || 24;
        itemSort = itemSort || "createdAt";
        orderSort = orderSort || "ASC";
        let offset = page * limit - limit;
        let devices;

        try {
            devices = await Goods.findAndCountAll({
                where: { group: categoryIt },
                order: [[itemSort, orderSort]],
                limit,
                offset,
            });
            return res.json(devices);
        } catch (e) {
            return next(
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
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
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
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
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
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
                ApiError.internal(`dev_server: ${e.code} + ${e.message}`)
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
                ApiError.internal(
                    `dev_server: ${error.code} + ${error.message}`
                )
            );
    }

        
    }
}

module.exports = new GoodsController();
