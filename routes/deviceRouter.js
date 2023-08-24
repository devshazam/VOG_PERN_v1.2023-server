const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', deviceController.createDevice) 
router.post('/getpay', deviceController.getPay) 
router.post('/basket', deviceController.getBasketItems) 
router.post('/pay-basket-list', deviceController.payBasketList) 
router.post('/recive-basket-count', deviceController.reciveBasketCount) 
router.post('/delete-item/', deviceController.deleteOrdersAdmin)
router.post('/delete-basket-item/', deviceController.deleteOneItem)
router.post('/user-pay-goods/', deviceController.getUserGoods)


router.get('/admin/devices-view/', deviceController.allOrdersAdmin)


module.exports = router