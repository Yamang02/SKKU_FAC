import SessionUtil from '#common/utils/SessionUtil.js';
import { Message } from '#common/constants/Message.js';
import { ApiResponse } from '#domain/common/model/ApiResponse.js';
import UserRequestDto from '#domain/user/model/dto/UserRequestDto.js';
import UserResponseDto from '#domain/user/model/dto/UserResponseDto.js';
import {
    UserNotFoundError,
    UserValidationError,
    UserEmailDuplicateError,
    UserUsernameDuplicateError,
    UserInactiveError,
    UserUnverifiedError,
    UserBlockedError,
    UserAuthError
} from '#common/error/UserError.js';
import logger from '#common/utils/Logger.js';

export default class UserApiController {
    /**
     * 의존성 정의 (컨테이너에서 자동 주입)
     */
    static dependencies = ['UserService'];

    /**
     * 생성자 - 의존성 주입
     * @param {UserService} userService - 사용자 서비스
     */
    constructor(userService) {
        this.userService = userService;
    }

    // === API 엔드포인트 ===
    /**
     * 사용자를 등록합니다.
     */
    async registerUser(req, res) {
        try {
            // 디버깅: 받은 데이터 확인
            console.log('🔍 회원가입 요청 데이터:', {
                body: req.body,
                userDto: req.userDto
            });

            // 새로운 DTO 검증 미들웨어에서 제공하는 검증된 DTO 인스턴스 사용
            const userDto = req.userDto;

            // DTO가 없는 경우 fallback (기존 방식)
            if (!userDto) {
                const { username, name, email, password, role, department, affiliation, studentYear, isClubMember } =
                    req.body;

                const fallbackDto = new UserRequestDto({
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

                const createdUser = await this.userService.createUser(fallbackDto);
                const userResponseDto = new UserResponseDto(createdUser);
                return res.status(201).json(ApiResponse.success(userResponseDto, Message.USER.REGISTER_SUCCESS));
            }

            // 새로운 DTO 시스템 사용
            const createdUser = await this.userService.createUser(userDto);
            const userResponseDto = new UserResponseDto(createdUser);

            // 이메일 전송 상태에 따른 메시지 결정
            let successMessage = Message.USER.REGISTER_SUCCESS;
            if (createdUser.emailSent === false) {
                successMessage = '회원가입이 완료되었습니다. 이메일 설정 문제로 인증 메일 전송에 실패했습니다. 관리자에게 문의하세요.';
            }

            return res.status(201).json(ApiResponse.success(userResponseDto, successMessage));
        } catch (error) {
            logger.withContext(req).error('회원가입 처리 중 오류', error);
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
            // 새로운 DTO 검증 미들웨어에서 제공하는 검증된 데이터 사용
            const { username, password } = req.userDto ? req.userDto.toPlainObject() : req.body;

            const user = await this.userService.authenticate(username, password);

            // 세션에 저장
            await SessionUtil.saveUserToSession(req, user);

            return res.json(ApiResponse.success(user, Message.USER.LOGIN_SUCCESS));
        } catch (error) {
            logger.withContext(req).error('로그인 처리 중 오류', error);
            if (error instanceof UserNotFoundError) {
                return res.status(401).json(ApiResponse.error('아이디 또는 비밀번호가 일치하지 않습니다.'));
            } else if (error instanceof UserAuthError) {
                return res.status(401).json(ApiResponse.error('아이디 또는 비밀번호가 일치하지 않습니다.'));
            } else if (error instanceof UserInactiveError) {
                return res.status(401).json(ApiResponse.error(Message.USER.INACTIVE_ERROR));
            } else if (error instanceof UserUnverifiedError) {
                return res.status(401).json(ApiResponse.error(Message.USER.UNVERIFIED_ERROR));
            } else if (error instanceof UserBlockedError) {
                return res.status(401).json(ApiResponse.error(Message.USER.BLOCKED_ERROR));
            }
            return res.status(500).json(ApiResponse.error('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
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
            logger.withContext(req).error('로그아웃 처리 중 오류:', error);
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
            logger.withContext(req).error('사용자 프로필 조회 중 오류:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            }
            return res.status(500).json(ApiResponse.error(Message.USER.PROFILE_ERROR));
        }
    }

    /**
     * 사용자 프로필을 수정합니다.
     */
    async updateUserProfile(req, res) {
        try {
            // 새로운 DTO 검증 미들웨어에서 제공하는 검증된 데이터 사용
            const profileData = req.userDto ? req.userDto.toPlainObject() : req.body;
            const userId = req.session.user.id;

            const updatedUser = await this.userService.updateUserProfile(userId, profileData);
            return res.json(ApiResponse.success(updatedUser, Message.USER.UPDATE_SUCCESS));
        } catch (error) {
            logger.withContext(req).error('사용자 프로필 수정 중 오류:', error);
            if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(Message.USER.VALIDATION_ERROR));
            } else if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            }
            return res.status(500).json(ApiResponse.error(Message.USER.UPDATE_ERROR));
        }
    }

    /**
     * 플래시 메시지를 반환합니다.
     */
    async getFlashMessage(req, res) {
        try {
            const flash = req.session.flash;

            '플래시 메시지 : ', flash;

            // 플래시 메시지를 세션에서 제거
            if (flash) {
                delete req.session.flash;
            }

            return res.json(ApiResponse.success({ flash }));
        } catch (error) {
            logger.withContext(req).error('플래시 메시지 조회 중 오류:', error);
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
            logger.withContext(req).error('사용자 계정 삭제 중 오류:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(error.message));
            }
            return res.status(500).json(ApiResponse.error(Message.USER.DELETE_ERROR));
        }
    }

    /**
     * 사용자 비밀번호 재설정
     */
    async resetPassword(req, res) {
        try {
            // 새로운 DTO 검증 미들웨어에서 제공하는 검증된 데이터 사용
            const { email } = req.userDto ? req.userDto.toPlainObject() : req.body;

            const user = await this.userService.requestResetPassword(email);
            return res.json(ApiResponse.success(user, Message.USER.RESET_PASSWORD_REQUEST_SUCCESS));
        } catch (error) {
            logger.withContext(req).error('비밀번호 재설정 요청 중 오류:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.USER.NOT_FOUND));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(error.message));
            }
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * 이메일로 사용자 아이디(username) 찾기
     */
    async findUsername(req, res) {
        try {
            // 새로운 DTO 검증 미들웨어에서 제공하는 검증된 데이터 사용
            const { email } = req.emailDto ? req.emailDto.toPlainObject() : req.query;

            if (!email) {
                return res.status(400).json(ApiResponse.error('이메일을 입력해주세요.'));
            }

            const user = await this.userService.getUserByEmail(email);

            if (!user) {
                return res.status(404).json(ApiResponse.error('해당 이메일로 등록된 사용자가 없습니다.'));
            }

            return res.json(ApiResponse.success({ username: user.username }, '아이디를 찾았습니다.'));
        } catch (error) {
            logger.withContext(req).error('아이디 찾기 중 오류:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('해당 이메일로 등록된 사용자가 없습니다.'));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error(error.message));
            }
            return res.status(500).json(ApiResponse.error('아이디 찾기 중 오류가 발생했습니다.'));
        }
    }
}
