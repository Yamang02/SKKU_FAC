/**
 * 전시회 데이터
 */
const exhibition = [
    {
        id: 1,
        title: '2025년 샘플 전시회',
        description: '동아시아의 전통적인 풍경화와 현대적 해석이 어우러진 작품들을 선보입니다.',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        location: '성균관대학교 인문관 1층 전시실',
        image: '/image/exhibition/placeholder-exhibition.svg',
        exhibitionType: 'regular',
        isSubmissionOpen: true
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
