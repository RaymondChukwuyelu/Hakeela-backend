const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authorization token required" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)
        req.user = decodedUser
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            })
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })

    }
}
module.exports = authMiddleware