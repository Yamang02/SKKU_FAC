import UserRepositoryImpl from '../../../infrastructure/repository/UserRepositoryImpl.js';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../infrastructure/data/user.js';
import UserDto from '../dto/UserDTO.js';

class UserService {
    constructor() {
        this.userRepository = new UserRepositoryImpl();
    }

    /**
     * 사용자명으로 사용자를 찾습니다.
     * @param {string} username - 찾을 사용자의 아이디
     * @returns {Promise<Object|null>} 찾은 사용자 객체 또는 null
     */
    async findByUsername(username) {
        const user = await this.userRepository.findByUsername(username);
        return user ? UserDto.fromEntity(user) : null;
    }

    /**
     * 이메일로 사용자를 찾습니다.
     * @param {string} email - 찾을 사용자의 이메일
     * @returns {Promise<Object|null>} 찾은 사용자 객체 또는 null
     */
    async findByEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        return user ? UserDto.fromEntity(user) : null;
    }

    /**
     * 사용자 로그인을 처리합니다.
     * @param {string} username - 사용자명
     * @param {string} password - 비밀번호
     * @returns {Promise<Object>} 로그인된 사용자 정보
     * @throws {Error} 로그인 실패 시 에러
     */
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

    /**
     * 새로운 사용자를 등록합니다.
     * @param {Object} userData - 사용자 데이터
     * @returns {Promise<Object>} 등록된 사용자 정보
     * @throws {Error} 등록 실패 시 에러
     */
    async register(userData) {
        const { password, confirmPassword, ...otherData } = userData;

        if (password !== confirmPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 데이터 준비
        const userToSave = {
            ...otherData,
            password: hashedPassword,
            role: otherData.role || UserRole.GUEST,
            studentId: otherData.role === UserRole.CLUB_MEMBER ? otherData.studentId : null,
            artistInfo: otherData.role === UserRole.ARTIST ? JSON.parse(otherData.artistInfo) : null
        };

        // 사용자 저장
        const savedUser = await this.userRepository.save(userToSave);
        return UserDto.fromEntity(savedUser);
    }

    /**
     * 사용자 프로필을 조회합니다.
     * @param {number} userId - 사용자 ID
     * @returns {Promise<Object>} 사용자 프로필 정보
     * @throws {Error} 조회 실패 시 에러
     */
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        return UserDto.fromEntity(user);
    }

    /**
     * 사용자 프로필을 수정합니다.
     * @param {number} userId - 사용자 ID
     * @param {Object} updateData - 수정할 프로필 데이터
     * @returns {Promise<Object>} 수정된 사용자 프로필 정보
     * @throws {Error} 수정 실패 시 에러
     */
    async updateProfile(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 변경 처리
        if (updateData.newPassword) {
            if (updateData.newPassword !== updateData.confirmNewPassword) {
                throw new Error('새 비밀번호가 일치하지 않습니다.');
            }
            updateData.password = await bcrypt.hash(updateData.newPassword, 10);
        }

        // 수정 가능한 필드만 업데이트
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

    /**
     * 새로운 사용자를 생성합니다.
     * @param {Object} userData - 생성할 사용자 데이터
     * @returns {Promise<Object>} 생성된 사용자 객체
     */
    async createUser(userData) {
        // 중복 검사
        const existingUser = await this.userRepository.findByUsername(userData.username);
        if (existingUser) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }

        const existingEmail = await this.userRepository.findByEmail(userData.email);
        if (existingEmail) {
            throw new Error('이미 사용 중인 이메일입니다.');
        }

        const savedUser = await this.userRepository.save(userData);
        return UserDto.fromEntity(savedUser);
    }

    /**
     * 사용자 정보를 업데이트합니다.
     * @param {string} userId - 업데이트할 사용자의 ID
     * @param {Object} updateData - 업데이트할 데이터
     * @returns {Promise<Object>} 업데이트된 사용자 객체
     */
    async updateUser(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 이메일 변경 시 중복 검사
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await this.userRepository.findByEmail(updateData.email);
            if (existingEmail) {
                throw new Error('이미 사용 중인 이메일입니다.');
            }
        }

        const updatedUser = await this.userRepository.update(userId, updateData);
        return UserDto.fromEntity(updatedUser);
    }

    /**
     * 사용자를 삭제합니다.
     * @param {string} userId - 삭제할 사용자의 ID
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        await this.userRepository.delete(userId);
    }
}

export default UserService;
