import { ApiResponse } from '#domain/common/model/ApiResponse.js';
import UserRequestDto from '#domain/user/model/dto/UserRequestDto.js';
import UserResponseDto from '#domain/user/model/dto/UserResponseDto.js';
import {
    UserNotFoundError,
    UserValidationError,
    UserEmailDuplicateError,
    UserUsernameDuplicateError
} from '#common/error/UserError.js';
import logger from '#common/utils/Logger.js';

/**
 * User Admin API Controller
 * 사용자 관리를 위한 RESTful API 엔드포인트 제공
 */
export default class UserAdminApiController {
    static dependencies = ['UserAdminService'];

    constructor(userAdminService) {
        this.userAdminService = userAdminService;
    }

    /**
     * GET /api/admin/users
     * 사용자 목록 조회 (페이지네이션, 필터링, 정렬 지원)
     */
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc', role, status, search } = req.query;

            const options = {
                page: Math.max(1, parseInt(page)),
                limit: Math.min(100, Math.max(1, parseInt(limit))),
                sortBy,
                sortOrder: sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC',
                role,
                status,
                search
            };

            const result = await this.userAdminService.getUserList(options);
            return res.json(ApiResponse.success(result, 'Users retrieved successfully'));

        } catch (error) {
            logger.withContext(req).error('Error getting users:', error);
            return res.status(500).json(ApiResponse.error('Failed to get users'));
        }
    }

    /**
     * GET /api/admin/users/:id
     * 특정 사용자 상세 정보 조회
     */
    async getUser(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid user ID'));
            }

            const user = await this.userAdminService.getUserDetail(parseInt(id));

            if (!user) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }

            return res.json(ApiResponse.success(user, 'User retrieved successfully'));

        } catch (error) {
            logger.withContext(req).error('Error getting user:', error);
            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to get user'));
        }
    }

    /**
     * POST /api/admin/users
     * 새 사용자 생성
     */
    async createUser(req, res) {
        try {
            const userDto = new UserRequestDto(req.body);

            // DTO 유효성 검사
            const validationResult = userDto.validateWithSchema(UserRequestDto.getRegisterSchema());
            if (validationResult.error) {
                return res.status(400).json(ApiResponse.error(validationResult.error.details[0].message));
            }

            const newUser = await this.userAdminService.createUser(userDto);
            const userResponseDto = new UserResponseDto(newUser);

            return res.status(201).json(ApiResponse.success(userResponseDto, 'User created successfully'));

        } catch (error) {
            logger.withContext(req).error('Error creating user:', error);

            if (error instanceof UserEmailDuplicateError) {
                return res.status(409).json(ApiResponse.error('Email already exists'));
            } else if (error instanceof UserUsernameDuplicateError) {
                return res.status(409).json(ApiResponse.error('Username already exists'));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error('Validation failed'));
            }
            return res.status(500).json(ApiResponse.error('Failed to create user'));
        }
    }

    /**
     * PUT /api/admin/users/:id
     * 사용자 정보 업데이트
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid user ID'));
            }

            const userDto = new UserRequestDto(req.body);

            // DTO 유효성 검사
            const validationResult = userDto.validateWithSchema(UserRequestDto.getUpdateProfileSchema());
            if (validationResult.error) {
                return res.status(400).json(ApiResponse.error(validationResult.error.details[0].message));
            }

            const updatedUser = await this.userAdminService.updateUser(parseInt(id), userDto);

            if (!updatedUser) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }

            const userResponseDto = new UserResponseDto(updatedUser);
            return res.json(ApiResponse.success(userResponseDto, 'User updated successfully'));

        } catch (error) {
            logger.withContext(req).error('Error updating user:', error);

            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('User not found'));
            } else if (error instanceof UserValidationError) {
                return res.status(400).json(ApiResponse.error('Validation failed'));
            }
            return res.status(500).json(ApiResponse.error('Failed to update user'));
        }
    }

    /**
     * DELETE /api/admin/users/:id
     * 사용자 삭제
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid user ID'));
            }

            const deleted = await this.userAdminService.deleteUser(parseInt(id));

            if (!deleted) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }

            return res.json(ApiResponse.success(null, 'User deleted successfully'));

        } catch (error) {
            logger.withContext(req).error('Error deleting user:', error);

            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to delete user'));
        }
    }

    /**
     * PUT /api/admin/users/:id/role
     * 사용자 역할 업데이트
     */
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid user ID'));
            }

            const validRoles = ['ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER'];
            if (!role || !validRoles.includes(role)) {
                return res.status(400).json(ApiResponse.error('Invalid role'));
            }

            const updatedUser = await this.userAdminService.updateUserRole(parseInt(id), role);

            if (!updatedUser) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }

            const userResponseDto = new UserResponseDto(updatedUser);
            return res.json(ApiResponse.success(userResponseDto, 'User role updated successfully'));

        } catch (error) {
            logger.withContext(req).error('Error updating user role:', error);

            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to update user role'));
        }
    }

    /**
     * POST /api/admin/users/:id/reset-password
     * 사용자 비밀번호 초기화
     */
    async resetUserPassword(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid user ID'));
            }

            const result = await this.userAdminService.resetUserPassword(parseInt(id));

            if (!result) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }

            return res.json(ApiResponse.success(result, 'Password reset successfully'));

        } catch (error) {
            logger.withContext(req).error('Error resetting user password:', error);

            if (error instanceof UserNotFoundError) {
                return res.status(404).json(ApiResponse.error('User not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to reset password'));
        }
    }

    /**
     * GET /api/admin/users/stats
     * 사용자 통계 정보 조회
     */
    async getUserStats(req, res) {
        try {
            const stats = await this.userAdminService.getUserStats();
            return res.json(ApiResponse.success(stats, 'User statistics retrieved successfully'));

        } catch (error) {
            logger.withContext(req).error('Error getting user stats:', error);
            return res.status(500).json(ApiResponse.error('Failed to get user statistics'));
        }
    }
}
