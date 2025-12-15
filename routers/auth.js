// routers/auth.js
const express = require('express')
const router = express.Router()
const { ValidateRegister, verifyToken } = require('../middleware/auth')
const { register, login, updateProfile } = require('../controller/authcontroller')

// Register route
router.post('/register', ValidateRegister, register)

// Login route
router.post('/login', login)

// Update profile route - make sure updateProfile handler exists in authcontroller.js
router.put('/update-profile', verifyToken, updateProfile)

module.exports = router