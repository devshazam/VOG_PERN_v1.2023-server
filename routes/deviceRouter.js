const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')



router.post('/create-device/', deviceController.createDevice) // № 1
router.post('/create-requisites/', deviceController.createRequisites) // № 11
router.post('/orders-admin-list/', deviceController.ordersAdminList) // № 2


router.post('/user-pay-goods/', deviceController.getUserGoods) // № 9


router.post('/basket/', deviceController.getBasketItems)  // № 5
router.post('/fetch-order-item/', deviceController.fetchOrderItems) // № 11

router.post('/fetch-requisites/', deviceController.fetchRequisites) // № 10

router.post('/delete-basket-item/', deviceController.deleteOneItem) // № 4
router.post('/delete-item/', deviceController.deleteOrdersAdmin) // № 3


router.post('/pay-basket-list/', deviceController.payBasketList) // № 6
router.post('/getpay/', deviceController.checkPayStatus) // № 7 



router.post('/recive-basket-count/', deviceController.reciveBasketCount) // № 8
router.post('/recive-order-count/', deviceController.reciveOrderCount) // № 11

module.exports = router