const express = require("express")
const router = express.Router()
const { signup, verifyEmail, login } = require('../controllers/authController')


//SIGNUP API

//signup swagger docs
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
 *     summary: Verify user email
 *     description: Verifies user email using token sent via email link. Marks user as verified and clears token.
 *     tags: 
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to success or error page
 */
router.get('/verify-email', verifyEmail)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return access token
 *     description: Authenticates user with email and password, checks email verification, and returns JWT access token while setting refresh token in httpOnly cookie.
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
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Server error
 */
router.post('/login', login)
module.exports = router