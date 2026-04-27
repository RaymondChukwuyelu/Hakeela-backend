const signupSchema = require("../JoiValidations/signupSchema")
const User = require("../models/user")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const generateTokens = require("../utils/generateTokens")
const jwt = require("jsonwebtoken")

//SIGNUP API LOGIC

const signup = async (req, res) => {
    const { error } = signupSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    try {
        const { email, password, profile } = req.body;
        const normalizedEmail = email.toLowerCase();
        // check if user exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // generate verification token
        const token = crypto.randomBytes(32).toString("hex");

        // create user (not verified)
        const newUser = new User({
            email: normalizedEmail,
            password: hashedPassword,
            profile,
            emailVerified: false,
            verificationToken: token,
            tokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
        });

        await newUser.save();

        // send email link
        const verifyLink = `${process.env.APP_URL}/api/auth/verify-email?token=${token}&uid=${newUser._id}`;

        await sendEmail(
            normalizedEmail,
            "Verify your email",
            `Click this link to verify your account: ${verifyLink}`
        );

        return res.status(201).json({
            success: true,
            message: "User created, check your email to verify account",
            user: {
                id: newUser._id,
                email: newUser.email,
                emailVerified: newUser.emailVerified,
                profile: newUser.profile
            }
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//verify email logic
const verifyEmail = async (req, res) => {
    try {
        const { token, uid } = req.query

        //find user by id
        const user = await User.findById(uid)

        //check if user does not exist / token is not verified / token is expired
        if (!user || user?.verificationToken !== token || user?.tokenExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired link" });
        }


        //mark verification succesfull and reset the tokens
        user.emailVerified = true
        user.verificationToken = null
        user.tokenExpires = null
        await user.save()
        const { accessToken, refreshToken } = generateTokens({ _id: user._id})

        const newHashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        user.refreshToken = newHashedRefreshToken
        await user.save()

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod (HTTPS required)
            sameSite: "none", // "none" in prod (needed for different domains)
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        })

        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                emailVerified: user.emailVerified,
                profile: user.profile
            },
        })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ success: false, message: "Invalid or expired link" });
    }
}

//login logic
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const normalizedEmail = email.toLowerCase();
        // find user 
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }

        if (!user.emailVerified) {
            return res.status(403).json({ success: false, message: "Verify your email first" })
        }

        //compare password
        const validatedUser = await bcrypt.compare(password, user.password)

        if (!validatedUser) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }
        //Generate tokens
        const { accessToken, refreshToken } = generateTokens({ _id: user._id })

        const newHashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        user.refreshToken = newHashedRefreshToken
        await user.save()

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod (HTTPS required)
            sameSite: "none", // "none" in prod (needed for different domains)
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        })
        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                emailVerified: user.emailVerified,
                profile: user.profile
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Server error" });

    }
}

//send-otp logic
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // find user
        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        //generate otp (6-digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        //set expiry (10 mins)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

        //save  to user
        user.otp = otp
        user.otpExpires = otpExpires
        user.otpVerified = false
        await user.save()

        // send otp
        await sendEmail(
            normalizedEmail,
            "Your OTP Code",
            `Your OTP is: ${otp}. It expires in 10 minutes.`
        );

        res.status(200).json({ success: true, message: "OTP sent" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

//verify-otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email required"
            })
        }

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP required"
            })
        }

        const normalizedEmail = email.toLowerCase().trim()

        //find user
        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        //check if otp exists
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ success: false, message: "OTP not requested" })
        }

        //check if otp is expired
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: "OTP is expired" })
        }

        //check match
        if (otp !== user.otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" })
        }

        //clear otp && verify otp
        user.otpVerified = true
        user.otp = null
        user.otpExpires = null

        await user.save()

        return res.status(200).json({
            success: true, message: "OTP verified successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

//resetPswd
const resetPswd = async (req, res) => {
    try {
        const { email, newPassword } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Email required" })
        }

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "Password required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password too short"
            })
        }
        const normalizedEmail = email.toLowerCase().trim()

        //find user
        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        //check if otp verified
        if (!user.otpVerified) {
            return res.status(400).json({ success: false, message: "OTP not verified" })
        }

        //hash new pswd
        const newHashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = newHashedPassword
        user.otp = null
        user.otpExpires = null
        user.otpVerified = false

        await user.save()

        return res.status(200).json({ success: true, message: "Password reset succesfully" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

//refreshToken logic
const refreshToken = async (req, res) => {
    try {
        const userRefreshToken = req.cookies.refreshToken
        // check for refreshtoken 
        if (!userRefreshToken) {
            return res.status(401).json({ success: false, message: "No refreshToken provided" })
        }

        //verify refreshtoken
        let decodedUser;

        try {
            decodedUser = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_KEY)
        } catch (err) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" })
        }

        //find user  
        const user = await User.findById(decodedUser._id)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (!user.refreshToken) {
            return res.status(403).json({ success: false, message: "No refreshToken stored" })
        }

        //compare tokens
        const isValid = await bcrypt.compare(userRefreshToken, user.refreshToken)

        if (!isValid) {
            return res.status(403).json({ success: false, message: "RefreshToken is not Valid" })
        }

        //generate new Tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens({ _id: user._id})

        const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10)
        user.refreshToken = newHashedRefreshToken
        await user.save()

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod (HTTPS required)
            sameSite: "none", // "none" in prod (needed for different domains)
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        })

        res.status(200).json({ success: true, accessToken })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

//userProfile logic
const userProfile = async (req, res) => {
    try {

        const userId = req.user._id

        //find user
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const profileData = {
            id: user._id,
            email: user.email,
            emailVerified: user.emailVerified,
            profile: user.profile
        }

        res.status(200).json({ success: true, message: "Profile fetched successfully", user: profileData })

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}
//logout logic
const logout = async (req, res) => {

    try {
        const userRefreshToken = req.cookies.refreshToken
        //check for refreshtoken
        if (!userRefreshToken) {
            return res.status(200).json({ success: true, message: "Already logged out" })
        }
        //verify refreshtoken
        let decodedUser;

        try {
            decodedUser = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_KEY)
        } catch (err) {
            return res.status(403).json({ success: false, message: "Invalid Refresh token" })
        }

        //find user
        const user = await User.findById(decodedUser._id)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        //reset user refreshtoken
        user.refreshToken = null
        await user.save()

        //reset cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod (HTTPS required)
            sameSite: "none", // "none" in prod (needed for different domains)
        })

        //send success message
        return res.status(200).json({ success: true, message: "logged out succesfully" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


module.exports = {
    signup,
    verifyEmail,
    login,
    sendOtp,
    verifyOtp,
    resetPswd,
    refreshToken,
    userProfile,
    logout
}