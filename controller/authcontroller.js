const prisma = require('../prisma/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try {
        const { username, email, password, age, address } = req.body

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username 
                    ? 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' 
                    : 'อีเมลนี้ถูกใช้งานแล้ว'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        // Return response (excluding password)
        const { password: _, ...userData } = user
        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ',
            user: userData,
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลงทะเบียน'
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        const { password: _, ...userData } = user
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: userData,
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        })
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // ดึง userId จาก request ที่ได้จาก middleware

        if (!userId) {
            return res.status(400).json({
                error: 'ไม่พบ userId ใน request'
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        const { password: _, ...userData } = user;

        return res.status(200).json({
            message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
            user: userData
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
            }
        });

        if (users.length === 0) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้ในระบบ'
            });
        }

        res.status(200).json({
            message: 'ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ',
            users
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ทั้งหมด'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body
        const userId = req.userId // จาก verifyToken middleware

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                username,
                email
            }
        })

        const { password: _, ...userData } = updatedUser
        
        res.status(200).json({
            message: 'อัพเดทโปรไฟล์สำเร็จ',
            user: userData
        })

    } catch (error) {
        console.error('Update profile error:', error)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์'
        })
    }
}