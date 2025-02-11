const express = require('express');
const router = express.Router();

// 공지사항 목록
router.get('/', (req, res) => {
    res.render('notices/index', {
        title: '공지사항'
    });
});

module.exports = router; 