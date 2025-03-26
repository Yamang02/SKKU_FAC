/**
 * 작품 데이터
 */
const artwork = [
    {
        id: 1,
        title: '가나가와 해변의 높은 파도 아래',
        artist: '가쓰시카 호쿠사이',
        department: '동양화과 20학번',
        year: '1831',
        medium: '목판화',
        size: '25.7cm x 37.9cm',
        description: '가쓰시카 호쿠사이의 대표작 중 하나로, 일본 에도 시대의 목판화입니다. 거대한 파도가 후지산을 배경으로 어부들의 배를 위협하는 모습을 담고 있습니다.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg',
        exhibition: '동아시아 풍경화전',
        exhibitionId: 2,
        isFeatured: true
    },
    {
        id: 2,
        title: '진주 귀걸이를 한 소녀',
        artist: '요하네스 베르메르',
        department: '서양화과 18학번',
        year: '1665',
        medium: '캔버스에 유화',
        size: '44.5cm x 39cm',
        description: '네덜란드 황금시대의 화가 요하네스 베르메르의 대표작으로, 진주 귀걸이를 한 소녀의 초상화입니다. 빛과 그림자의 대비, 소녀의 신비로운 표정이 특징적입니다.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
        exhibition: '현대미술의 흐름',
        exhibitionId: 3,
        isFeatured: true
    },
    {
        id: 3,
        title: '별이 빛나는 밤',
        artist: '빈센트 반 고흐',
        department: '서양화과 19학번',
        year: '1889',
        medium: '캔버스에 유화',
        size: '73.7cm x 92.1cm',
        description: '빈센트 반 고흐의 대표작으로, 프랑스 생레미의 정신병원에서 머무를 때 그린 작품입니다. 소용돌이치는 하늘과 밝게 빛나는 별들이 특징적입니다.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
        exhibition: '색채의 향연',
        exhibitionId: 4,
        isFeatured: true
    },
    {
        id: 4,
        title: '모나리자',
        artist: '레오나르도 다빈치',
        department: '서양화과 16학번',
        year: '1503',
        medium: '나무 패널에 유화',
        size: '77cm x 53cm',
        description: '레오나르도 다빈치의 가장 유명한 초상화로, 신비로운 미소를 짓고 있는 여인의 모습을 담고 있습니다. ' +
            '스푸마토 기법을 사용하여 부드러운 명암 효과를 표현했습니다.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/' +
            'Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/' +
            '800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
        exhibition: '자연과 인간',
        exhibitionId: 5,
        isFeatured: true
    }
];

export default artwork;

export function getArtworkById(id) {
    return artwork.find(artwork => artwork.id === parseInt(id));
}

export function getFeaturedArtworks(limit = 6) {
    return artwork.filter(art => art.isFeatured).slice(0, limit);
}
