import { UserDataAccess } from '../config/data/user.js';
import User from '../models/user/User.js';

export default class UserRepository {
    constructor() {
        // 데이터를 User 엔티티로 변환
        this.users = UserDataAccess.getAll().map(data => new User(data));
    }

    /**
     * 모든 사용자를 조회합니다.
     * @param {Object} options - 조회 옵션
     * @returns {Promise<Object>} 페이지네이션된 사용자 목록
     */
    async findUsers({ page = 1, limit = 10, keyword, role } = {}) {
        let filteredUsers = [...this.users];

        // 검색 조건 적용
        if (keyword) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(keyword.toLowerCase()) ||
                user.email.toLowerCase().includes(keyword.toLowerCase()) ||
                user.department?.toLowerCase().includes(keyword.toLowerCase()) ||
                user.username.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        // 역할 필터링
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }

        // 페이지네이션 적용
        const start = (page - 1) * limit;
        const end = start + limit;
        const total = filteredUsers.length;

        return {
            items: filteredUsers.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * ID로 사용자를 조회합니다.
     * @param {number} id - 사용자 ID
     * @returns {Promise<User|null>} 사용자 정보
     */
    async findUserById(id) {
        return this.users.find(user => user.id === Number(id)) || null;
    }

    /**
     * 이메일로 사용자를 조회합니다.
     * @param {string} email - 사용자 이메일
     * @returns {Promise<User|null>} 사용자 정보
     */
    async findUserByEmail(email) {
        return this.users.find(user => user.email === email) || null;
    }

    /**
     * 사용자명으로 사용자를 조회합니다.
     * @param {string} username - 사용자명
     * @returns {Promise<User|null>} 사용자 정보
     */
    async findUserByUsername(username) {
        return this.users.find(user => user.username === username) || null;
    }

    /**
     * 작가 목록을 조회합니다.
     * @returns {Promise<Array<User>>} 작가 목록
     */
    async findArtists() {
        return this.users.filter(user => user.isArtist());
    }

    /**
     * 새로운 사용자를 생성합니다.
     * @param {Object} userData - 사용자 데이터
     * @returns {Promise<User>} 생성된 사용자 정보
     */
    async createUser(userData) {
        // ID 생성
        const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;

        // User 엔티티 생성
        const user = new User({
            ...userData,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // 저장
        this.users.push(user);
        return user;
    }

    /**
     * 사용자 정보를 수정합니다.
     * @param {number} id - 사용자 ID
     * @param {Object} userData - 수정할 사용자 데이터
     * @returns {Promise<User|null>} 수정된 사용자 정보
     */
    async updateUser(id, userData) {
        const index = this.users.findIndex(user => user.id === Number(id));
        if (index === -1) {
            return null;
        }

        // User 엔티티 업데이트
        const user = new User({
            ...this.users[index],
            ...userData,
            updatedAt: new Date().toISOString()
        });

        // 저장
        this.users[index] = user;
        return user;
    }

    /**
     * 사용자를 삭제합니다.
     * @param {number} id - 사용자 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteUser(id) {
        const index = this.users.findIndex(user => user.id === Number(id));
        if (index === -1) {
            return false;
        }

        this.users.splice(index, 1);
        return true;
    }
}
