const { Review } = require("../models/models");
const ApiError = require("../error/ApiError");

class ReviewController {

    // создание отзыва клиента
    async createReview(req, res, next) {
        const { subject, review, userId } = req.body;
        try{
            const reviewResult = await Review.create({
                theme: subject,
                description: review,
                userId
            });
             return res.json(reviewResult);
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
