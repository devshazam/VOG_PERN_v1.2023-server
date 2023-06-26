const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')




// Open
router.post('/', deviceController.homePage) 
router.post('/getpay', deviceController.getPay) 
router.post('/test1', deviceController.test1) 
// router.get('/device-view/:id', deviceController.getOne) 
// router.get('/category/:category/:page', deviceController.getAll) 


module.exports = router
