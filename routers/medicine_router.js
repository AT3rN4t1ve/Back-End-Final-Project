const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const medicineController = require('../controller/medicine_controller');

// สร้างข้อมูลยาใหม่
router.post('/medicines', verifyToken, medicineController.createMedicine);

// ดึงข้อมูลยาทั้งหมดของผู้ใช้
router.get('/medicines', verifyToken, medicineController.getMedicines);

// ดึงข้อมูลยาตาม ID
router.get('/medicines/:id', verifyToken, medicineController.getMedicineById);

// อัพเดตข้อมูลยา
router.put('/medicines/:id', verifyToken, medicineController.updateMedicine);

// ลบข้อมูลยา
router.delete('/medicines/:id', verifyToken, medicineController.deleteMedicine);

// ดึงข้อมูลยาเบาหวานทั้งหมดของผู้ใช้
router.get('/diabetes-medicines', verifyToken, medicineController.getDiabetesMedicines);

module.exports = router;