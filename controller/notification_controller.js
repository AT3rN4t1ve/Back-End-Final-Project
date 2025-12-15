const prisma = require('../prisma/prisma');



// ดึงรายการแจ้งเตือนของผู้ใช้
exports.getNotifications = async (req, res) => {
    try {
        // ดึงข้อมูลการแจ้งเตือนตามวันที่
        const date = req.query.date ? new Date(req.query.date) : new Date();
        
        // สมมติว่าเราเก็บการแจ้งเตือนในฐานข้อมูล
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.userId,
                isRead: false,
                notificationTime: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lte: new Date(date.setHours(23, 59, 59, 999)),
                },
            },
            orderBy: {
                notificationTime: 'asc',
            },
        });
        
        // สมมติว่ามีตารางบันทึกยาที่ทานแล้ว
        const takenMedicines = await prisma.takenMedicine.findMany({
            where: {
                userId: req.userId,
                takenAt: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lte: new Date(date.setHours(23, 59, 59, 999)),
                },
            },
            orderBy: {
                takenAt: 'asc',
            },
        });
        
        res.status(200).json({
            success: true,
            data: {
                notifications,
                takenMedicines
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน',
            details: error.message
        });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { medicineId, title, message, notificationTime } = req.body;
        
        if (!medicineId || !title || !message || !notificationTime) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }
        
        // สร้างการแจ้งเตือนใหม่
        const notification = await prisma.notification.create({
            data: {
                userId: req.userId,
                medicineId: parseInt(medicineId),
                title,
                message,
                notificationTime: new Date(notificationTime),
                isRead: false,
                createdAt: new Date()
            }
        });
        
        res.status(201).json({
            success: true,
            message: 'สร้างการแจ้งเตือนสำเร็จ',
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน',
            details: error.message
        });
    }
};

exports.markAsTaken = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ดึงข้อมูลการแจ้งเตือน
        const notification = await prisma.notification.findUnique({
            where: {
                id: parseInt(id),
                userId: req.userId
            }
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลการแจ้งเตือน'
            });
        }
        
        // บันทึกการทานยา
        await prisma.takenMedicine.create({
            data: {
                userId: req.userId,
                medicineId: notification.medicineId,
                notificationId: notification.id,
                takenAt: new Date(),
                note: ''
            }
        });
        
        // อัปเดตสถานะการแจ้งเตือน
        await prisma.notification.update({
            where: {
                id: parseInt(id)
            },
            data: {
                isRead: true
            }
        });
        
        res.status(200).json({
            success: true,
            message: 'บันทึกการทานยาสำเร็จ'
        });
    } catch (error) {
        console.error('Error marking as taken:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการบันทึกการทานยา',
            details: error.message
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        // อัปเดตการแจ้งเตือนทั้งหมดของผู้ใช้เป็นอ่านแล้ว
        const result = await prisma.notification.updateMany({
            where: {
                userId: req.userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        
        res.status(200).json({
            success: true,
            message: 'ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว',
            count: result.count
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านทั้งหมดแล้ว',
            details: error.message
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ตรวจสอบการแจ้งเตือน
        const notification = await prisma.notification.findUnique({
            where: {
                id: parseInt(id),
                userId: req.userId
            }
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลการแจ้งเตือน'
            });
        }
        
        // ลบการแจ้งเตือน
        await prisma.notification.delete({
            where: {
                id: parseInt(id)
            }
        });
        
        res.status(200).json({
            success: true,
            message: 'ลบการแจ้งเตือนสำเร็จ'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน',
            details: error.message
        });
    }
};