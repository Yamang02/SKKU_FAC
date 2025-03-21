import UserRepositoryImpl from '../../../infrastructure/repository/UserRepositoryImpl.js';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../infrastructure/data/user.js';
import UserDto from '../dto/UserDto.js';

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
class UserService {
    constructor(userRepository = new UserRepositoryImpl()) {
        this.userRepository = userRepository;
    }

    // 검증 메서드들
    validatePassword(password) {
        if (password.length < 8) {
            throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error('비밀번호는 최소 1개의 대문자를 포함해야 합니다.');
        }
        if (!/[0-9]/.test(password)) {
            throw new Error('비밀번호는 최소 1개의 숫자를 포함해야 합니다.');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            throw new Error('비밀번호는 최소 1개의 특수문자(!@#$%^&*)를 포함해야 합니다.');
        }
    }

    validateStudentId(studentId) {
        if (!studentId) return false;
        return /^\d{9}$/.test(studentId);
    }

    validateEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validateArtistInfo(artistInfo) {
        if (!artistInfo) return false;
        if (!artistInfo.biography || typeof artistInfo.biography !== 'string') return false;
        if (!artistInfo.specialty || typeof artistInfo.specialty !== 'string') return false;
        return true;
    }

    validateUserRole(user, requiredRole) {
        if (!user || user.role !== requiredRole) {
            throw new Error('접근 권한이 없습니다.');
        }
    }

    validateUserStatus(user) {
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        if (user.status === 'INACTIVE') {
            throw new Error('비활성화된 계정입니다.');
        }
        if (user.status === 'BLOCKED') {
            throw new Error('차단된 계정입니다.');
        }
    }

    // 중복 검사 메서드들
    async checkDuplicateUsername(username) {
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('이미 사용 중인 사용자명입니다.');
        }
    }

    async checkDuplicateEmail(email) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('이미 사용 중인 이메일입니다.');
        }
    }

    // 조회 메서드들
    async getUserList(page, limit, filters) {
        const users = await this.userRepository.findAll(page, limit, filters);
        return users.map(user => UserDto.fromEntity(user));
    }

    async findByUsername(username) {
        const user = await this.userRepository.findByUsername(username);
        return user ? UserDto.fromEntity(user) : null;
    }

    async findByEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        return user ? UserDto.fromEntity(user) : null;
    }

    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        return UserDto.fromEntity(user);
    }

    async getUserStats() {
        const totalUsers = await this.userRepository.count();
        const roleStats = await this.userRepository.countByRole();
        const activeUsers = await this.userRepository.countByStatus('ACTIVE');

        return {
            totalUsers,
            roleStats,
            activeUsers
        };
    }

    // 인증 관련 메서드들
    async login(username, password) {
        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        this.validateUserStatus(user);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        return UserDto.fromEntity(user);
    }

    // 사용자 관리 메서드들
    async register(userData) {
        const { password, confirmPassword, ...otherData } = userData;

        if (password !== confirmPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        await this.checkDuplicateUsername(otherData.username);
        await this.checkDuplicateEmail(otherData.email);
        this.validatePassword(password);

        const hashedPassword = await bcrypt.hash(password, 10);

        const userToSave = {
            ...otherData,
            password: hashedPassword,
            role: otherData.role || UserRole.GUEST,
            studentId: otherData.role === UserRole.CLUB_MEMBER ? otherData.studentId : null,
            artistInfo: otherData.role === UserRole.ARTIST ? JSON.parse(otherData.artistInfo) : null,
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date()
        };

        const savedUser = await this.userRepository.save(userToSave);
        return UserDto.fromEntity(savedUser);
    }

    async updateProfile(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        this.validateUserStatus(user);

        if (updateData.email && updateData.email !== user.email) {
            await this.checkDuplicateEmail(updateData.email);
        }

        if (updateData.newPassword) {
            if (updateData.newPassword !== updateData.confirmNewPassword) {
                throw new Error('새 비밀번호가 일치하지 않습니다.');
            }
            this.validatePassword(updateData.newPassword);
            updateData.password = await bcrypt.hash(updateData.newPassword, 10);
        }

        const updatableFields = ['name', 'email', 'password', 'studentId', 'artistInfo'];
        const updateFields = {
            updated_at: new Date()
        };

        for (const field of updatableFields) {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        }

        await this.userRepository.update(userId, updateFields);
        return this.getProfile(userId);
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
        this.validateUserStatus(user);

        const updatedUser = await this.userRepository.update(userId, {
            role: newRole,
            updated_at: new Date()
        });

        return UserDto.fromEntity(updatedUser);
    }
}

export default UserService;
