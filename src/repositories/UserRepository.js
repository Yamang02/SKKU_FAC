import { UserDataAccess } from '../config/data/user.js';

export default class UserRepository {
    constructor() {
        this.users = UserDataAccess.getAll();
    }

    /**
     * 모든 사용자를 조회합니다.
     */
    async findUsers({ page = 1, limit = 10, search } = {}) {
        let filteredUsers = [...this.users];

        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.includes(search) ||
                user.email.includes(search)
            );
        }

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
     */
    async findUserById(id) {
        return this.users.find(user => user.id === id);
    }

    /**
     * 이메일로 사용자를 조회합니다.
     */
    async findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userData) {
        const newUser = {
            id: (Math.max(...this.users.map(u => u.id)) + 1).toString(),
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.users.push(newUser);
        return newUser;
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUser(id, userData) {
        const index = this.users.findIndex(user => user.id === id);
        if (index === -1) return null;

        this.users[index] = {
            ...this.users[index],
            ...userData,
            updated_at: new Date().toISOString()
        };
        return this.users[index];
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index === -1) return false;

        this.users.splice(index, 1);
        return true;
    }
}
