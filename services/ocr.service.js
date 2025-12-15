const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

class OcrService {
    constructor() {
        try {
            const keyFilePath = path.join(__dirname, '../config/google-cloud-key.json');
            console.log('Using key file:', keyFilePath);
            this.client = new vision.ImageAnnotatorClient({ keyFilename: keyFilePath });
            this.usingMockData = false;
            console.log('Google Vision API Client initialized successfully.');
        } catch (error) {
            console.error('Error initializing OCR service:', error);
            this.client = null;
            this.usingMockData = true;
        }
    }

    async detectText(imageBuffer) {
        const tmpDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const tmpFilePath = path.join(tmpDir, `tmp_${Date.now()}.jpg`);
        fs.writeFileSync(tmpFilePath, imageBuffer);

        let text = '';
        let isMockData = false;

        if (this.client) {
            try {
                console.log('Processing image with Google Vision API:', tmpFilePath);
                const [result] = await this.client.documentTextDetection(tmpFilePath);
                console.log('Vision API response:', JSON.stringify(result, null, 2));
                if (result?.fullTextAnnotation?.text) {
                    text = result.fullTextAnnotation.text;
                    console.log('Detected text:', text);
                } else {
                    console.log('No text detected in the image');
                    isMockData = true;
                }
            } catch (apiError) {
                console.error('Google Vision API error:', apiError);
                isMockData = true;
            }
        } else {
            console.log('Google Vision API client not available');
            isMockData = true;
        }

        fs.unlinkSync(tmpFilePath);

        if (isMockData) {
            return this.mockOcrResult();
        }

        const medicineData = this.parseMedicineText(text);
        medicineData.rawText = text;
        medicineData.isMockData = false;

        return medicineData;
    }

    parseMedicineText(text) {
        return { name: text, isMockData: false };
    }

    mockOcrResult() {
        return {
            name: 'ตัวอย่าง: เมทฟอร์มิน',
            dosage: 'ตัวอย่าง: 500 มิลลิกรัม',
            timing: 'ตัวอย่าง: หลังอาหาร',
            frequency: 'ตัวอย่าง: วันละ 2 ครั้ง',
            purpose: 'ตัวอย่าง: ควบคุมระดับน้ำตาลในเลือด',
            isDiabetesMedicine: true,
            isMockData: true
        };
    }
}

module.exports = new OcrService();