import UserRequestDto from '../model/dto/UserRequestDto.js';
import UserSimpleDto from '../model/dto/UserSimpleDto.js';
import UserDetailDto from '../model/dto/UserDetailDto.js';
import { UserNotFoundError, UserEmailDuplicateError, UserUsernameDuplicateError, UserInactiveError, UserUnverifiedError, UserBlockedError, UserAuthError, UserValidationError } from '../../../common/error/UserError.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import bcrypt from 'bcrypt';
import Page from '../../common/model/Page.js';
import UserListManagementDto from '../../admin/model/dto/user/UserListManagementDto.js';
import UserManagementDto from '../../admin/model/dto/user/UserManagementDto.js';
import logger from '../../../common/utils/Logger.js';
import UserAccountRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';
import AuthService from '../../auth/service/AuthService.js';

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
export default class UserService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['UserAccountRepository', 'AuthService'];

    constructor(userRepository, authService) {
        // 의존성 주입 검증 - 의존성이 없으면 기본 인스턴스 생성
        if (!userRepository || !authService) {
            // 기존 방식 호환성 유지 (임시)
            this.userRepository = new UserAccountRepository();
            this.authService = new AuthService();
        } else {
            this.userRepository = userRepository;
            this.authService = authService;
        }
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userRequestDTO) {

        // 이메일과 사용자명 중복 확인을 하나의 쿼리로 최적화
        const [existingEmailUser, existingUsernameUser] = await Promise.all([
            this.userRepository.findUserByEmail(userRequestDTO.email),
            this.userRepository.findUserByUsername(userRequestDTO.username)
        ]);

        if (existingEmailUser) {
            throw new UserEmailDuplicateError();
        }

        if (existingUsernameUser) {
            throw new UserUsernameDuplicateError();
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(userRequestDTO.password, 10);

        // Id 생성
        const userId = generateDomainUUID(DOMAINS.USER);
        const skkuUserId = generateDomainUUID(DOMAINS.SKKU_USER);
        const externalUserId = generateDomainUUID(DOMAINS.EXTERNAL_USER);


        // 사용자 데이터 구성
        const userDto = new UserRequestDto({
            ...userRequestDTO,
            id: userId,
            skkuUserId,
            externalUserId,
            password: hashedPassword,
            emailVerified: false,
            status: 'PENDING'
        });

        const createdUser = await this.userRepository.createUser(userDto);

        // 인증 서비스를 통해 이메일 인증 토큰 생성 및 이메일 발송
        try {
            await this.authService.createEmailVerificationToken(createdUser.id, createdUser.email);
        } catch (emailError) {
            logger.error('이메일 전송 실패', emailError);
            throw new UserValidationError('인증 이메일 전송에 실패했습니다. 관리자에게 문의하세요');
        }

        const userSimpleDto = new UserSimpleDto(createdUser);
        return userSimpleDto;
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
            logger.error('사용자 목록 조회 중 오류', error);
            throw new UserValidationError('사용자 목록을 조회하는데 실패했습니다.');
        }
    }

    /**
     * 사용자를 조회하고 존재하지 않으면 에러를 던집니다.
     * @private
     */
    async _findUserOrThrow(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     */
    async getUserDetail(userId) {
        const user = await this._findUserOrThrow(userId);
        return this.mapUserToDto(user);
    }

    /**
     * 사용자의 간단한 정보를 조회합니다.
     */
    async getUserSimple(userId) {
        const user = await this._findUserOrThrow(userId);
        const userSimpleDto = new UserSimpleDto(user);
        userSimpleDto.affiliation = user.SkkuUserProfile ?
            user.SkkuUserProfile.department + ' ' + user.SkkuUserProfile.studentYear :
            user.ExternalUserProfile?.affiliation || '';

        return userSimpleDto;
    }

    /**
    * 이메일로 사용자를 조회합니다.
    */
    async getUserByEmail(email) {
        return await this.userRepository.findUserByEmail(email);
    }

    /**
     * ID로 사용자를 조회합니다.
     */
    async getUserById(userId) {
        return await this.userRepository.findUserById(userId);
    }

    /**
      * username으로 사용자를 조회합니다.
      */
    async getUserByUsername(username) {
        return await this.userRepository.findUserByUsername(username);
    }


    /**
     * 사용자 프로필 정보를 수정합니다.
     */
    async updateUserProfile(userId, userData) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        // 이름 업데이트
        if (userData.name) {
            user.name = userData.name;
        }

        // 비밀번호 업데이트 (새 비밀번호가 있고 확인 비밀번호와 일치할 때만)
        if (userData.newPassword && userData.newPassword === userData.confirmPassword) {
            const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
            user.password = hashedPassword;
        }

        // 역할에 따른 프로필 정보 수정
        if (user.role === 'SKKU_MEMBER' && user.SkkuUserProfile) {
            if (userData.department) user.SkkuUserProfile.department = userData.department;
            if (userData.studentYear) user.SkkuUserProfile.studentYear = userData.studentYear;
        } else if (user.role === 'EXTERNAL_MEMBER' && user.ExternalUserProfile) {
            if (userData.affiliation) user.ExternalUserProfile.affiliation = userData.affiliation;
        }

        try {
            // 사용자 정보 업데이트
            const updatedUser = await this.userRepository.updateUserProfile(user);
            return updatedUser;
        } catch (error) {
            logger.error('사용자 정보 업데이트 실패:', error);
            throw new UserValidationError('사용자 정보 업데이트에 실패했습니다.');
        }
    }

    /**
    * 비밀번호를 업데이트합니다.
    */
    async updatePassword(userId, newPassword) {
        await this._findUserOrThrow(userId);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await this.userRepository.updateUser(userId, { password: hashedPassword });
    }

    /**
    * 사용자 계정을 활성화합니다.
    */
    async activateUser(userId) {
        await this._findUserOrThrow(userId);

        // 이메일 인증 완료 및 계정 활성화
        return await this.userRepository.updateUser(userId, {
            emailVerified: true,
            status: 'ACTIVE'
        });
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUserByAdmin(userId, userData) {
        await this._findUserOrThrow(userId);

        // 사용자 정보 업데이트
        const updatedUser = await this.userRepository.updateUser(userId, userData);
        return updatedUser;
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUserAccount(userId) {
        await this._findUserOrThrow(userId);

        const success = await this.userRepository.deleteUser(userId);
        if (!success) {
            throw new UserValidationError('사용자 삭제에 실패했습니다.');
        }

        return true;
    }

    /**
     * 로그인을 처리합니다.
     */
    async authenticate(username, password) {
        const user = await this.userRepository.findUserByUsername(username);
        logger.auth('로그인 처리', { username: user.username });

        if (!user) {
            throw new UserNotFoundError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UserAuthError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        // 계정 상태 확인
        if (user.status === 'BLOCKED') {
            throw new UserBlockedError('계정이 차단되었습니다. 관리자에게 문의하세요.');
        }

        if (user.status === 'INACTIVE') {
            throw new UserInactiveError('계정이 비활성화되었습니다. 관리자에게 문의하세요.');
        }

        if (user.status === 'UNVERIFIED') {
            throw new UserUnverifiedError('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
        }

        if (user.status !== 'ACTIVE') {
            throw new UserInactiveError('로그인할 수 없는 계정 상태입니다. 관리자에게 문의하세요.');
        }

        // 로그인 성공 시 마지막 로그인 시간 업데이트
        await this.userRepository.updateUser(user.id, {
            lastLoginAt: new Date()
        });

        return user;
    }

    /**
     * 관리자용 작업의 공통 에러 처리
     * @private
     */
    _handleManagementError(error, operation) {
        logger.error(`${operation} 중 오류:`, error);
        throw new UserValidationError(`${operation}에 실패했습니다.`);
    }

    /**
     * 관리자용 사용자 목록을 조회합니다.
     * @param {Object} options - 조회 옵션
     * @returns {Promise<UserListManagementDto>} 사용자 목록 DTO
     */
    async getManagementUserList(options = {}) {
        try {
            const userListData = await this.getUserList(options);
            return new UserListManagementDto({
                items: userListData.items || [],
                total: userListData.total || 0,
                page: userListData.page,
                filters: options.filters || {}
            });
        } catch (error) {
            this._handleManagementError(error, '사용자 목록 조회');
        }
    }

    /**
     * 관리자용 사용자 상세 정보를 조회합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<UserManagementDto>} 사용자 DTO
     */
    async getManagementUserDetail(userId) {
        try {
            const userDetail = await this.getUserDetail(userId);
            return new UserManagementDto(userDetail);
        } catch (error) {
            this._handleManagementError(error, '사용자 상세 정보 조회');
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
            await this.updateUser(userId, userData);
            return { success: true, message: '회원 정보가 저장되었습니다.' };
        } catch (error) {
            this._handleManagementError(error, '사용자 정보 수정');
        }
    }

    /**
     * 관리자용 사용자를 삭제합니다.
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deleteManagementUser(userId) {
        try {
            await this.deleteUserAccount(userId);
            return { success: true, message: '회원이 삭제되었습니다.' };
        } catch (error) {
            this._handleManagementError(error, '사용자 삭제');
        }
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
     * 사용자 비밀번호를 재설정합니다.
     */
    async requestResetPassword(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new UserNotFoundError();
        }

        try {
            await this.authService.createPasswordResetToken(user.id, user.email);
            return new UserSimpleDto(user);
        } catch (emailError) {
            logger.error('이메일 전송 실패:', emailError);
            throw new UserValidationError('인증 이메일 전송에 실패했습니다. 관리자에게 문의하세요');
        }
    }
}
