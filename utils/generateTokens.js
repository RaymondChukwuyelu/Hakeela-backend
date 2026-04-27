const jwt = require("jsonwebtoken")

const generateTokens = (data) => {
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_KEY, {expiresIn: "5min"})
    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_KEY, {expiresIn: "7d"})

    return {accessToken, refreshToken}
}

module.exports = generateTokens