const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware');




// Open
router.post('/', deviceController.homePage) 
router.post('/getpay', deviceController.getPay) 
router.post('/basket', deviceController.getBasketItems) 
router.post('/pay-basket-list', deviceController.payBasketList) 
router.post('/recive-basket-count', deviceController.reciveBasketCount) 


router.get('/admin/devices-view/', deviceController.allOrdersAdmin)
router.post('/delete-item/', deviceController.deleteOrdersAdmin)




module.exports = router