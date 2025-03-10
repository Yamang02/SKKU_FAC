/**
 * 전시회 데이터
 */
const exhibition = [
    {
        id: 1,
        code: 'all',
        title: '모든 작품',
        subtitle: '',
        description: '모든 작품을 보여줍니다.',
        startDate: '',
        endDate: '',
        image: 'https://via.placeholder.com/800x400?text=All+Artworks',
        artists: []
    },
    {
        id: 2,
        code: 'east-asia',
        title: '동아시아 풍경화전',
        subtitle: '동아시아의 아름다운 풍경을 담다',
        description: '동아시아의 아름다운 풍경을 담은 작품들을 소개합니다. 한국, 중국, 일본의 전통적인 풍경화부터 현대적 해석까지 다양한 작품을 감상하실 수 있습니다.',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        image: 'https://via.placeholder.com/800x400?text=East+Asian+Landscapes',
        artists: ['가쓰시카 호쿠사이', '김홍도', '장승업']
    },
    {
        id: 3,
        code: 'modern-art',
        title: '현대미술의 흐름',
        subtitle: '20세기 현대미술의 다양한 흐름',
        description: '현대미술의 다양한 흐름을 보여주는 작품들을 소개합니다. 추상표현주의, 미니멀리즘, 개념미술 등 다양한 현대미술 사조를 반영한 작품들을 만나보세요.',
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        image: 'https://via.placeholder.com/800x400?text=Modern+Art+Trends',
        artists: ['요하네스 베르메르', '파블로 피카소', '앤디 워홀']
    },
    {
        id: 4,
        code: 'colors',
        title: '색채의 향연',
        subtitle: '색채로 표현하는 감정과 이야기',
        description: '다양한 색채를 활용한 작품들을 소개합니다. 색채의 조화와 대비, 감정 표현 등 색을 통해 전달되는 다양한 메시지를 담은 작품들을 전시합니다.',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        image: 'https://via.placeholder.com/800x400?text=Festival+of+Colors',
        artists: ['빈센트 반 고흐', '클로드 모네', '마크 로스코']
    },
    {
        id: 5,
        code: 'nature',
        title: '자연과 인간',
        subtitle: '자연과 인간의 관계를 탐구하다',
        description: '자연과 인간의 관계를 탐구하는 작품들을 소개합니다. 환경 문제, 생태계, 자연과 인간의 공존 등 현대 사회의 중요한 주제를 예술적으로 해석한 작품들을 감상하실 수 있습니다.',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        image: 'https://via.placeholder.com/800x400?text=Nature+and+Humans',
        artists: ['레오나르도 다빈치', '존 컨스터블', '앤셀 아담스']
    }
];

export default exhibition;
export function getExhibitionById(id) {
    return exhibition.find(item => item.id === parseInt(id));
}
