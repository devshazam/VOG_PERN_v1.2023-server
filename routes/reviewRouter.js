const Router = require('express')
const router = new Router()
const reviewController = require('../controllers/reviewController')


router.post('/', reviewController.createReview) // 1


module.exports = router