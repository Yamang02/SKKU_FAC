const express = require('express');
const router = express.Router();

// 로그인 페이지
router.get('/login', (req, res) => {
    res.render('users/login', {
        title: '로그인'
    });
});

module.exports = router; 