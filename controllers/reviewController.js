const uuid = require("uuid");
const path = require("path");
const { Review } = require("../models/models");
const ApiError = require("../error/ApiError");

class ReviewController {

    // (2)  POST - http://localhost:5000/api/device/ - Покупка отдельных товаров с занесением в базу данных
    async createReview(req, res, next) {
        // Done
        const { subject, review } = req.body;
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

module.exports = new ReviewController();
