const Router = require('express')
const router = new Router()
const priceController= require('../controllers/priceController')


router.post('/create', priceController.createPrice) // № 1
router.post('/update', priceController.updatePrice) // № 5
router.post('/fetch', priceController.fetchPrice) // № 5


module.exports = router