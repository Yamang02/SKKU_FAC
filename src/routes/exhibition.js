const express = require('express');
const router = express.Router();

// 전시회 목록
router.get('/', (req, res) => {
    res.render('exhibitions/index', {
        title: '작품 아카이브'
    });
});

// 카테고리별 작품 목록
router.get('/category/:category', (req, res) => {
    const category = req.params.category;
    res.render('exhibitions/index', {
        title: `${category} 작품 목록`,
        category: category
    });
});

// 작품 상세 페이지
router.get('/:id', (req, res) => {
    const artworkId = req.params.id;
    // 나중에 데이터베이스에서 작품 정보를 가져올 예정
    res.render('exhibitions/detail', {
        title: '작품 상세'
    });
});

module.exports = router; 