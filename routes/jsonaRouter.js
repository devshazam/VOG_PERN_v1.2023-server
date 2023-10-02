const Router = require('express')
const router = new Router()
const jsonaController= require('../controllers/jsonaController')


router.post('/update', jsonaController.updateJson) // № 5
router.post('/fetch', jsonaController.fetchJson) // № 5
// router.post('/update-price-by-exel', jsonaController.updatePriceByExel) // № 5
router.post('/fetch-price-of-produce', jsonaController.fetchPriceOfProduce) // № 5
// router.post('/create', jsonaController.createPrice) // № 5


module.exports = router