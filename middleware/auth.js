const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'ต้องมี token'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: 'Token หมดอายุหรือไม่ถูกต้อง'
            })
        }
        req.userId = decoded.id;
        next();
    })
}

exports.ValidateRegister = (req, res, next) => {
    const { username, email, password } = req.body

    if (!username || username.length < 3) {
        return res.status(400).json({
            error : 'ชื่อผู้ใช้ต้องมี 3 ตัวอักษรขึ้นไป'
        })
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            error: 'อีเมลไม่ถูกต้อง'
        })
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        })
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว'
        });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
        });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'
        });
    }

    if (!/[@$!%*?&_-]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีอักขระพิเศษ อย่างน้อย 1 ตัว'
        });
    }

    next()
}