const Router = require('express')
const router = new Router()
const goodsController = require('../controllers/goodsController')

// Open
router.post('/', goodsController.createGoods) 




module.exports = router