const { Price } = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");

class PriceController {

    // POST(_1_): `api/goods/` + `/`
    async createPrice(req, res, next) {
        const { jsonValue } = req.body;

        try {
            const price = await Price.create({
                value: jsonValue
            });
    
            return res.json(price);
        } catch (e) {
            appendFiles(`\n610: ${e.message}`)
            return next(
                ApiError.internal(`610: ${e.message}`)
            );
        }
    }


    // GET(_2_): `api/goods/` + `/fetch-list`
    async fetchPrice(req, res, next) {
        let { priceId } = req.body;

        try {
            const price = await Goods.findByPk(123);
            return res.json(price);
        } catch (e) {
            appendFiles(`\n611: ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   


    async updatePrice(req, res, next) {
        const { priceId, jsonValue } = req.body;

        try {
            const goods = await Goods.update({
                value: jsonValue
            }, {where: {id: priceId}});

            return res.json({success: true});
        }  catch (error) {
            appendFiles(`\n614: ${e.message}`)
            return next(
                ApiError.internal(
                    `614: ${error.message}`
                )
            );
        }
    }


}

module.exports = new PriceController();
