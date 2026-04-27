const express = require("express")
const router = express.Router()
const { signup, verifyEmail, login, refreshToken, logout, sendOtp, verifyOtp, resetPswd } = require('../controllers/authController')



/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create new user
 *     description: Creates a new user account, hashes password, saves user to database, and sends email verification link.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   gender:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   country:
 *                     type: string
 *                   referralSource:
 *                     type: string
 *                   lowIncomeBackground:
 *                     type: string
 *                   specialNeeds:
 *                     type: string
 *                   specialNeedsDetails:
 *                     type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/signup', signup)


/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email
 *     description: Verifies user email using token and uid, then returns access token and user data
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *       - in: query
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid or expired link
 */

router.get('/verify-email', verifyEmail)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return access token
 *     description: Authenticates user with email and password, checks email verification, returns JWT access token and user info, and sets refresh token in httpOnly cookie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Server error
 */
router.post('/login', login)

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user email
 *     description: Generates a 6-digit OTP, saves it in DB with expiry, and sends it to the user's email.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/send-otp', sendOtp)

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP sent to the user's email for password reset or verification.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid, expired, or missing OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', verifyOtp)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password after OTP verification.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: OTP not verified or invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPswd)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token and refresh token using the refresh token stored in cookies.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: No refresh token provided
 *       403:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: User not found
 */
router.post('/refresh', refreshToken)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears refresh token from database and removes refreshToken cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully or already logged out
 *         content:
 *           application/json:
 *             example:
 *               message: logged out successfully
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid Refresh token
 *       403:
 *         description: Forbidden (token issues or missing stored token)
 *         content:
 *           application/json:
 *             examples:
 *               noToken:
 *                 value:
 *                   message: No refreshToken stored
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/logout', logout)


module.exports = router
