const ocrService = require('../services/ocr.service');
const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/prisma');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
      const uploadDir = path.join(__dirname, '../uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'medicine_' + uniqueSuffix + ext);
    }
  });

  const upload = multer({
    storage: multer.memoryStorage(), // เก็บในหน่วยความจำ
    limits: {
      fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      // ตรวจสอบประเภทไฟล์ที่อนุญาต
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('ไฟล์ไม่ถูกต้อง รองรับเฉพาะรูปภาพ (jpeg, jpg, png, gif)'));
      }
    }
  });

  exports.processImage = async (req, res) => {
    try {
      console.log('Processing image in controller...');
      
      // ตรวจสอบว่ามีไฟล์หรือไม่ (ตรวจซ้ำอีกครั้ง)
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'ไม่พบไฟล์รูปภาพ'
        });
      }
      
      // แปลงไฟล์เป็น buffer (จาก memory storage)
      const imageBuffer = req.file.buffer;
      
      // บันทึกไฟล์ลงดิสก์ถ้าจำเป็น (ถ้าต้องการใช้ดิสก์)
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, imageBuffer);
      
      console.log('Image saved to:', filePath);
      
      // ในกรณีที่ OCR API ไม่ทำงาน ให้ส่งข้อมูลตัวอย่าง
      const mockData = {
        name: "ตัวอย่าง: เมทฟอร์มิน",
        dosage: "500 มิลลิกรัม",
        intakeTime: "หลังอาหาร เช้า เย็น",
        drugUses: "ควบคุมระดับน้ำตาลในเลือด",
        isMockData: true
      };
      
      // ส่งผลลัพธ์กลับไป
      return res.status(200).json({
        success: true,
        message: 'อัพโหลดและประมวลผลรูปภาพสำเร็จ',
        data: mockData,
        imageUrl: `/uploads/${fileName}`
      });
      
    } catch (error) {
      console.error('Error in processImage controller:', error);
      return res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ',
        details: error.message
      });
    }
  };

exports.getMedicineRecords = async (req, res) => {
    try {
        // ตรวจสอบว่ามีการ query ข้อมูลจาก database จริงหรือไม่
        const records = await prisma.medicineRecord.findMany({
            where: {
                userId: req.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // ส่งข้อมูลกลับไปยัง client
        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            success: false
        });
    }
};

exports.saveMedicineRecord = async (req, res) => {
    try {
        const { name, dosage, timing, frequency, purpose, strength, isDiabetesMedicine } = req.body;
        
        if (!name) {
            return res.status(400).json({
                error: 'ต้องระบุชื่อยา',
                success: false
            });
        }
        
        // บันทึกข้อมูลลงฐานข้อมูล
        const record = await prisma.medicineRecord.create({
            data: {
              name: "metformin",
              dosage: "ครั้งละ 1 เม็ด",
              intakeTime: "วันละ 2 ครั้ง หลังอาหาร เช้า เย็น",  // เปลี่ยนจาก timing เป็น intakeTime
              purpose: "ยาเบาหวาน",
              isDiabetesMedicine: true,
              userId: 3,
              // ลบ frequency และ strength ที่เป็น undefined ออก
            }
          })
        
        res.status(201).json({
            message: 'บันทึกข้อมูลสำเร็จ',
            data: record,
            success: true
        });
    } catch (error) {
        console.error('Error saving record:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            details: error.message,
            success: false
        });
    }
};

// ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่
exports.ping = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            success: true
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            success: false
        });
    }
};