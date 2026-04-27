const express = require("express")
const router = express.Router()
const { userProfile } = require('../controllers/authController')
const authMiddleware = require("../middleware/authMiddleware")

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the authenticated user's profile information.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authMiddleware, userProfile)

module.exports = router