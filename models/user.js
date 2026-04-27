const mongoose = require("mongoose");

//SCHEMA FOR USERS
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verificationToken: { type: String, default: null },
    tokenExpires: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    otpVerified: { type: Boolean, default: false },
    profile: {
        fullName: { type: String, required: true },
        gender: { type: String },
        phoneNumber: { type: String },
        country: { type: String, default: "Nigeria" },
        referralSource: { type: String },
        lowIncomeBackground: { type: String },
        specialNeeds: { type: String },
        specialNeedsDetails: { type: String }
    },
    createdAt: { type: Date, default: Date.now }

})

const User = mongoose.model("User", userSchema)

module.exports = User