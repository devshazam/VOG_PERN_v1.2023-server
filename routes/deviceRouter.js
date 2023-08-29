const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')


router.get('/admin/devices-view/', deviceController.allOrdersAdmin) // № 2

router.post('/', deviceController.createDevice) // № 1
router.post('/delete-item/', deviceController.deleteOrdersAdmin) // № 3
router.post('/delete-basket-item/', deviceController.deleteOneItem) // № 4
router.post('/basket', deviceController.getBasketItems)  // № 5
router.post('/pay-basket-list', deviceController.payBasketList) // № 6
router.post('/getpay', deviceController.getPay) // № 7
router.post('/recive-basket-count', deviceController.reciveBasketCount) // № 8
router.post('/user-pay-goods/', deviceController.getUserGoods) // № 9


module.exports = router