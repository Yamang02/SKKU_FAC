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
                user.email.includes(search) ||
                (user.role === 'SKKU_MEMBER' && user.department?.includes(search)) ||
                (user.role === 'EXTERNAL_MEMBER' && user.affiliation?.includes(search))
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
        return this.users.find(user => user.id === Number(id));
    }

    /**
     * 이메일로 사용자를 조회합니다.
     */
    async findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    /**
     * 사용자명으로 사용자를 조회합니다.
     */
    async findUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userData) {
        const newUser = {
            id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 역할별 추가 정보
        if (userData.role === 'SKKU_MEMBER') {
            Object.assign(newUser, {
                department: userData.department,
                studentYear: userData.studentYear,
                memberType: userData.memberType || 'STUDENT',
                isClubMember: Boolean(userData.isClubMember)
            });
        } else if (userData.role === 'EXTERNAL_MEMBER') {
            Object.assign(newUser, {
                affiliation: userData.affiliation,
                affiliationType: userData.affiliationType || 'INDIVIDUAL'
            });
        }

        this.users.push(newUser);
        return newUser;
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUser(id, userData) {
        const index = this.users.findIndex(user => user.id === Number(id));
        if (index === -1) return null;

        const currentUser = this.users[index];
        const updatedUser = {
            ...currentUser,
            ...userData,
            updatedAt: new Date().toISOString()
        };

        // 역할이 변경된 경우
        if (userData.role && userData.role !== currentUser.role) {
            // 이전 역할의 정보는 유지하고, 새로운 역할의 기본값만 설정
            if (userData.role === 'SKKU_MEMBER') {
                // SKKU_MEMBER로 변경 시
                if (!updatedUser.department) updatedUser.department = '';
                if (!updatedUser.studentYear) updatedUser.studentYear = '';
                if (!updatedUser.artistInfo) {
                    updatedUser.artistInfo = {
                        memberType: 'STUDENT',
                        isClubMember: false
                    };
                }
            } else if (userData.role === 'EXTERNAL_MEMBER') {
                // EXTERNAL_MEMBER로 변경 시
                if (!updatedUser.artistInfo) {
                    updatedUser.artistInfo = {
                        affiliation: '',
                        affiliationType: 'INDIVIDUAL'
                    };
                }
            }
        }

        this.users[index] = updatedUser;
        return updatedUser;
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(id) {
        const index = this.users.findIndex(user => user.id === Number(id));
        if (index === -1) return false;

        this.users.splice(index, 1);
        return true;
    }
}
