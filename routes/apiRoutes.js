const express = require("express")
const router = express.Router()
const { createMeeting } = require('../controllers/apiController')


/**
 * @swagger
 * /video/create-meeting:
 *   post:
 *     summary: Create a Zoom instant meeting
 *     description: Generates a Zoom access token using Server-to-Server OAuth and creates an instant Zoom meeting.
 *     tags:
 *       - Zoom
 *     responses:
 *       200:
 *         description: Zoom meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 join_url:
 *                   type: string
 *                   example: https://zoom.us/j/123456789?pwd=abcdefgh
 *       500:
 *         description: Failed to create Zoom meeting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create meeting
 */
router.post('/create-meeting', createMeeting)

module.exports = router