const Router = require('express')
const router = new Router()
const deviceRouter = require('./deviceRouter')
const userRouter = require('./userRouter')
const reviewRouter = require('./reviewRouter')
const goodsRouter = require('./goodsRouter')

router.use('/user', userRouter)
router.use('/device', deviceRouter)
router.use('/review', reviewRouter)
router.use('/goods', goodsRouter)


module.exports = router
 