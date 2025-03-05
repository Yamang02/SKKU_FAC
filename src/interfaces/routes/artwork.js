const express = require('express');
const router = express.Router();

// 임시 작품 데이터
const artworks = [
    {
        id: 1,
        title: "가나가와 해변의 높은 파도 아래",
        artist: "가쓰시카 호쿠사이",
        department: "동양화과 20학번",
        year: "1831",
        medium: "목판화",
        size: "25.7 × 37.9 cm",
        description: "이 작품은 호쿠사이의 대표작 '후지산 36경' 시리즈 중 하나로, 거대한 파도와 그 아래의 작은 배, 그리고 멀리 보이는 후지산을 묘사하고 있습니다. 파도의 역동적인 움직임과 자연의 힘을 강렬하게 표현한 작품입니다.",
        exhibition: "2024 봄 기획전: 동아시아의 풍경",
        image: "/images/artworks/great-wave.jpg"
    }
];

// 작품 상세 페이지 라우트
router.get('/:id', (req, res) => {
    const artwork = artworks.find(art => art.id === parseInt(req.params.id));
    
    if (!artwork) {
        return res.status(404).render('error', {
            message: '작품을 찾을 수 없습니다.'
        });
    }

    res.render('artwork', { artwork });
});

module.exports = router; 