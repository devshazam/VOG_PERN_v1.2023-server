const Router = require('express')
const router = new Router()
const deviceController = require('../controllers/deviceController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware');




// Open
// router.get('/', deviceController.homePage) 
router.post('/', deviceController.testFirst) 
router.get('/device-view/:id', deviceController.getOne) 
router.get('/category/:category/:page', deviceController.getAll) 


// Closed - USER
router.post('/create-device/', authMiddleware, deviceController.create)
router.get('/delete-device/:id/', authMiddleware, deviceController.delete)
router.get('/user-devices/', authMiddleware, deviceController.deviceListUser)
// router.post('/change/:id/', authMiddleware, deviceController.change) 


// Closed - ADMIN
router.post('/create-device/', authMiddleware, checkRoleMiddleware, deviceController.create)
router.get('/delete-device/:id/', authMiddleware, deviceController.delete)



module.exports = router