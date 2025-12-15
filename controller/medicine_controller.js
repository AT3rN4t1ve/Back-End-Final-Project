const prisma = require('../prisma/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างมอดูล medicineMatcher แบบ inline
const medicineMatcher = (() => {
  const diabetesMedicineList = [
    // ยากลุ่ม Biguanides
    'เมทฟอร์มิน', 'metformin', 'glucophage',
    
    // ยากลุ่ม Sulfonylureas
    'กลิเบนคลาไมด์', 'glibenclamide', 'glyburide',
    'กลิไพไซด์', 'glipizide', 'glucotrol',
    'กลิคลาไซด์', 'gliclazide', 'diamicron',
    'ไกลเมพิไรด์', 'glimepiride', 'amaryl',
    
    // ยากลุ่ม Alpha-glucosidase inhibitors
    'อคาร์โบส', 'acarbose', 'glucobay',
    
    // ยากลุ่ม Thiazolidinediones
    'ไพโอกลิตาโซน', 'pioglitazone', 'actos',
    'โรซิกลิตาโซน', 'rosiglitazone', 'avandia',
    
    // ยากลุ่ม DPP-4 inhibitors
    'ซิตากลิปติน', 'sitagliptin', 'januvia',
    'วิลดากลิปติน', 'vildagliptin', 'galvus',
    'แซกซากลิปติน', 'saxagliptin', 'onglyza',
    'ลินากลิปติน', 'linagliptin', 'trajenta',
    
    // ยากลุ่ม SGLT2 inhibitors
    'เอมพากลิโฟลซิน', 'empagliflozin', 'jardiance',
    'ดาพากลิโฟลซิน', 'dapagliflozin', 'forxiga',
    'คานากลิโฟลซิน', 'canagliflozin', 'invokana',
    
    // ยากลุ่ม GLP-1 agonists
    'ลิรากลูไทด์', 'liraglutide', 'victoza',
    'เอ็กซีนาไทด์', 'exenatide', 'byetta', 'bydureon',
    'ดูลากลูไทด์', 'dulaglutide', 'trulicity',
    'เซมากลูไทด์', 'semaglutide', 'ozempic'
  ];
  
  // ฟังก์ชันสำหรับตรวจสอบความคล้ายกันของข้อความแบบง่าย
  function stringSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // วิธีคำนวณความคล้ายอย่างง่าย
    // หากข้อความหนึ่งเป็นส่วนหนึ่งของอีกข้อความหนึ่ง
    if (s1.includes(s2) || s2.includes(s1)) {
      const maxLength = Math.max(s1.length, s2.length);
      const minLength = Math.min(s1.length, s2.length);
      return minLength / maxLength;
    }
    
    // หาความคล้าย (หากมีคำที่คล้ายกัน)
    let commonChars = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) {
        commonChars++;
      }
    }
    return commonChars / Math.max(s1.length, s2.length);
  }
  
  // ฟังก์ชันตรวจสอบยาเบาหวาน
  function findClosestDiabetesMedicine(medicineName, threshold = 0.6) {
    if (!medicineName) return { name: '', similarity: 0, isDiabetesMedicine: false };
    
    const lowercaseName = medicineName.toLowerCase().trim();
    
    // ตรวจสอบ exact match ก่อน
    const exactMatch = diabetesMedicineList.find(
      medicine => medicine.toLowerCase() === lowercaseName
    );
    
    if (exactMatch) {
      return { 
        name: exactMatch, 
        similarity: 1.0,
        isDiabetesMedicine: true 
      };
    }
    
    // ถ้าไม่มี exact match ใช้ fuzzy matching
    let bestMatch = '';
    let bestScore = 0;
    
    for (const medicine of diabetesMedicineList) {
      const score = stringSimilarity(lowercaseName, medicine.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = medicine;
      }
    }
    
    if (bestScore >= threshold) {
      return {
        name: bestMatch,
        similarity: bestScore,
        isDiabetesMedicine: true
      };
    }
    
    // ตรวจสอบด้วย regex เพิ่มเติม
    if (containsDiabetesMedicineByRegex(medicineName)) {
      return {
        name: medicineName,
        similarity: 0.8,
        isDiabetesMedicine: true
      };
    }
    
    return { 
      name: medicineName, 
      similarity: bestScore, 
      isDiabetesMedicine: false 
    };
  }
  
  // ฟังก์ชันตรวจสอบด้วย regex
  function containsDiabetesMedicineByRegex(text) {
    if (!text) return false;
    const lowercaseText = text.toLowerCase();
    
    const patterns = [
      /เมท[ฟทต]อร์(มิน|มีน|มีด)/i,
      /[gk]l[uiy][ck][oa][szc][ei][dt][ea]/i,
      /[gk]li[bp][ei][nz][ck]lam[ia]d[ea]/i,
      /[gk]lim[ea]p[iy]ri[dt][ea]/i,
      /pi[ou][gk]li[td]a[zs][ou]n[ea]/i,
      /s[iy]ta[gk]li[pb]t[iy]n/i,
      /[ea]mpa[gk]li[ft]lo[sz][iy]n/i,
      /a[ck]arb[ou][sz][ea]/i
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(lowercaseText)) {
        return true;
      }
    }
    
    return false;
  }
  
  // ฟังก์ชันตรวจสอบคำที่เกี่ยวข้องกับเบาหวาน
  function hasDiabetesKeywords(text) {
    if (!text) return false;
    
    const diabetesKeywords = [
      'เบาหวาน', 'น้ำตาลในเลือด', 'น้ำตาลสูง', 'ระดับน้ำตาล',
      'diabetes', 'blood sugar', 'glucose', 'hyperglycemia',
      'insulin', 'อินซูลิน', 'glycemic', 'a1c', 'type 1', 'type 2'
    ];
    
    const lowercaseText = text.toLowerCase();
    return diabetesKeywords.some(keyword => lowercaseText.includes(keyword));
  }
  
  return {
    findClosestDiabetesMedicine,
    containsDiabetesMedicineByRegex,
    hasDiabetesKeywords,
    diabetesMedicineList
  };
})();

