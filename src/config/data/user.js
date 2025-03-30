import bcrypt from 'bcrypt';

/**
 * 사용자 역할 enum
 */
export const UserRole = {
    ADMIN: 'ADMIN',
    SKKU_MEMBER: 'SKKU_MEMBER',
    EXTERNAL_MEMBER: 'EXTERNAL_MEMBER'
};

/**
 * 사용자 상태 enum
 */
export const UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED'
};

// 1234 비밀번호의 해시값
const DEFAULT_PASSWORD_HASH = '$2b$10$XQtbnjX6k/Q8CebfuYbI2./5pFAol2JBBEF1jz2BB9vc4ykEV.PbW';

/**
 * 사용자 데이터 모델
 */
export class User {
    constructor({
        id,
        username,
        password = DEFAULT_PASSWORD_HASH,
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
        this.department = '';
        this.studentYear = '';
    }
}

export class UserDataAccess {
    static users = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@skku.edu',
            password: DEFAULT_PASSWORD_HASH,
            name: '관리자',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
            id: 2,
            username: 'student1',
            email: 'student1@skku.edu',
            password: DEFAULT_PASSWORD_HASH,
            name: '김성균',
            role: UserRole.SKKU_MEMBER,
            status: UserStatus.ACTIVE,
            department: '미술학과',
            studentYear: '23',
            memberType: 'STUDENT',
            isClubMember: true,
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
        },
        {
            id: 3,
            username: 'graduate1',
            email: 'graduate1@gmail.com',
            password: DEFAULT_PASSWORD_HASH,
            name: '이예술',
            role: UserRole.SKKU_MEMBER,
            status: UserStatus.ACTIVE,
            department: '디자인학과',
            studentYear: '18',
            memberType: 'GRADUATE',
            isClubMember: false,
            created_at: '2024-01-03T00:00:00.000Z',
            updated_at: '2024-01-03T00:00:00.000Z'
        },
        {
            id: 4,
            username: 'external1',
            email: 'external1@example.com',
            password: DEFAULT_PASSWORD_HASH,
            name: '박미술',
            role: UserRole.EXTERNAL_MEMBER,
            status: UserStatus.ACTIVE,
            affiliation: '한국예술협회',
            created_at: '2024-01-04T00:00:00.000Z',
            updated_at: '2024-01-04T00:00:00.000Z'
        },
        {
            id: 5,
            username: 'external2',
            email: 'external2@example.com',
            password: DEFAULT_PASSWORD_HASH,
            name: '최작가',
            role: UserRole.EXTERNAL_MEMBER,
            status: UserStatus.ACTIVE,
            affiliation: '프리랜서 작가',
            created_at: '2024-01-05T00:00:00.000Z',
            updated_at: '2024-01-05T00:00:00.000Z'
        }
    ];

    static getAll() {
        return this.users;
    }

    /**
     * ID로 사용자를 찾습니다.
     * @param {number} id - 사용자 ID
     * @returns {Object|null} 사용자 객체 또는 null
     */
    static findById(id) {
        return this.users.find(user => user.id === id) || null;
    }

    /**
     * 역할로 사용자를 찾습니다.
     * @param {string} role - 사용자 역할
     * @returns {Array} 해당 역할의 사용자 목록
     */
    static findByRole(role) {
        return this.users.filter(user => user.role === role);
    }

    /**
     * 상태로 사용자를 찾습니다.
     * @param {string} status - 사용자 상태
     * @returns {Array} 해당 상태의 사용자 목록
     */
    static findByStatus(status) {
        return this.users.filter(user => user.status === status);
    }
}

export default UserDataAccess.users;
