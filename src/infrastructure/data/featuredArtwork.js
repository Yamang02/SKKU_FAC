/**
 * 메인 페이지에 표시될 추천 작품 데이터
 */
const featuredArtworks = [
    {
        id: 1,
        title: '진주 귀걸이를 한 소녀',
        artist: '요하네스 베르메르',
        department: '서양화과 18학번',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
    },
    {
        id: 2,
        title: '별이 빛나는 밤',
        artist: '빈센트 반 고흐',
        department: '서양화과 19학번',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
    },
    {
        id: 3,
        title: '모나리자',
        artist: '레오나르도 다빈치',
        department: '서양화과 16학번',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
    },
    {
        id: 4,
        title: '가나가와 해변의 높은 파도 아래',
        artist: '가쓰시카 호쿠사이',
        department: '동양화과 20학번',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg'
    }
];

/**
 * 추천 작품 목록을 가져옵니다.
 * @returns {Array} 추천 작품 목록
 */
export function getFeaturedArtworks() {
    return featuredArtworks;
}
