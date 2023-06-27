
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    // return res.status(401).json(req.headers)
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1] // Bearer asfasnfkajsfnjk
        // return res.status(401).json({token})
        if (!token) {
            return res.status(401).json({message: "Не авторизован1"})
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        req.user = decoded
        next()
    } catch (e) {
        res.json({fjf: 23})
        // res.status(401).json({message: "Не авторизован1"})
    }
};