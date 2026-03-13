const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API untuk manajemen notifikasi user
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Ambil semua notifikasi milik user yang login
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data notifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       type:
 *                         type: string
 *                         enum: [reply, review, system]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get('/', authenticateToken, notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Tandai notifikasi tertentu sebagai sudah dibaca
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Notifikasi
 *     responses:
 *       200:
 *         description: Notifikasi berhasil diperbarui
 *       404:
 *         description: Notifikasi tidak ditemukan
 */
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

module.exports = router;