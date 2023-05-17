const Router = require('express')
const router = new Router()
const deviceRouter = require('./deviceRouter')

router.use('/device', deviceRouter)

module.exports = router
