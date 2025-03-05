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

// 작품 목록 페이지 라우트
router.get('/list', async (req, res) => {
    try {
        // 검색 파라미터 가져오기
        const { keyword, exhibition, year, department, page = 1 } = req.query;
        
        // 실제 구현에서는 DB에서 검색 조건에 맞는 작품 목록을 가져옵니다.
        // 여기서는 더미 데이터로 대체합니다.
        
        // 페이지 렌더링
        res.render('artwork-list', { 
            title: '작품 검색 - SKKU Faculty Art Gallery',
            keyword,
            exhibition,
            year,
            department,
            page
        });
    } catch (error) {
        console.error('작품 목록 조회 오류:', error);
        res.status(500).render('error', { 
            message: '작품 목록을 불러오는 중 오류가 발생했습니다.' 
        });
    }
});

// 작품 상세 페이지 라우트
router.get('/:id', (req, res) => {
    const artwork = artworks.find(art => art.id === parseInt(req.params.id));
    
    if (!artwork) {
        return res.status(404).render('error', {
            message: '작품을 찾을 수 없습니다.'
        });
    }

    res.render('artwork-detail', { artwork });
});

module.exports = router; 