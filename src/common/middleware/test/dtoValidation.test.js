import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { validateWithDto, validateMultiple, validateIf } from '../dtoValidation.js';
import UserRequestDto from '../../../domain/user/model/dto/UserRequestDto.js';
import { ApiResponse } from '../../../domain/common/model/ApiResponse.js';

// Mock logger
jest.mock('../../utils/Logger.js', () => ({
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
}));

describe('DTO Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
            params: {},
            originalUrl: '/test',
            method: 'POST',
            get: jest.fn().mockReturnValue('test-agent'),
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('validateWithDto', () => {
        it('should validate valid data and attach DTO to request', async () => {
            // Arrange
            const validData = {
                username: 'testuser',
                password: 'password123'
            };
            req.body = validData;

            const middleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.loginSchema,
                { source: 'body', dtoProperty: 'userDto' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.userDto).toBeInstanceOf(UserRequestDto);
            expect(req.userDto.username).toBe('testuser');
            expect(req.userDto.password).toBe('password123');
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 400 error for invalid data', async () => {
            // Arrange
            const invalidData = {
                username: '', // 빈 사용자명
                password: ''  // 빈 비밀번호
            };
            req.body = invalidData;

            const middleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.loginSchema,
                { source: 'body', dtoProperty: 'userDto' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('사용자명')
                })
            );
        });

        it('should validate query parameters when source is query', async () => {
            // Arrange
            const validQuery = {
                email: 'test@example.com'
            };
            req.query = validQuery;

            const middleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.emailSchema,
                { source: 'query', dtoProperty: 'emailDto' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.emailDto).toBeInstanceOf(UserRequestDto);
            expect(req.emailDto.email).toBe('test@example.com');
        });

        it('should handle validation errors gracefully', async () => {
            // Arrange
            const invalidSchema = () => {
                throw new Error('Schema error');
            };
            req.body = { test: 'data' };

            const middleware = validateWithDto(
                UserRequestDto,
                invalidSchema,
                { source: 'body' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: '서버 내부 오류가 발생했습니다'
                })
            );
        });
    });

    describe('validateMultiple', () => {
        it('should validate multiple rules successfully', async () => {
            // Arrange
            const validData = {
                username: 'testuser',
                password: 'password123'
            };
            req.body = validData;

            const rules = [
                {
                    DtoClass: UserRequestDto,
                    schemaMethod: UserRequestDto.loginSchema,
                    source: 'body',
                    dtoProperty: 'userDto'
                }
            ];

            const middleware = validateMultiple(rules);

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.userDto).toBeInstanceOf(UserRequestDto);
        });

        it('should fail on first validation error', async () => {
            // Arrange
            const invalidData = {
                username: '', // 빈 사용자명
                password: ''  // 빈 비밀번호
            };
            req.body = invalidData;

            const rules = [
                {
                    DtoClass: UserRequestDto,
                    schemaMethod: UserRequestDto.loginSchema,
                    source: 'body',
                    dtoProperty: 'userDto'
                }
            ];

            const middleware = validateMultiple(rules);

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should skip validation when condition is false', async () => {
            // Arrange
            req.body = { test: 'data' };
            req.user = { role: 'USER' }; // 관리자가 아님

            const rules = [
                {
                    DtoClass: UserRequestDto,
                    schemaMethod: UserRequestDto.loginSchema,
                    source: 'body',
                    condition: (req) => req.user && req.user.role === 'ADMIN'
                }
            ];

            const middleware = validateMultiple(rules);

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.userDto).toBeUndefined();
        });
    });

    describe('validateIf', () => {
        it('should validate when condition is true', async () => {
            // Arrange
            req.body = {
                username: 'testuser',
                password: 'password123'
            };
            req.user = { id: 1 }; // 인증된 사용자

            const baseMiddleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.loginSchema,
                { source: 'body', dtoProperty: 'userDto' }
            );

            const middleware = validateIf(
                (req) => req.user && req.user.id,
                baseMiddleware
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.userDto).toBeInstanceOf(UserRequestDto);
        });

        it('should skip validation when condition is false', async () => {
            // Arrange
            req.body = { test: 'data' };
            // req.user는 undefined (인증되지 않은 사용자)

            const baseMiddleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.loginSchema,
                { source: 'body', dtoProperty: 'userDto' }
            );

            const middleware = validateIf(
                (req) => req.user && req.user.id,
                baseMiddleware
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.userDto).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing schema method', async () => {
            // Arrange
            req.body = { test: 'data' };

            const middleware = validateWithDto(
                UserRequestDto,
                null, // 잘못된 스키마 메서드
                { source: 'body' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle DTO instantiation errors', async () => {
            // Arrange
            req.body = { test: 'data' };

            // 잘못된 DTO 클래스 (생성자에서 에러 발생)
            class ErrorDto {
                constructor() {
                    throw new Error('DTO creation error');
                }
            }

            const middleware = validateWithDto(
                ErrorDto,
                () => ({ validate: () => ({ error: null, value: {} }) }),
                { source: 'body' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Integration with ApiResponse', () => {
        it('should return properly formatted error response', async () => {
            // Arrange
            const invalidData = {
                username: '', // 빈 사용자명
                password: ''  // 빈 비밀번호
            };
            req.body = invalidData;

            const middleware = validateWithDto(
                UserRequestDto,
                UserRequestDto.loginSchema,
                { source: 'body' }
            );

            // Act
            await middleware(req, res, next);

            // Assert
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.any(String),
                    data: null,
                    timestamp: expect.any(String)
                })
            );
        });
    });
});
