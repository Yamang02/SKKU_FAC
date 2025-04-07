import UserRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';
import UserRequestDTO from '../model/dto/UserRequestDTO.js';
import UserResponseDTO from '../model/dto/UserResponseDTO.js';
import UserSimpleDTO from '../model/dto/UserSimpleDTO.js';
import Page from '../../common/model/Page.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserNotFoundError } from '../../../common/error/UserError.js';

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
export default class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * 페이지네이션 옵션을 생성합니다.
     * @private
     */
    _createPageOptions(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
            baseUrl = '/user',
            searchType,
            keyword
        } = options;

        return {
            page: parseInt(page),
            limit: parseInt(limit),
            sortField,
            sortOrder,
            baseUrl,
            filters: {
                searchType,
                keyword
            }
        };
    }

    /**
     * 사용자 목록을 조회합니다.
     */
    async getUserList({ page = 1, limit = 10, keyword }) {
        const filters = { keyword };
        const users = await this.userRepository.findUsers({
            page: parseInt(page),
            limit: parseInt(limit),
            ...filters
        });

        const pageData = new Page(users.total, {
            page: parseInt(page),
            limit: parseInt(limit),
            baseUrl: '/admin/management/user',
            filters
        });

        return {
            items: users.items.map(user => new UserResponseDTO(user)),
            page: pageData
        };
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     */
    async getUserDetail(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        return new UserResponseDTO(user);
    }

    /**
     * 사용자의 간단한 정보를 조회합니다.
     */
    async getUserSimple(id, type) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new UserNotFoundError();
        }

        return new UserSimpleDTO(user, type).toJSON();
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userData) {
        const requestDTO = new UserRequestDTO(userData);
        const validatedData = requestDTO.toJSON();

        // 이메일 중복 확인
        const existingEmail = await this.userRepository.findUserByEmail(validatedData.email);
        if (existingEmail) {
            throw new Error('이미 사용 중인 이메일입니다.');
        }

        // 사용자명 중복 확인
        const existingUsername = await this.userRepository.findUserByUsername(validatedData.username);
        if (existingUsername) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // 사용자 데이터 구성
        const userToCreate = {
            ...validatedData,
            password: hashedPassword
        };

        const user = await this.userRepository.createUser(userToCreate);
        return new UserResponseDTO(user);
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUser(userId, updateData) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        const requestDTO = new UserRequestDTO({
            ...user,
            ...updateData,
            id: userId
        });
        const validatedData = requestDTO.toJSON();

        // 이메일 중복 확인 (자신의 이메일 제외)
        if (validatedData.email !== user.email) {
            const existingEmail = await this.userRepository.findUserByEmail(validatedData.email);
            if (existingEmail) {
                throw new Error('이미 사용 중인 이메일입니다.');
            }
        }

        // 비밀번호 변경 처리
        if (validatedData.password) {
            validatedData.password = await bcrypt.hash(validatedData.password, 10);
        } else {
            delete validatedData.password;
        }

        const updatedUser = await this.userRepository.updateUser(userId, validatedData);
        return new UserResponseDTO(updatedUser);
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        const success = await this.userRepository.deleteUser(userId);
        if (!success) {
            throw new Error('사용자 삭제에 실패했습니다.');
        }

        return true;
    }

    /**
     * 사용자 인증을 처리합니다.
     */
    async authenticate(username, password) {
        const user = await this.userRepository.findUserByUsername(username);
        if (!user) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        return new UserResponseDTO(user);
    }

    /**
     * 비밀번호를 재설정합니다.
     */
    async resetPassword(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('해당 이메일로 등록된 사용자가 없습니다.');
        }

        // 임시 비밀번호 생성
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 비밀번호 업데이트
        await this.userRepository.updateUser(user.id, { password: hashedPassword });

        return tempPassword;
    }
}
