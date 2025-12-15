// const router = require('express').Router();
// const multer = require('multer');
// const { verifyToken } = require('../middleware/auth');
// const ocr_controller = require('../controller/ocr_controller');
// const { processImage, getMedicineRecords } = require('../controller/ocr_controller');

// // ตั้งค่า multer สำหรับอัพโหลดไฟล์
// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // จำกัดขนาด 5MB
//     },
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น'));
//         }
//     }
// });

// // Routes
// router.post('/scan', verifyToken, upload.single('image'), ocr_controller.processImage);
// router.post('/records', verifyToken, ocr_controller.saveMedicineRecord);

// module.exports = router;