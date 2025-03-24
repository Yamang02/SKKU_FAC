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
        status: UserStatus.ACTIVE,
        studentId: null,
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
        status: UserStatus.ACTIVE,
        studentId: '2020123456',
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
        status: UserStatus.ACTIVE,
        studentId: null,
        artistInfo: {
            biography: '현대미술 작가',
            website: 'http://artist-kim.com'
        },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    }
];

/**
 * 사용자 데이터 접근을 위한 클래스
 */
export class UserDataAccess {
    /**
     * 모든 사용자 목록을 반환합니다.
     * @returns {Array} 사용자 목록
     */
    static getAll() {
        return user;
    }

    /**
     * ID로 사용자를 찾습니다.
     * @param {number} id - 사용자 ID
     * @returns {Object|null} 사용자 객체 또는 null
     */
    static findById(id) {
        return user.find(user => user.id === id) || null;
    }

    /**
     * 역할로 사용자를 찾습니다.
     * @param {string} role - 사용자 역할
     * @returns {Array} 해당 역할의 사용자 목록
     */
    static findByRole(role) {
        return user.filter(user => user.role === role);
    }

    /**
     * 상태로 사용자를 찾습니다.
     * @param {string} status - 사용자 상태
     * @returns {Array} 해당 상태의 사용자 목록
     */
    static findByStatus(status) {
        return user.filter(user => user.status === status);
    }
}

export default user;
