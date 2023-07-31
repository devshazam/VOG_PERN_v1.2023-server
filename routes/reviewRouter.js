const Router = require('express')
const router = new Router()
const reviewController = require('../controllers/reviewController')




// Open
router.post('/', reviewController.createReview) 
// router.get('/admin/devices-view/', deviceController.allOrdersAdmin)




module.exports = router