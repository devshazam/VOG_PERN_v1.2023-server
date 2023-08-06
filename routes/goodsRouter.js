const Router = require('express')
const router = new Router()
const goodsController = require('../controllers/goodsController')

// Open
router.post('/', goodsController.createGoods) 
router.get('/fetch-list', goodsController.fetchGoodsList)
router.get('/fetch-one', goodsController.fetchOneGoods)




module.exports = router