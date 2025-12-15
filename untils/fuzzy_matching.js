// utils/fuzzy_matching.js
/**
 * ฟังก์ชันคำนวณระยะห่าง Levenshtein
 * @param {string} a ข้อความที่ 1
 * @param {string} b ข้อความที่ 2
 * @returns {number} ค่าระยะห่าง
 */
function levenshteinDistance(a, b) {
    const matrix = [];
  
    // ตรวจสอบว่าข้อความว่างหรือไม่
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    // สร้าง matrix สำหรับการคำนวณ
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
  
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }
  
    // คำนวณระยะห่าง
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // แทนที่
            matrix[i][j - 1] + 1,     // เพิ่ม
            matrix[i - 1][j] + 1      // ลบ
          );
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
  
  /**
   * ฟังก์ชันคำนวณความเหมือน (0-1) โดยใช้ Levenshtein
   * @param {string} a ข้อความที่ 1
   * @param {string} b ข้อความที่ 2
   * @returns {number} ค่าความเหมือน 0-1
   */
  function stringSimilarity(a, b) {
    if (!a || !b) return 0;
    
    const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
    const maxLength = Math.max(a.length, b.length);
    
    if (maxLength === 0) return 1.0;
    return 1 - distance / maxLength;
  }
  
  /**
   * ฟังก์ชันค้นหาคำที่ใกล้เคียงที่สุดจากรายการ
   * @param {string} input ข้อความที่ต้องการค้นหา
   * @param {string[]} dictionary รายการข้อความที่ใช้ในการเปรียบเทียบ
   * @param {number} threshold ค่าความเหมือนขั้นต่ำ (0-1)
   * @returns {string|null} ข้อความที่ใกล้เคียงที่สุด หรือ null ถ้าไม่พบ
   */
  function findBestMatch(input, dictionary, threshold = 0.7) {
    if (!input || !dictionary || dictionary.length === 0) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const word of dictionary) {
      const score = stringSimilarity(input, word);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = word;
      }
    }
    
    // ถ้าคะแนนต่ำกว่า threshold ให้ถือว่าไม่พบคำที่ใกล้เคียง
    return bestScore >= threshold ? bestMatch : null;
  }
  
  /**
   * ฟังก์ชันตรวจจับรูปแบบชื่อยาด้วย Regular Expression
   * @param {string} text ข้อความที่ต้องการตรวจสอบ
   * @returns {string[]} รายการชื่อยาที่พบ
   */
  function extractMedicineNames(text) {
    if (!text) return [];
    
    // รูปแบบการตรวจสอบชื่อยาทั่วไป
    const patterns = [
      /\b(?:paracetamol|พาราเซตามอล)\b/i,
      /\b(?:amoxicillin|อะม็อกซีซิลลิน)\b/i,
      /\b(?:metformin|เมทฟอร์มิน)\b/i,
      /\b(?:omeprazole|โอเมพราโซล)\b/i,
      /\b(?:losartan|โลซาร์แทน)\b/i,
      /\b(?:atorvastatin|อะทอร์วาสแททิน)\b/i,
      /\b(?:pioglitazone|ไพโอกลิตาโซน|ไพโอกลิตา)\b/i,
      /\b(?:glipizide|กลิพิไซด์)\b/i,
      /\b(?:gliclazide|กลิคลาไซด์)\b/i,
      /\b(?:glimepiride|กลิมีไพรด์)\b/i,
      /\b(?:ibuprofen|ไอบูโพรเฟน)\b/i,
      /\b(?:simvastatin|ซิมวาสแททิน)\b/i,
      /\b(?:lorazepam|ลอราซีแพม)\b/i,
      /\b(?:warfarin|วาร์ฟาริน)\b/i,
      /\b(?:aspirin|แอสไพริน)\b/i,
      /\b(?:diazepam|ไดอาซีแพม)\b/i,
      // เพิ่มยาอื่นๆ ตามที่ต้องการ
    ];
    
    const medicineNames = [];
    
    // ตรวจสอบแต่ละรูปแบบกับข้อความ
    patterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        medicineNames.push(match[0]);
      }
    });
    
    return medicineNames;
  }
  
  /**
   * ฟังก์ชันตรวจจับรูปแบบวิธีการรับประทานยา
   * @param {string} text ข้อความที่ต้องการตรวจสอบ
   * @returns {string|null} วิธีการรับประทานยา หรือ null ถ้าไม่พบ
   */
  function extractDosageInstructions(text) {
    if (!text) return null;
    
    // ตัวอย่างรูปแบบวิธีการรับประทานยา
    const dosagePatterns = [
      /รับประทานครั้งละ\s*(\d+)\s*เม็ด/i,
      /ทานครั้งละ\s*(\d+)\s*เม็ด/i,
      /วันละ\s*(\d+)\s*ครั้ง/i,
      /รับประทาน\s*(\d+)\s*ครั้งต่อวัน/i,
      /(\d+)\s*เม็ด\s*วันละ\s*(\d+)\s*ครั้ง/i,
      /รับประทาน\s*(\d+)\s*เม็ด\s*วันละ\s*(\d+)\s*ครั้ง/i,
      /รับประทาน\s*(\d+)\s*แคปซูล\s*วันละ\s*(\d+)\s*ครั้ง/i,
      /รับประทาน\s*(\d+)\s*ช้อนชา/i,
      /รับประทาน\s*(\d+)\s*ช้อนโต๊ะ/i,
      /(\d+)\s*เม็ด\s*(?:ก่อน|หลัง)อาหาร/i,
      /รับประทาน(?:ก่อน|หลัง)อาหาร/i
    ];
    
    for (const pattern of dosagePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
  
  /**
   * ฟังก์ชันตรวจจับระยะเวลาในการรับประทานยา
   * @param {string} text ข้อความที่ต้องการตรวจสอบ
   * @returns {string|null} ระยะเวลาในการรับประทานยา หรือ null ถ้าไม่พบ
   */
  function extractIntakeTime(text) {
    if (!text) return null;
    
    // ตัวอย่างรูปแบบเวลารับประทานยา
    const timePatterns = [
      /(?:เช้า|กลางวัน|เย็น|ก่อนนอน)/i,
      /(?:ก่อน|หลัง)อาหาร(?:เช้า|กลางวัน|เย็น)?/i,
      /เวลา\s*(\d{1,2})[:.]*(\d{0,2})\s*น\s*/i,
      /ทุก\s*(\d+)\s*ชั่วโมง/i,
      /วันละ\s*(\d+)\s*ครั้ง\s*เวลา/i,
      /ทุก\s*(\d+)\s*ชั่วโมง/i,
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
  
  /**
   * ฟังก์ชันตรวจจับสรรพคุณของยา
   * @param {string} text ข้อความที่ต้องการตรวจสอบ
   * @returns {string|null} สรรพคุณยา หรือ null ถ้าไม่พบ
   */
  function extractMedicinePurpose(text) {
    if (!text) return null;
    
    // ตัวอย่างรูปแบบสรรพคุณของยา
    const purposePatterns = [
      /รักษา(โรค)?([^\s.,]+)/i,
      /บรรเทาอาการ([^\s.,]+)/i,
      /ลดอาการ([^\s.,]+)/i,
      /ป้องกัน(โรค)?([^\s.,]+)/i,
      /ควบคุม(โรค)?([^\s.,]+)/i,
      /แก้([^\s.,]+)/i,
      /ลด([^\s.,]+)/i,
      /ใช้สำหรับ([^\s.,]+)/i,
      /ยาแก้([^\s.,]+)/i,
      /ยารักษา([^\s.,]+)/i,
      /ต้าน([^\s.,]+)/i,
      /(แก้ปวด|ลดไข้|ต้านอักเสบ|ลดความดัน|ลดน้ำตาล|ลดไขมัน|ยาปฏิชีวนะ)/i,
      /(เบาหวาน|ความดัน|ไขมัน|หัวใจ|ไต|ตับ|ไทรอยด์|กระเพาะ|ลำไส้|หอบหืด|ภูมิแพ้)/i
    ];
    
    for (const pattern of purposePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
  
  module.exports = {
    levenshteinDistance,
    stringSimilarity,
    findBestMatch,
    extractMedicineNames,
    extractDosageInstructions,
    extractIntakeTime,
    extractMedicinePurpose
  };