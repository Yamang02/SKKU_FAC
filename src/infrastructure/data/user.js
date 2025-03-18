import bcrypt from 'bcrypt';

// 비밀번호 해시 생성
const hashedPassword = bcrypt.hashSync('1234', 10);

// 사용자 유형 상수
export const UserRole = {
    ADMIN: 'ADMIN',           // 관리자
    CLUB_MEMBER: 'MEMBER',    // 동아리 회원
    ARTIST: 'ARTIST',         // 외부 작가
    GUEST: 'GUEST'           // 일반 사용자
};

const user = [
    {
        id: 1,
        username: 'admin',
        password: hashedPassword,
        name: '관리자',
        email: 'admin@skku.edu',
        role: UserRole.ADMIN,
        studentId: null,  // 학번은 선택사항
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 2,
        username: 'honggildong',
        password: hashedPassword,
        name: '홍길동',
        email: 'hong@skku.edu',
        role: UserRole.CLUB_MEMBER,
        studentId: '2020123456',  // 동아리 회원의 경우 학번 입력 가능
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 3,
        username: 'artist_kim',
        password: hashedPassword,
        name: '김작가',
        email: 'artist_kim@example.com',
        role: UserRole.ARTIST,
        studentId: null,
        artistInfo: {  // 작가 추가 정보
            biography: '현대미술 작가',
            website: 'http://artist-kim.com'
        },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    }
];

export default user;
