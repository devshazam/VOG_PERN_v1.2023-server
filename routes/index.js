const Router = require('express')
const router = new Router()
const deviceRouter = require('./deviceRouter')
const userRouter = require('./userRouter')
const reviewRouter = require('./reviewRouter')
const goodsRouter = require('./goodsRouter')
const priceRouter = require('./priceRouter')
const jsonaRouter = require('./jsonaRouter')

router.use('/user', userRouter)
router.use('/device', deviceRouter)
router.use('/review', reviewRouter)
router.use('/goods', goodsRouter)
router.use('/price', priceRouter)
router.use('/jsona', jsonaRouter)


module.exports = router
 