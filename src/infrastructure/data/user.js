import bcrypt from 'bcrypt';

// 비밀번호 해시 생성
const hashedPassword = bcrypt.hashSync('1234', 10);

/**
 * 사용자 역할 enum
 */
export const UserRole = {
    ADMIN: 'ADMIN',
    ARTIST: 'ARTIST',
    CLUB_MEMBER: 'CLUB_MEMBER',
    GUEST: 'GUEST'
};

/**
 * 사용자 상태 enum
 */
export const UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED'
};

/**
 * 사용자 데이터 모델
 */
export class User {
    constructor({
        id,
        username,
        password,
        name,
        email,
        role = UserRole.GUEST,
        status = UserStatus.ACTIVE,
        departmentId = null,
        studentId = null,
        artistInfo = null,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.departmentId = departmentId;
        this.studentId = studentId;
        this.artistInfo = artistInfo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

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
