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
    },
    {
        id: 2,
        title: "진주 귀걸이를 한 소녀",
        artist: "요하네스 베르메르",
        department: "서양화과 19학번",
        year: "1665",
        medium: "캔버스에 유화",
        size: "44.5 × 39 cm",
        description: "베르메르의 대표작으로, 검은 배경 앞에 진주 귀걸이를 한 소녀가 어깨 너머로 관객을 바라보고 있는 모습을 묘사했습니다. 빛과 그림자의 대비, 소녀의 신비로운 표정이 특징적인 작품입니다.",
        exhibition: "2023 겨울 기획전: 현대미술의 흐름",
        image: "/images/artworks/girl-with-pearl-earring.jpg"
    },
    {
        id: 3,
        title: "자화상",
        artist: "빈센트 반 고흐",
        department: "서양화과 18학번",
        year: "1889",
        medium: "캔버스에 유화",
        size: "65 × 54 cm",
        description: "고흐가 생애 마지막 해에 그린 자화상 중 하나로, 그의 특유의 붓 터치와 강렬한 색채가 돋보이는 작품입니다. 고흐의 내면 세계와 정신적 고뇌가 표현되어 있습니다.",
        exhibition: "2023 가을 기획전: 색채의 향연",
        image: "/images/artworks/van-gogh-self-portrait.jpg"
    },
    {
        id: 4,
        title: "세속적 쾌락의 정원",
        artist: "히에로니무스 보스",
        department: "서양화과 21학번",
        year: "1490",
        medium: "패널에 유화",
        size: "220 × 389 cm",
        description: "보스의 대표작으로, 세 개의 패널로 구성된 트립틱 형식의 작품입니다. 에덴동산, 쾌락의 정원, 지옥을 묘사하며 인간의 욕망과 그 결과를 환상적이고 초현실적인 이미지로 표현했습니다.",
        exhibition: "2023 여름 기획전: 자연과 인간",
        image: "/images/artworks/garden-of-earthly-delights.jpg"
    }
];

// 작품 목록 페이지 라우트 (먼저 정의)
router.get('/list', async (req, res) => {
    try {
        // 검색 파라미터 가져오기
        const { keyword, exhibition, year, department, page = 1 } = req.query;
        
        // 실제 구현에서는 DB에서 검색 조건에 맞는 작품 목록을 가져옵니다.
        // 여기서는 더미 데이터로 대체합니다.
        
        // 페이지 렌더링
        res.render('artwork-list', { 
            title: '작품 검색 - SKKU Faculty Art Gallery',
            artworks: artworks, // 작품 데이터 전달
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

// 작품 상세 페이지 라우트 (나중에 정의)
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