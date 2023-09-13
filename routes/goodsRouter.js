const Router = require('express')
const router = new Router()
const goodsController = require('../controllers/goodsController')


router.get('/fetch-list', goodsController.fetchGoodsList) // № 2
router.get('/fetch-one', goodsController.fetchOneGoods) // № 3
router.get('/delete-one', goodsController.deleteOneGoods) // № 4
router.get('/fetch-xsl-file', goodsController.buildXls) // № 6

router.post('/', goodsController.createGoods) // № 1
router.post('/update-one', goodsController.updateGoods) // № 5
router.post('/fetch-list-of-goods', goodsController.fetchListOfGoods) // № 5
router.post('/parce-xls', goodsController.parceXls) // № 7


module.exports = router