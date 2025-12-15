const stringSimilarity = require('string-similarity');

//ชื่อยาเบาหวานที่พบบ่อย
// โค้ดสำหรับไฟล์ utils/medicine_matcher.js
const diabetesMedicineList = [
  // ยากลุ่ม Biguanides
  'เมทฟอร์มิน', 'metformin', 'glucophage',
  
  // ยากลุ่ม Sulfonylureas
  'กลิเบนคลาไมด์', 'glibenclamide', 'glyburide',
  'กลิไพไซด์', 'glipizide', 'glucotrol',
  'กลิคลาไซด์', 'gliclazide', 'diamicron',
  'ไกลเมพิไรด์', 'glimepiride', 'amaryl'
];

// ฟังก์ชันตรวจสอบยาเบาหวานอย่างง่าย (simplified version)
function findClosestDiabetesMedicine(medicineName, threshold = 0.6) {
  if (!medicineName) return { name: '', similarity: 0, isDiabetesMedicine: false };
  
  // เช็คว่ามีในรายชื่อยาที่รู้จักหรือไม่
  const exactMatch = diabetesMedicineList.find(
    medicine => medicine.toLowerCase() === medicineName.toLowerCase()
  );
  
  if (exactMatch) {
    return { 
      name: exactMatch, 
      similarity: 1.0,
      isDiabetesMedicine: true 
    };
  }
  
  // ถ้าไม่มี exact match ให้ส่งค่าเดิมกลับไป
  return { 
    name: medicineName, 
    similarity: 0, 
    isDiabetesMedicine: false 
  };
//}

// ฟังก์ชันตรวจสอบด้วย regex อย่างง่าย
function containsDiabetesMedicineByRegex(text) {
  if (!text) return false;
  return false; // simplified version
}//

// ฟังก์ชันตรวจสอบคำที่เกี่ยวข้องกับเบาหวาน
function hasDiabetesKeywords(text) {
  if (!text) return false;
  
  const diabetesKeywords = [
    'เบาหวาน', 'น้ำตาลในเลือด', 'น้ำตาลสูง', 'ระดับน้ำตาล'
  ];
  
  const lowercaseText = text ? text.toLowerCase() : '';
  return diabetesKeywords.some(keyword => lowercaseText.includes(keyword));
}

// ส่งออกฟังก์ชัน
module.exports = {
  findClosestDiabetesMedicine,
  containsDiabetesMedicineByRegex,
  hasDiabetesKeywords,
  diabetesMedicineList
}}