const uuid = require("uuid");
const path = require("path");
const { Review } = require("../models/models");
const ApiError = require("../error/ApiError");

class ReviewController {

    // создание отзыва клиента
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
                    `dev_server: ${e.code} + ${e.message}`
                )
            );
                }


    }

}

module.exports = new ReviewController();
