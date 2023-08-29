const { Review } = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");

class ReviewController {

    // POST(_1_): `api/review/` + `/`
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
            appendFiles(`\n617: ${e.message}`)
            return next(
                ApiError.internal(
                    `617: ${e.message}`
                )
            );
        }
    }

}

module.exports = new ReviewController();
