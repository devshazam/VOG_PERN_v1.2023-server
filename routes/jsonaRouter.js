const Router = require('express')
const router = new Router()
const jsonaController= require('../controllers/jsonaController')


router.post('/update', jsonaController.updateJson) // № 5
router.post('/fetch', jsonaController.fetchJson) // № 5
// router.post('/create', jsonaController.createPrice) // № 5


module.exports = router