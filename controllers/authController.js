const signupSchema = require("../JoiValidations/signupSchema")
const User = require("../models/user")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const generateTokens = require("../utils/generateTokens")

//SIGNUP API LOGIC

const signup = async (req, res) => {
    const { error } = signupSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { email, password, profile } = req.body;
        const normalizedEmail = email.toLowerCase();
        // check if user exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
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
            message: "User created, check your email to verify account"
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" });
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
            return res.status(400).send("Invalid or expired link");
        }


        //mark verification succesfull and reset the tokens
        user.emailVerified = true
        user.verificationToken = null
        user.tokenExpires = null
        await user.save()

        //dev send respose
        return res.status(200).json({ message: "user verified" })

        //prod redirect users
        // return res.redirect(`${process.env.CLIENT_URL}/verify-success`);
    } catch (err) {
        console.log(err)

        //dev send response
        return res.status(400).json({message: "Invalid or expired link"});
        //prod redirect user 
        // return res.redirect(`${process.env.CLIENT_URL}/verify-error`);

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
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: "Verify your email first" })
        }

        //compare password
        const validatedUser = await bcrypt.compare(password, user.password)

        if (!validatedUser) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }
        //Generate tokens
        const { accessToken, refreshToken } = generateTokens({ _id: user._id, name: user.name })
        const newHashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        user.refreshToken = newHashedRefreshToken
        await user.save()

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod (HTTPS required)
            sameSite: "lax", // "none" in prod (needed for different domains)
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        })
        return res.json({ accessToken })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" });

    }
}

module.exports = {
    signup,
    verifyEmail,
    login
}