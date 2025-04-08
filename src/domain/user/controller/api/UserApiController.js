
import SessionUtil from '../../../../common/utils/SessionUtil.js';
import { Message } from '../../../../common/constants/Message.js';
import { ApiResponse } from '../../../common/model/ApiResponse.js';
import UserRequestDto from '../../model/dto/UserRequestDto.js';
import UserResponseDto from '../../model/dto/UserResponseDto.js';
import UserService from '../../service/UserService.js';
import {
    UserNotFoundError,
    UserValidationError
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
            if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(Message.USER.VALIDATION_ERROR));
            }
            console.error('Error registering user:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.REGISTER_ERROR));
        }
    }

    /**
     * 사용자 로그인을 처리합니다.
     */
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.userService.loginUser({ email, password });

            // 세션에 저장
            await SessionUtil.saveUserToSession(req, user);

            return res.json(ApiResponse.success(user, Message.USER.LOGIN_SUCCESS));
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            }
            console.error('Error logging in user:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.LOGIN_ERROR));
        }
    }

    /**
     * 사용자 로그아웃을 처리합니다.
     */
    async logoutUser(req, res) {
        try {
            await this.userService.logoutUser();
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
        try {
            const user = await this.userService.getUserProfile();
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
            const user = await this.userService.updateUserProfile(profileData);
            return res.json(ApiResponse.success(user, Message.USER.UPDATE_SUCCESS));
        } catch (error) {
            if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(Message.USER.VALIDATION_ERROR));
            }
            console.error('Error updating user profile:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.UPDATE_ERROR));
        }
    }

    /**
     * 사용자 계정을 삭제합니다.
     */
    async deleteUserAccount(req, res) {
        try {
            await this.userService.deleteUserAccount();
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
            await this.userService.resetPassword(email);
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json(ApiResponse.error(Message.USER.RESET_PASSWORD_ERROR));
        }
    }

}
