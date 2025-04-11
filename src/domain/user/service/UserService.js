import UserRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';
import UserRequestDTO from '../model/dto/UserRequestDTO.js';
import UserSimpleDto from '../model/dto/UserSimpleDto.js';
import UserDetailDto from '../model/dto/UserDetailDto.js';
import { UserNotFoundError, UserEmailDuplicateError, UserUsernameDuplicateError } from '../../../common/error/UserError.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import { sendVerificationEmail } from '../../../common/utils/emailSender.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
export default class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userRequestDTO) {

        // 이메일 중복 확인
        const existingEmail = await this.userRepository.findUserByEmail(userRequestDTO.email);
        if (existingEmail) {
            throw new UserEmailDuplicateError();
        }

        // 사용자명 중복 확인
        const existingUsername = await this.userRepository.findUserByUsername(userRequestDTO.username);
        if (existingUsername) {
            throw new UserUsernameDuplicateError();
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(userRequestDTO.password, 10);

        // Id 생성
        const userId = generateDomainUUID(DOMAINS.USER);
        const skkuUserId = generateDomainUUID(DOMAINS.SKKU_USER);
        const externalUserId = generateDomainUUID(DOMAINS.EXTERNAL_USER);

        // 이메일 인증 토큰 생성
        const token = uuidv4();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1시간 후 만료


        // 사용자 데이터 구성
        const userDto = new UserRequestDTO({
            ...userRequestDTO,
            id: userId,
            skkuUserId,
            externalUserId,
            password: hashedPassword,
            emailVerificationToken: token,
            emailVerificationTokenExpiry: tokenExpiry
        });

        console.log('userDto:', userDto);

        const Createduser = await this.userRepository.createUser(userDto);
        console.log('Createduser:', Createduser);
        // 이메일 전송
        try {
            await sendVerificationEmail(userDto.email, token);
        } catch (emailError) {
            console.error('❌ 이메일 전송 실패:', emailError);
            throw new Error('사용자 생성은 완료되었지만, 이메일 전송에 실패했습니다.');
        }
        const userSimpleDto = new UserSimpleDto(Createduser);
        return userSimpleDto;
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

        users;

        return null;
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     */
    async getUserDetail(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        const userDetailDto = this.mapUserToDto(user);

        return userDetailDto;
    }

    /**
     * 사용자의 간단한 정보를 조회합니다.
     */
    async getUserSimple(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        const userSimpleDto = new UserSimpleDto(user);
        userSimpleDto.affiliation = user.SkkuUserProfile ? user.SkkuUserProfile.department + ' ' + user.SkkuUserProfile.studentYear : user.ExternalUserProfile.affiliation;

        return userSimpleDto;
    }


    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUserProfile(userId, userData) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        console.log('userData:', userData);

        // 이름 & 비밀번호
        user.name = userData.name;
        if (userData.newPassword !== '' && userData.newPassword == userData.confirmPassword) {
            const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
            user.password = hashedPassword;
        }

        // 역할에 따른 프로필 정보 수정
        if (user.role === 'SKKU_MEMBER' && user.SkkuUserProfile !== null) {
            user.SkkuUserProfile.department = userData.department;
            user.SkkuUserProfile.studentYear = userData.studentYear;
        } else if (user.role === 'EXTERNAL_MEMBER' && user.ExternalUserProfile !== null) {
            user.ExternalUserProfile.affiliation = userData.affiliation;
        }

        try {
            // 사용자 정보 업데이트
            const updatedUser = await this.userRepository.updateUserProfile(user);
            return updatedUser;
        } catch (error) {
            console.error('사용자 정보 업데이트 실패:', error);
            throw new Error('사용자 정보 업데이트 실패');
        }
    }
    /**
     * 사용자를 삭제합니다.
     */
    async deleteUserAccount(userId) {
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

        return user;
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

    /**
     * 사용자 프로필 정보를 조회합니다.
     */
    mapUserToDto(user) {

        const { id, username, email, name, status, role, createdAt } = user;

        const department = user.SkkuUserProfile ? user.SkkuUserProfile.department : '';
        const studentYear = user.SkkuUserProfile ? user.SkkuUserProfile.studentYear : '';
        const isClubMember = user.SkkuUserProfile ? user.SkkuUserProfile.isClubMember : '';
        const affiliation = user.ExternalUserProfile ? user.ExternalUserProfile.affiliation : '';

        const dtoData = {
            id,
            username,
            email,
            name,
            role,
            status,
            department,
            studentYear,
            isClubMember,
            affiliation,
            createdAt
        };

        return new UserDetailDto(dtoData);
    }

    /**
     * 이메일 인증을 처리합니다.
     */
    async verifyEmail(token) {
        const user = await this.userRepository.findUserByEmailVerificationToken(token);
        if (!user) {
            throw new Error('잘못된 요청입니다.');
        }

        // 이메일 인증 토큰 만료 시간 확인
        if (user.emailVerificationTokenExpiry < new Date()) {
            throw new Error('이메일 인증 토큰이 만료되었습니다.');
        }

        const verifieddUser = await this.userRepository.updateUser(user.id, { emailVerified: true, emailVerificationToken: null, emailVerificationTokenExpiry: null, status: 'ACTIVE' });

        return verifieddUser;
    }
}
