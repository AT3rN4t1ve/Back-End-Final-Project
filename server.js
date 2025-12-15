const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { readdirSync } = require('fs');
const path = require('path');
const cronService = require('./services/cron_service');

// ตั้งค่า middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors())

// ตั้งค่าการเข้าถึงโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// โหลดเส้นทาง API ทั้งหมดอัตโนมัติ - เปลี่ยนเป็นวิธีนี้
readdirSync('./routers').forEach((file) => {
    if (file.endsWith('.js')) {
        const route = require(`./routers/${file}`);
        if (typeof route === 'function') {
            app.use('/api', route);
        } else {
            console.warn(`Warning: Router file ${file} does not export a valid router function`);
        }
    }
});

// เริ่มต้นระบบแจ้งเตือนอัตโนมัติ
cronService.startCronJobs();

app.listen(5000, () => {
    console.log('Start Server on port 5000')
})