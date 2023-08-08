const Router = require('express')
const router = new Router()
const goodsController = require('../controllers/goodsController')

// Open
router.post('/', goodsController.createGoods) 
router.post('/update-one', goodsController.updateGoods) 
router.get('/fetch-list', goodsController.fetchGoodsList)
router.get('/fetch-one', goodsController.fetchOneGoods)
router.get('/delete-one', goodsController.deleteOneGoods)



module.exports = router