import UserDomainService from '../../../domain/user/service/UserDomainService.js';
import UserDto from '../../../domain/user/dto/UserDTO.js';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../infrastructure/data/user.js';

class UserApplicationService {
    constructor(userRepository, userDomainService) {
        this.userRepository = userRepository;
        this.userDomainService = userDomainService || new UserDomainService();
    }

    async login(username, password) {
        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        return UserDto.fromEntity(user);
    }

    async register(userData) {
        const { password, confirmPassword, ...otherData } = userData;

        if (password !== confirmPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        if (!this.userDomainService.validatePassword(password)) {
            throw new Error('비밀번호가 유효하지 않습니다.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userToSave = {
            ...otherData,
            password: hashedPassword,
            role: otherData.role || UserRole.GUEST,
            studentId: otherData.role === UserRole.CLUB_MEMBER ? otherData.studentId : null,
            artistInfo: otherData.role === UserRole.ARTIST ? JSON.parse(otherData.artistInfo) : null
        };

        const savedUser = await this.userRepository.save(userToSave);
        return UserDto.fromEntity(savedUser);
    }

    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        return UserDto.fromEntity(user);
    }

    async updateProfile(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        if (updateData.newPassword) {
            if (updateData.newPassword !== updateData.confirmNewPassword) {
                throw new Error('새 비밀번호가 일치하지 않습니다.');
            }
            if (!this.userDomainService.validatePassword(updateData.newPassword)) {
                throw new Error('새 비밀번호가 유효하지 않습니다.');
            }
            updateData.password = await bcrypt.hash(updateData.newPassword, 10);
        }

        const updatableFields = ['name', 'email', 'password', 'studentId', 'artistInfo'];
        const updateFields = {};

        for (const field of updatableFields) {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        }

        await this.userRepository.update(userId, updateFields);
        return this.getProfile(userId);
    }

    async getUserList(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        const users = await this.userRepository.findAll(offset, limit, filters);
        const total = await this.userRepository.count(filters);

        return {
            users: users.map(user => UserDto.fromEntity(user)),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        };
    }

    async getUserStats() {
        const total = await this.userRepository.count();
        const roleStats = await this.userRepository.countByRole();
        const recentUsers = await this.userRepository.findRecent(5);

        return {
            total,
            roleStats,
            recentUsers: recentUsers.map(user => UserDto.fromEntity(user))
        };
    }

    async deleteUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        await this.userRepository.delete(userId);
    }

    async updateUserRole(userId, newRole) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        if (!Object.values(UserRole).includes(newRole)) {
            throw new Error('유효하지 않은 역할입니다.');
        }

        await this.userRepository.update(userId, { role: newRole });
        return this.getProfile(userId);
    }
}

export default UserApplicationService;
