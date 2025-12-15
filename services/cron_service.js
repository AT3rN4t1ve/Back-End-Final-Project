const cron = require('node-cron');
const prisma = require('../prisma/prisma');

// เพิ่มฟังก์ชันหรือคลาสที่จำเป็น
const cronService = {
    // ใส่ฟังก์ชันจำเป็นตรงนี้
    init: function() {
      console.log('Cron service initialized');
    },
    startCronJobs: function() {
      console.log('Cron jobs started');
    }
  };
  
  module.exports = cronService;

// เริ่มต้นการทำงานของ Cron
function startCronJobs() {
    console.log('เริ่มต้นการทำงานตามกำหนดการ...');
    
    // ตรวจสอบและสร้างการแจ้งเตือนทุกวันเวลา 7:00, 11:30, 17:30
    cron.schedule('0 7 * * *', () => createMedicineReminders('เช้า', '7:00'));
    cron.schedule('30 11 * * *', () => createMedicineReminders('กลางวัน', '11:30'));
    cron.schedule('30 17 * * *', () => createMedicineReminders('เย็น', '17:30'));
    
    // ลบการแจ้งเตือนเก่าทุกวันเวลาเที่ยงคืน
    cron.schedule('0 0 * * *', () => cleanupOldNotifications());
}

// สร้างการแจ้งเตือนการทานยา
async function createMedicineReminders(period, timeStr) {
    try {
        console.log(`กำลังสร้างการแจ้งเตือนสำหรับช่วงเวลา ${period} (${timeStr})...`);
        
        // ดึงรายการยาที่กำลังใช้งานอยู่ทั้งหมด
        const medicines = await prisma.medicine.findMany({
            where: {
                isActive: true
            },
            include: {
                user: true
            }
        });
        
        // กรองยาตามช่วงเวลาของวัน
        const filteredMedicines = medicines.filter(medicine => {
            const intakeTime = medicine.intakeTime ? medicine.intakeTime.toLowerCase() : '';
            
            if (period === 'เช้า') {
                return intakeTime.includes('เช้า') || 
                       intakeTime.includes('วันละ') ||
                       intakeTime.includes('ก่อนอาหาร');
            } else if (period === 'กลางวัน') {
                return intakeTime.includes('กลางวัน') || 
                       intakeTime.includes('วันละ') || 
                       (intakeTime.includes('วันละ 2 ครั้ง') && 
                        !intakeTime.includes('ก่อนนอน'));
            } else if (period === 'เย็น') {
                return intakeTime.includes('เย็น') || 
                       intakeTime.includes('ก่อนนอน') || 
                       intakeTime.includes('วันละ') || 
                       (intakeTime.includes('วันละ 2 ครั้ง') && 
                        !intakeTime.includes('เช้า'));
            }
            
            return false;
        });
        
        // สร้างการแจ้งเตือนสำหรับแต่ละยา
        const notificationTime = new Date();
        let createdCount = 0;
        
        for (const medicine of filteredMedicines) {
            await prisma.notification.create({
                data: {
                    userId: medicine.userId,
                    title: `ถึงเวลาทานยา${medicine.name}`,
                    message: `ได้เวลาทานยา${medicine.name} ${medicine.intakeTime || ''} แล้ว อย่าลืมทานยาตามกำหนดเวลานะคะ`,
                    medicineId: medicine.id,
                    notificationTime: notificationTime,
                    isRead: false
                }
            });
            createdCount++;
        }
        
        console.log(`สร้างการแจ้งเตือนสำเร็จ: ${createdCount} รายการ`);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน:', error);
    }
}

// ลบการแจ้งเตือนเก่า (เก็บไว้ 30 วัน)
async function cleanupOldNotifications() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                },
                isRead: true // ลบเฉพาะที่อ่านแล้ว
            }
        });
        
        console.log(`ลบการแจ้งเตือนเก่าสำเร็จ: ${result.count} รายการ`);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบการแจ้งเตือนเก่า:', error);
    }
}

module.exports = {
    startCronJobs
};