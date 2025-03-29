/**
 * 전시회 데이터
 */
const exhibition = [
    {
        id: 1,
        title: '동아시아의 풍경',
        description: '동아시아의 전통적인 풍경화와 현대적 해석이 어우러진 작품들을 선보입니다.',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        location: '성균관대학교 인문관 1층 전시실',
        image: '/image/exhibition/placeholder-exhibition.svg',
        exhibitionType: 'regular',
        isSubmissionOpen: true
    },
    {
        id: 2,
        title: '현대 미술의 흐름',
        description: '현대 미술의 다양한 실험과 도전을 담은 작품들을 전시합니다.',
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        location: '성균관대학교 인문관 2층 갤러리',
        image: '/image/exhibition/placeholder-exhibition.svg',
        exhibitionType: 'special',
        isSubmissionOpen: false
    },
    {
        id: 3,
        title: '색채의 향연',
        description: '다양한 색채 표현을 통해 감정과 경험을 전달하는 작품들을 소개합니다.',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        location: '성균관대학교 인문관 1층 전시실',
        image: '/image/exhibition/placeholder-exhibition.svg',
        exhibitionType: 'regular',
        isSubmissionOpen: true
    },
    {
        id: 4,
        title: '자연과 인간',
        description: '자연과 인간의 관계를 탐구하는 다양한 작품들을 전시합니다.',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        location: '성균관대학교 인문관 2층 갤러리',
        image: '/image/exhibition/placeholder-exhibition.svg',
        exhibitionType: 'special',
        isSubmissionOpen: false
    }
];

export default exhibition;
export function getExhibitionById(id) {
    return exhibition.find(exhibition => exhibition.id === parseInt(id));
}

/**
 * 전시회 유형에 따라 텍스트 반환
 * @param {string} type - 전시회 유형 ('regular' 또는 'special')
 * @returns {string} 전시회 유형 텍스트
 */
export function getExhibitionTypeText(type) {
    return type === 'regular' ? '정기' : '특별';
}
