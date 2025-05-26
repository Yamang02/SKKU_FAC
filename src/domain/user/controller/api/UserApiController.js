import SessionUtil from '../../../../common/utils/SessionUtil.js';
import { Message } from '../../../../common/constants/Message.js';
import { ApiResponse } from '../../../common/model/ApiResponse.js';
import UserRequestDto from '../../model/dto/UserRequestDto.js';
import UserResponseDto from '../../model/dto/UserResponseDto.js';
import UserService from '../../service/UserService.js';
import {
    UserNotFoundError,
    UserValidationError,
    UserEmailDuplicateError,
    UserUsernameDuplicateError,
    UserInactiveError,
    UserUnverifiedError,
    UserBlockedError
} from '../../../../common/error/UserError.js';
export default class UserApiController {
    constructor() {
        this.userService = new UserService();
    }

    // === API 엔드포인트 ===
    /**
     * 사용자를 등록합니다.
     */
    async registerUser(req, res) {
        try {
            const { username, name, email, password, role, department, affiliation, studentYear, isClubMember } = req.body;

            // DTO 생성 시 role에 따라 추가 필드 설정
            const userDto = new UserRequestDto({
                username,
                name,
                email,
                password,
                role,
                department: role === 'SKKU_MEMBER' ? department : null,
                isClubMember: role === 'SKKU_MEMBER' ? isClubMember : false,
                studentYear: role === 'SKKU_MEMBER' ? studentYear : null,
                affiliation: role === 'EXTERNAL_MEMBER' ? affiliation : null
            });

            const createdUser = await this.userService.createUser(userDto);
            const userResponseDto = new UserResponseDto(createdUser);
            return res.status(201).json(ApiResponse.success(userResponseDto, Message.USER.REGISTER_SUCCESS));
        } catch (error) {
            console.error('회원가입 처리 중 오류:', error.message);
            if (error instanceof UserEmailDuplicateError) {
                return res.status(400).json(ApiResponse.error(Message.USER.DUPLICATE_EMAIL_ERROR));
            } else if (error instanceof UserUsernameDuplicateError) {
                return res.status(400).json(ApiResponse.error(Message.USER.DUPLICATE_USERNAME_ERROR));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(Message.USER.VALIDATION_ERROR));
            }
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * 사용자 로그인을 처리합니다.
     */
    async loginUser(req, res) {
        try {
            const { username, password } = req.body;
            const user = await this.userService.authenticate(username, password);

            // 세션에 저장
            await SessionUtil.saveUserToSession(req, user);

            return res.json(ApiResponse.success(user, Message.USER.LOGIN_SUCCESS));
        } catch (error) {
            console.error('Error logging in user:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            }
            if (error instanceof UserInactiveError) {
                return res.status(401).json(ApiResponse.error(Message.USER.INACTIVE_ERROR));
            } else if (error instanceof UserUnverifiedError) {
                return res.status(401).json(ApiResponse.error(Message.USER.UNVERIFIED_ERROR));
            } else if (error instanceof UserBlockedError) {
                return res.status(401).json(ApiResponse.error(Message.USER.BLOCKED_ERROR));
            }
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

    async getSessionUser(req, res) {
        const user = req.session.user;
        return res.json(ApiResponse.success(user));
    }

    /**
     * 사용자 로그아웃을 처리합니다.
     */
    async logoutUser(req, res) {
        try {
            await SessionUtil.destroySession(req);
            return res.json(ApiResponse.success(null, Message.USER.LOGOUT_SUCCESS));
        } catch (error) {
            console.error('Error logging out user:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.LOGOUT_ERROR));
        }
    }

    /**
     * 사용자 프로필을 조회합니다.
     */
    async getUserProfile(req, res) {
        const userId = req.session.user.id;

        try {
            const user = await this.userService.getUserDetail(userId);
            return res.json(ApiResponse.success(user));
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            }
            console.error('Error getting user profile:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.PROFILE_ERROR));
        }
    }

    /**
     * 사용자 프로필을 수정합니다.
     */
    async updateUserProfile(req, res) {
        try {
            const profileData = req.body;
            const userId = req.session.user.id;
            const updatedUser = await this.userService.updateUserProfile(userId, profileData);
            return res.json(ApiResponse.success(updatedUser, Message.USER.UPDATE_SUCCESS));
        } catch (error) {
            if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(Message.USER.VALIDATION_ERROR));
            }
            console.error('Error updating user profile:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.UPDATE_ERROR));
        }
    }

    /**
     * 플래시 메시지를 반환합니다.
     */
    async getFlashMessage(req, res) {
        try {
            const flash = req.session.flash;

            ('플래시 메시지 : ', flash);

            // 플래시 메시지를 세션에서 제거
            if (flash) {
                delete req.session.flash;
            }

            return res.json(ApiResponse.success({ flash }));
        } catch (error) {
            console.error('Error getting flash message:', error);
            return res.status(500).json(ApiResponse.error('플래시 메시지를 가져오는 중 오류가 발생했습니다.'));
        }
    }

    /**
     * 사용자 계정을 삭제합니다.
     */
    async deleteUserAccount(req, res) {
        try {
            const userId = req.session.user.id;
            await this.userService.deleteUserAccount(userId);
            await SessionUtil.destroySession(req);
            return res.json(ApiResponse.success(null, Message.USER.DELETE_SUCCESS));
        } catch (error) {
            console.error('Error deleting user account:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.DELETE_ERROR));
        }
    }

    /**
     * 사용자 비밀번호 재설정
     */
    async resetPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await this.userService.requestResetPassword(email);
            return res.json(ApiResponse.success(user, Message.USER.RESET_PASSWORD_REQUEST_SUCCESS));
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * 이메일로 사용자 아이디(username) 찾기
     */
    async findUsername(req, res) {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json(ApiResponse.error('이메일을 입력해주세요.'));
            }

            const user = await this.userService.getUserByEmail(email);

            if (!user) {
                return res.status(404).json(ApiResponse.error('해당 이메일로 등록된 사용자가 없습니다.'));
            }

            return res.json(ApiResponse.success({ username: user.username }, '아이디를 찾았습니다.'));
        } catch (error) {
            console.error('아이디 찾기 중 오류:', error);
            return res.status(500).json(ApiResponse.error('아이디 찾기 중 오류가 발생했습니다.'));
        }
    }
}
