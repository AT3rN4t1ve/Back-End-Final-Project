const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const notificationController = require('../controller/notification_controller');

// ดึงรายการแจ้งเตือนของผู้ใช้
router.get('/notifications', verifyToken, notificationController.getNotifications);

// ทำเครื่องหมายว่าอ่านการแจ้งเตือนแล้ว
router.put('/notifications/:id/read', verifyToken, notificationController.markAsTaken);

// ลบการแจ้งเตือน
router.delete('/notifications/:id', verifyToken, notificationController.deleteNotification);

// สร้างการแจ้งเตือนใหม่
router.post('/notifications', verifyToken, notificationController.createNotification);

// ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว
//router.put('/notifications/read-all', verifyToken, notificationController.markAllAsRead);

module.exports = router;