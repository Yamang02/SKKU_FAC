import UserRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';
import UserRequestDTO from '../model/dto/UserRequestDTO.js';
import UserSimpleDto from '../model/dto/UserSimpleDto.js';
import UserDetailDto from '../model/dto/UserDetailDto.js';
import { UserNotFoundError, UserEmailDuplicateError, UserUsernameDuplicateError } from '../../../common/error/UserError.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../../common/utils/emailSender.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Page from '../../common/model/Page.js';
import UserListManagementDto from '../../admin/model/dto/user/UserListManagementDto.js';
import UserManagementDto from '../../admin/model/dto/user/UserManagementDto.js';

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

        ('userDto:', userDto);

        const Createduser = await this.userRepository.createUser(userDto);
        ('Createduser:', Createduser);

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
    async getUserList(options = {}) {
        const { page = 1, limit = 10, filters = {} } = options;

        try {
            // 필터 설정
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                keyword: filters.keyword,
                status: filters.status,
                role: filters.role
            };

            // 사용자 목록 조회
            const users = await this.userRepository.findUsers(queryOptions);

            if (!users) {
                return {
                    items: [],
                    total: 0,
                    page: new Page(0, { page, limit })
                };
            }

            // 페이지 객체 생성
            const pageData = new Page(users.total, {
                page,
                limit,
                baseUrl: '/admin/management/user'
            });

            return {
                items: users.items || [],
                total: users.total || 0,
                page: pageData
            };
        } catch (error) {
            console.error('사용자 목록 조회 중 오류:', error);
            throw new Error('사용자 목록을 조회하는데 실패했습니다.');
        }
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

        ('userData:', userData);

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
     * 사용자 정보를 수정합니다.
     */
    async updateUserByAdmin(userId, userData) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        user.role = userData.role;
        user.status = userData.status;

        (user);

        // 사용자 정보 업데이트
        const updatedUser = await this.userRepository.updateUser(user.id, userData);
        return updatedUser;
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
     * 비밀번호를 초기화합니다.
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
        const updatedUser = await this.userRepository.updateUser(user.id, { password: hashedPassword });

        // 이메일 전송
        try {
            await sendPasswordResetEmail(email, tempPassword);
        } catch (emailError) {
            console.error('❌ 이메일 전송 실패:', emailError);
            throw new Error('사용자 생성은 완료되었지만, 이메일 전송에 실패했습니다.');
        }

        const userSimpleDto = new UserSimpleDto(updatedUser);

        return userSimpleDto;
    }

    /**
     * 사용자 프로필 정보를 매핑합니다.
     */
    mapUserToDto(user) {
        const dtoData = new UserDetailDto(user);

        if (user.role === 'SKKU_MEMBER') {
            dtoData.department = user.SkkuUserProfile.department;
            dtoData.studentYear = user.SkkuUserProfile.studentYear;
            dtoData.isClubMember = user.SkkuUserProfile.isClubMember;
        } else if (user.role === 'EXTERNAL_MEMBER') {
            dtoData.affiliation = user.ExternalUserProfile.affiliation;
        }

        return dtoData;
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


    /**
     * 관리자용 사용자 목록을 조회합니다.
     * @param {Object} options - 조회 옵션
     * @returns {Promise<UserListManagementDto>} 사용자 목록 DTO
     */
    async getManagementUserList(options = {}) {
        try {
            const userListData = await this.userService.getUserList(options);
            return new UserListManagementDto({
                items: userListData.items || [],
                total: userListData.total || 0,
                page: userListData.page,
                filters: options.filters || {}
            });
        } catch (error) {
            console.error('사용자 목록 조회 중 오류:', error);
            throw new Error('사용자 목록을 조회하는데 실패했습니다.');
        }
    }

    /**
     * 관리자용 사용자 상세 정보를 조회합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<UserManagementDto>} 사용자 DTO
     */
    async getManagementUserDetail(userId) {
        try {
            const userDetail = await this.userService.getUserDetail(userId);
            return new UserManagementDto(userDetail);
        } catch (error) {
            console.error('사용자 상세 정보 조회 중 오류:', error);
            throw new Error('사용자 상세 정보를 조회하는데 실패했습니다.');
        }
    }

    /**
     * 관리자용 사용자 정보를 수정합니다.
     * @param {string} userId - 사용자 ID
     * @param {Object} userData - 수정할 사용자 정보
     * @returns {Promise<Object>} 수정 결과
     */
    async updateManagementUser(userId, userData) {
        try {
            await this.userService.updateUser(userId, userData);
            return { success: true, message: '회원 정보가 저장되었습니다.' };
        } catch (error) {
            console.error('사용자 정보 수정 중 오류:', error);
            throw new Error('사용자 정보를 수정하는데 실패했습니다.');
        }
    }

    /**
     * 관리자용 사용자를 삭제합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deleteManagementUser(userId) {
        try {
            await this.userService.deleteUserAccount(userId);
            return { success: true, message: '회원이 삭제되었습니다.' };
        } catch (error) {
            console.error('사용자 삭제 중 오류:', error);
            throw new Error('사용자를 삭제하는데 실패했습니다.');
        }
    }

    /**
     * 관리자용 사용자 비밀번호를 재설정합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 재설정 결과
     */
    async resetUserPassword(userId) {
        try {
            const tempPassword = await this.userService.resetPassword(userId);
            return {
                success: true,
                message: '비밀번호가 초기화되었습니다.',
                tempPassword
            };
        } catch (error) {
            console.error('비밀번호 재설정 중 오류:', error);
            throw new Error('비밀번호를 재설정하는데 실패했습니다.');
        }
    }
}
