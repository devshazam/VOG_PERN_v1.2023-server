const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')


router.post('/create-device/', deviceController.createDevice) // № 1
router.post('/create-requisites/', deviceController.createRequisites) // № 11
router.post('/orders-admin-list/', deviceController.ordersAdminList) // № 2
router.post('/fetch-order-item/', deviceController.fetchAllDevicesFromOneOrder) // № 11
router.post('/delete-item/', deviceController.changeDoneStatusToDone) // № 3
router.post('/delete-basket-item/', deviceController.deleteItemFromBasket) // № 4
router.post('/basket/', deviceController.fetchBasketDevices)  // № 5
router.post('/pay-basket-list/', deviceController.paymentForCartItems) // № 6
router.post('/getpay/', deviceController.checkPayStatus) // № 7 
router.post('/user-pay-goods/', deviceController.getUserGoods) // № 9
router.post('/fetch-requisites/', deviceController.fetchRequisites) // № 10
router.post('/recive-basket-count/', deviceController.reciveBasketCount) // № 8
router.post('/recive-order-count/', deviceController.reciveOrderCount) // № 11


router.post('/fetch-user-by-order-id/', deviceController.fetchUserByOrderId) // № 11
router.get('/test/', deviceController.test) // № 11


module.exports = router