const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const ocr_controller = require('../controller/ocr_controller');

// 1. แก้ไขการตั้งค่า multer ให้ใช้ memoryStorage แทน
const storage = multer.memoryStorage(); // ใช้ memory storage แทน disk storage

// 2. ปรับแต่งการตั้งค่า multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาด 5MB
  },
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG และ JPG เท่านั้น'), false);
    }
  }
});

// 3. ปรับปรุง middleware สำหรับการจัดการการอัพโหลด
router.post('/scan', verifyToken, (req, res, next) => {
  // ใช้ multer middleware แบบ inline
  upload.single('image')(req, res, function(err) {
    // จัดการกับข้อผิดพลาดจาก multer
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: `เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ${err.message}`,
        code: err.code
      });
    } else if (err) {
      console.error('Non-multer error:', err);
      return res.status(400).json({
        success: false,
        error: `เกิดข้อผิดพลาด: ${err.message}`
      });
    }
    
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'กรุณาอัพโหลดรูปภาพ'
      });
    }
    
    // 4. เพิ่มการ log ข้อมูลเพื่อตรวจสอบ
    console.log('File uploaded successfully:', { 
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // ดำเนินการต่อไปยัง controller
    next();
  });
}, ocr_controller.processImage);

// 5. เพิ่ม route สำหรับทดสอบการเชื่อมต่อ
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OCR service is running'
  });
});

module.exports = router;