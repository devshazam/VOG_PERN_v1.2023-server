const uuid = require("uuid");
const path = require("path");
const { Goods } = require("../models/models");
const ApiError = require("../error/ApiError");

class GoodsController {

    // (2)  POST - http://localhost:5000/api/device/ - Покупка отдельных товаров с занесением в базу данных
    async createGoods(req, res, next) {
        // Done

       
        const { name, description, image, group} = req.body;
        console.log(image)
        return res.json({we:232});
        try{
            const reviewRes = await Review.create({
                theme: subject,
                description: review,
            });
             return res.json(reviewRes);
            
        }catch(e){
            return next(
                ApiError.internal(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
                }


    }

}

module.exports = new GoodsController();
