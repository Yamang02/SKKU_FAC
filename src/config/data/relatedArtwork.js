/**
 * 관련 작품 데이터
 */
const relatedArtworks = {
    // 작품 ID 1에 대한 관련 작품
    1: [
        {
            id: 2,
            title: '진주 귀걸이를 한 소녀',
            artist: '요하네스 베르메르',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
        },
        {
            id: 3,
            title: '별이 빛나는 밤',
            artist: '빈센트 반 고흐',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
        },
        {
            id: 4,
            title: '모나리자',
            artist: '레오나르도 다빈치',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/' +
                'Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
        }
    ],

    // 작품 ID 2에 대한 관련 작품
    2: [
        {
            id: 1,
            title: '가나가와 해변의 높은 파도 아래',
            artist: '가쓰시카 호쿠사이',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg'
        },
        {
            id: 3,
            title: '별이 빛나는 밤',
            artist: '빈센트 반 고흐',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
        },
        {
            id: 4,
            title: '모나리자',
            artist: '레오나르도 다빈치',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/' +
                'Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
        }
    ],

    // 작품 ID 3에 대한 관련 작품
    3: [
        {
            id: 1,
            title: '가나가와 해변의 높은 파도 아래',
            artist: '가쓰시카 호쿠사이',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg'
        },
        {
            id: 2,
            title: '진주 귀걸이를 한 소녀',
            artist: '요하네스 베르메르',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
        },
        {
            id: 4,
            title: '모나리자',
            artist: '레오나르도 다빈치',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/' +
                'Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
        }
    ],

    // 작품 ID 4에 대한 관련 작품
    4: [
        {
            id: 1,
            title: '가나가와 해변의 높은 파도 아래',
            artist: '가쓰시카 호쿠사이',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg'
        },
        {
            id: 2,
            title: '진주 귀걸이를 한 소녀',
            artist: '요하네스 베르메르',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
        },
        {
            id: 3,
            title: '별이 빛나는 밤',
            artist: '빈센트 반 고흐',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
        }
    ]
};

/**
 * 작품 ID로 관련 작품 목록을 가져옵니다.
 * @param {number} artworkId - 작품 ID
 * @returns {Array} 관련 작품 목록
 */
export function getRelatedArtworks(artworkId) {
    return relatedArtworks[artworkId] || [];
}