// ตั้งค่า multer สำหรับอัพโหลดไฟล์
const storage = multer.memoryStorage(); // เก็บไฟล์ในรูปแบบ buffer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาด 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น'));
    }
  }
});

// ผูกฟังก์ชัน Middleware สำหรับการอัพโหลดไฟล์
exports.uploadMiddleware = upload.single('image');

// สแกนยาด้วย OCR
exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'กรุณาอัพโหลดรูปภาพ'
      });
    }

    // แปลงไฟล์เป็น buffer
    const imageBuffer = req.file.buffer;

    // ในสถานการณ์จริง คุณอาจเรียกใช้บริการ OCR เช่น Google Vision API ที่นี่
    // แต่สำหรับตัวอย่างนี้ เราจะสมมติว่าได้ผลลัพธ์จาก OCR แล้ว
    
    // ตัวอย่างข้อความที่ได้จาก OCR (จำลอง)
    const ocrText = extractTextFromImage(imageBuffer);

    // วิเคราะห์ข้อความที่ได้จาก OCR เพื่อหาข้อมูลยา
    const medicineData = parseMedicineText(ocrText);

    // ตรวจสอบและปรับปรุงข้อมูลด้วย medicineMatcher
    const medicineMatch = medicineMatcher.findClosestDiabetesMedicine(medicineData.name, 0.5);
    
    // ถ้าพบชื่อยาเบาหวานที่คล้ายกัน ให้ใช้ชื่อที่ถูกต้อง
    const correctedName = medicineMatch.similarity > 0.5 ? medicineMatch.name : medicineData.name;
    medicineData.name = correctedName;
    medicineData.isDiabetesMedicine = medicineMatch.isDiabetesMedicine;

    // ถ้าเป็นยาเบาหวานแต่ไม่มีข้อมูลสรรพคุณ
    if (medicineMatch.isDiabetesMedicine && (!medicineData.purpose || medicineData.purpose.trim() === '')) {
      medicineData.purpose = "ควบคุมระดับน้ำตาลในเลือด";
    }

    // บันทึกข้อมูลยาลงฐานข้อมูล
    // สร้าง directory สำหรับเก็บรูปภาพถ้ายังไม่มี
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // บันทึกไฟล์รูปภาพ
    const timestamp = Date.now();
    const filename = `${timestamp}_${req.file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    // สร้างข้อมูลยาในฐานข้อมูล
    const medicine = await prisma.medicine.create({
      data: {
        name: medicineData.name,
        pillCount: medicineData.pillCount,
        purpose: medicineData.purpose,
        intakeTime: medicineData.intakeTime,
        userId: req.userId,
        isDiabetesMedicine: medicineData.isDiabetesMedicine,
        imageUrl: `/uploads/${filename}`
      }
    });

    res.status(201).json({
      message: 'สแกนและบันทึกข้อมูลยาสำเร็จ',
      data: medicine,
      originalText: ocrText
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการวิเคราะห์ภาพ: ' + error.message
    });
  }
};

// ฟังก์ชันแยกข้อความจากรูปภาพ (จำลอง)
function extractTextFromImage(imageBuffer) {
  // ในสถานการณ์จริง คุณจะเรียกใช้บริการ OCR ที่นี่
  // แต่สำหรับตัวอย่าง เราจะส่งคืนข้อความตัวอย่าง
  
  // ตัวอย่างข้อความที่อาจได้จากการสแกนฉลากยา
  return `
    เมทฟอร์มิน 500 มก.
    รับประทานครั้งละ 1 เม็ด
    วันละ 2 ครั้ง หลังอาหาร เช้า-เย็น
    ใช้รักษาโรคเบาหวาน
    ผลิตโดย บริษัท ยาดีจำกัด
    Lot: A123456 Exp: 12/2025
  `;
}

// ฟังก์ชันแยกข้อมูลยาจากข้อความ OCR
function parseMedicineText(text) {
  // ข้อมูลเริ่มต้น
  const data = {
    name: '',
    pillCount: '',
    purpose: '',
    intakeTime: '',
    isDiabetesMedicine: false
  };
  
  if (!text || typeof text !== 'string') {
    return data;
  }
  
  // แยกบรรทัด
  const lines = text.split('\n');
  
  try {
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const lowerLine = trimmedLine.toLowerCase();
      
      // หาชื่อยา
      if (/เมท[ฟทต]อร์(มิน|มีน)/.test(lowerLine) || /metformin/i.test(lowerLine)) {
        data.name = 'เมทฟอร์มิน';
        
        // ดึงขนาดยา
        const mgMatch = trimmedLine.match(/(\d+)\s*(มก\.|mg)/i);
        if (mgMatch) {
          data.pillCount = mgMatch[1] + ' ' + mgMatch[2];
        }
      }
      else if (/กลิ[เพไพ][ไซซิ]ด์|glipizide/i.test(lowerLine)) {
        data.name = 'กลิไพไซด์';
      }
      else if (/กลิ[คค]ลา[ไซซิ]ด์|gliclazide/i.test(lowerLine)) {
        data.name = 'กลิคลาไซด์';
      }
      else if (/ไพโอกลิตาโซน|pioglitazone/i.test(lowerLine)) {
        data.name = 'ไพโอกลิตาโซน';
      }
      
      // หาข้อมูลการทาน
      if (/รับประทาน|ทาน/.test(lowerLine)) {
        data.intakeTime = trimmedLine;
      }
      else if (/วันละ|ครั้ง|เช้า|กลางวัน|เย็น|ก่อนนอน/.test(lowerLine)) {
        if (!data.intakeTime) {
          data.intakeTime = trimmedLine;
        } else {
          data.intakeTime += ' ' + trimmedLine;
        }
      }
      
      // หาสรรพคุณ
      if (/เบาหวาน|น้ำตาลในเลือด|น้ำตาลสูง|diabetes|blood sugar/i.test(lowerLine)) {
        data.purpose = 'ควบคุมระดับน้ำตาลในเลือด';
        data.isDiabetesMedicine = true;
      }
      else if (/รักษา|บรรเทา|ลด|ควบคุม/.test(lowerLine)) {
        data.purpose = trimmedLine;
      }
    }
  } catch (e) {
    console.error('Error parsing medicine text:', e);
  }
  
  // ถ้าไม่พบข้อมูลให้ใช้ค่าเริ่มต้น
  if (!data.name) data.name = 'ไม่สามารถระบุชื่อยา';
  if (!data.pillCount) data.pillCount = 'ไม่ระบุ';
  if (!data.intakeTime) data.intakeTime = 'ไม่ระบุ';
  if (!data.purpose) data.purpose = 'ไม่ระบุ';
  
  return data;
}

// เพิ่มข้อมูลยาใหม่
exports.createMedicine = async (req, res) => {
  try {
    const { name, pillCount, purpose, intakeTime } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'ต้องระบุชื่อยา'
      });
    }

    // ตรวจสอบและแก้ไขชื่อยาให้ถูกต้อง
    const medicineMatch = medicineMatcher.findClosestDiabetesMedicine(name, 0.5);
    
    // ถ้าพบชื่อยาเบาหวานที่คล้ายกัน ให้ใช้ชื่อที่ถูกต้อง
    const correctedName = medicineMatch.similarity > 0.5 ? medicineMatch.name : name;
    let correctedPurpose = purpose;
    
    // ถ้าเป็นยาเบาหวานแต่ไม่มีข้อมูลสรรพคุณ
    if (medicineMatch.isDiabetesMedicine && (!purpose || purpose.trim() === '')) {
      correctedPurpose = "ควบคุมระดับน้ำตาลในเลือด";
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: correctedName,
        pillCount,
        purpose: correctedPurpose,
        intakeTime,
        userId: req.userId,
        isDiabetesMedicine: medicineMatch.isDiabetesMedicine
      }
    });

    res.status(201).json({
      message: 'บันทึกข้อมูลยาสำเร็จ',
      data: medicine,
      correction: medicineMatch.similarity < 1 && medicineMatch.similarity > 0.5 ? {
        original: name,
        corrected: correctedName,
        similarity: medicineMatch.similarity
      } : null
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    });
  }
};

// ดึงข้อมูลยาทั้งหมดของผู้ใช้ - ปรับปรุงเพื่อกรองเฉพาะยาเบาหวาน
exports.getDiabetesMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        userId: req.userId,
        isDiabetesMedicine: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      data: medicines
    });
  } catch (error) {
    console.error('Error fetching diabetes medicines:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// ดึงข้อมูลยาทั้งหมดของผู้ใช้
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      data: medicines
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// ดึงข้อมูลยาตาม ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicineId = parseInt(req.params.id);
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: medicineId,
        userId: req.userId
      }
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'ไม่พบข้อมูลยา'
      });
    }

    res.status(200).json({
      data: medicine
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// อัพเดตข้อมูลยา
exports.updateMedicine = async (req, res) => {
  try {
    const medicineId = parseInt(req.params.id);
    const { name, pillCount, purpose, intakeTime } = req.body;

    const medicine = await prisma.medicine.findFirst({
      where: {
        id: medicineId,
        userId: req.userId
      }
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'ไม่พบข้อมูลยา'
      });
    }

    // ตรวจสอบและแก้ไขชื่อยาถ้ามีการเปลี่ยนแปลง
    let updatedName = name;
    let updatedPurpose = purpose;
    let isDiabetesMed = medicine.isDiabetesMedicine;

    if (name && name !== medicine.name) {
      const medicineMatch = medicineMatcher.findClosestDiabetesMedicine(name, 0.5);
      updatedName = medicineMatch.similarity > 0.5 ? medicineMatch.name : name;
      isDiabetesMed = medicineMatch.isDiabetesMedicine;
      
      // ถ้าเป็นยาเบาหวานแต่ไม่มีข้อมูลสรรพคุณ
      if (medicineMatch.isDiabetesMedicine && (!purpose || purpose.trim() === '')) {
        updatedPurpose = "ควบคุมระดับน้ำตาลในเลือด";
      }
    }

    const updatedMedicine = await prisma.medicine.update({
      where: {
        id: medicineId
      },
      data: {
        name: updatedName,
        pillCount,
        purpose: updatedPurpose,
        intakeTime,
        isDiabetesMedicine: isDiabetesMed
      }
    });

    res.status(200).json({
      message: 'อัพเดตข้อมูลยาสำเร็จ',
      data: updatedMedicine
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการอัพเดตข้อมูล'
    });
  }
};

// ลบข้อมูลยา
exports.deleteMedicine = async (req, res) => {
  try {
    const medicineId = parseInt(req.params.id);
    
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: medicineId,
        userId: req.userId
      }
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'ไม่พบข้อมูลยา'
      });
    }

    // ถ้ามีรูปภาพที่เกี่ยวข้อง ให้ลบด้วย
    if (medicine.imageUrl) {
      const imagePath = path.join(__dirname, '..', medicine.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.medicine.delete({
      where: {
        id: medicineId
      }
    });

    res.status(200).json({
      message: 'ลบข้อมูลยาสำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการลบข้อมูล'
    });
  }
};

// ค้นหายาตามชื่อ
exports.searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'กรุณาระบุคำค้นหา'
      });
    }
    
    const medicines = await prisma.medicine.findMany({
      where: {
        userId: req.userId,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            purpose: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      data: medicines
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล'
    });
  }
};

// ดึงประวัติการทานยาของผู้ใช้
exports.getMedicineHistory = async (req, res) => {
  try {
    const history = await prisma.medicineHistory.findMany({
      where: {
        userId: req.userId
      },
      include: {
        medicine: true
      },
      orderBy: {
        takenAt: 'desc'
      }
    });

    res.status(200).json({
      data: history
    });
  } catch (error) {
    console.error('Error fetching medicine history:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงประวัติการทานยา'
    });
  }
};

// บันทึกประวัติการทานยา
exports.takeMedicine = async (req, res) => {
  try {
    const { medicineId, takenAt, note } = req.body;
    
    if (!medicineId) {
      return res.status(400).json({
        error: 'ต้องระบุยาที่ทาน'
      });
    }

    // ตรวจสอบว่ายามีอยู่จริงหรือไม่
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: parseInt(medicineId),
        userId: req.userId
      }
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'ไม่พบข้อมูลยา'
      });
    }

    // บันทึกประวัติการทานยา
    const history = await prisma.medicineHistory.create({
      data: {
        medicineId: parseInt(medicineId),
        userId: req.userId,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
        note: note || ''
      }
    });

    res.status(201).json({
      message: 'บันทึกประวัติการทานยาสำเร็จ',
      data: history
    });
  } catch (error) {
    console.error('Error recording medicine intake:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการบันทึกประวัติการทานยา'
    });
  }
};
