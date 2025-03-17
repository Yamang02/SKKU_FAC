/**
 * 공지사항 임시 데이터
 */

const notices = [
    {
        id: 1,
        title: '2024학년도 1학기 수강신청 안내',
        content: '2024학년도 1학기 수강신청 일정 및 유의사항을 안내드립니다. 수강신청 기간은 2024년 2월 19일부터 23일까지입니다.',
        detailContent: `
            <h3>2024학년도 1학기 수강신청 안내</h3>

            <h4>1. 수강신청 일정</h4>
            - 수강신청 기간: 2024년 2월 19일(월) ~ 23일(금)
            - 수강신청 정정 기간: 2024년 3월 4일(월) ~ 8일(금)

            <h4>2. 수강신청 방법</h4>
            - 학교 포털 로그인 후 수강신청 시스템 접속
            - 학번과 비밀번호로 로그인
            - 원하는 과목 검색 후 신청

            <h4>3. 유의사항</h4>
            - 수강신청 전 수강편람 필수 확인
            - 전공필수 과목 우선 신청
            - 재수강 과목 확인 필수

            <h4>4. 문의</h4>
            - 학사지원팀: 02-XXX-XXXX
            - 이메일: academic@skku.edu
        `,
        created_at: '2024-02-15',
        author: '학사지원팀',
        views: 245,
        is_important: true,
        images: [
            '/images/notice/registration1.jpg',
            '/images/notice/registration2.jpg'
        ]
    },
    {
        id: 2,
        title: '미술대학 졸업전시회 개최 안내',
        content: '2023학년도 미술대학 졸업전시회가 3월 2일부터 9일까지 성균갤러리에서 개최됩니다. 많은 관심과 참여 부탁드립니다.',
        detailContent: `
            <h3>2023학년도 미술대학 졸업전시회</h3>

            <h4>1. 전시 개요</h4>
            - 전시명: 2023학년도 미술대학 졸업전시회 "새로운 시작"
            - 기간: 2024년 3월 2일(토) ~ 9일(토)
            - 장소: 성균갤러리
            - 참여 학과: 동양화과, 서양화과, 조소과

            <h4>2. 전시 구성</h4>
            - 1층: 동양화 전공 작품
            - 2층: 서양화 전공 작품
            - 3층: 조소 전공 작품

            <h4>3. 부대행사</h4>
            - 오프닝 리셉션: 3월 2일(토) 14:00
            - 작가와의 대화: 3월 4일(월) 15:00
            - 도슨트 투어: 매일 11:00, 15:00

            <h4>4. 관람 안내</h4>
            - 관람시간: 10:00 ~ 18:00
            - 입장료: 무료
            - 문의: 미술대학 행정실 02-XXX-XXXX
        `,
        created_at: '2024-02-14',
        author: '미술학과',
        views: 189,
        is_important: true,
        images: [
            '/images/notice/exhibition1.jpg',
            '/images/notice/exhibition2.jpg',
            '/images/notice/exhibition3.jpg'
        ]
    },
    {
        id: 3,
        title: '2024년도 교내 미술 공모전 안내',
        content: '2024년도 교내 미술 공모전을 개최합니다. 접수 기간은 3월 1일부터 31일까지이며, 자세한 내용은 공지사항을 참고해주세요.',
        detailContent: `
            <h3>2024년도 교내 미술 공모전</h3>

            <h4>1. 공모전 개요</h4>
            - 주제: "미래를 그리다"
            - 접수기간: 2024년 3월 1일 ~ 31일
            - 참가자격: 본교 재학생 및 졸업생

            <h4>2. 공모 부문</h4>
            - 평면 부문: 회화, 드로잉, 판화 등
            - 입체 부문: 조각, 설치
            - 미디어 부문: 영상, 디지털아트

            <h4>3. 시상 내역</h4>
            - 대상(1명): 상금 200만원
            - 최우수상(2명): 상금 100만원
            - 우수상(3명): 상금 50만원
            - 장려상(5명): 상금 30만원

            <h4>4. 접수 방법</h4>
            - 온라인 접수: www.skku-artcontest.com
            - 제출자료: 작품 이미지, 작품설명서

            <h4>5. 문의</h4>
            - 문화예술부: 02-XXX-XXXX
            - 이메일: art@skku.edu
        `,
        created_at: '2024-02-13',
        author: '문화예술부',
        views: 156,
        is_important: false,
        images: [
            '/images/notice/contest1.jpg',
            '/images/notice/contest2.jpg'
        ]
    }
];

export function findAll() {
    return [...notices];
}

export function findById(id) {
    return notices.find(notice => notice.id === id);
}

export function findBySearchType(searchType, keyword) {
    if (!keyword) return findAll();

    const loweredKeyword = keyword.toLowerCase();
    return notices.filter(notice => {
        switch (searchType) {
        case 'title':
            return notice.title.toLowerCase().includes(loweredKeyword);
        case 'content':
            return notice.content.toLowerCase().includes(loweredKeyword);
        case 'author':
            return notice.author.toLowerCase().includes(loweredKeyword);
        case 'all':
        default:
            return notice.title.toLowerCase().includes(loweredKeyword) ||
                    notice.content.toLowerCase().includes(loweredKeyword) ||
                    notice.author.toLowerCase().includes(loweredKeyword);
        }
    });
}

export function incrementViews(id) {
    const notice = notices.find(notice => notice.id === id);
    if (notice) {
        notice.views += 1;
        return notice.views;
    }
    return null;
}
