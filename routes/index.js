const Router = require('express')
const router = new Router()
const deviceRouter = require('./deviceRouter')
const userRouter = require('./userRouter')
const reviewRouter = require('./reviewRouter')

router.use('/user', userRouter)
router.use('/device', deviceRouter)
router.use('/review', reviewRouter)


module.exports = router
