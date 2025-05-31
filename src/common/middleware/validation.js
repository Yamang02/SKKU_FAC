import Joi from 'joi';
import logger from '../utils/Logger.js';
import { ApiResponse } from '../../domain/common/model/ApiResponse.js';

/**
 * 사용자 입력 검증 스키마 정의
 */
export const UserValidationSchemas = {
    // 사용자 등록 검증 스키마
    register: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.alphanum': '사용자명은 영문자와 숫자만 포함할 수 있습니다',
                'string.min': '사용자명은 최소 3자 이상이어야 합니다',
                'string.max': '사용자명은 최대 30자까지 가능합니다',
                'any.required': '사용자명은 필수 입력 항목입니다'
            }),

        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 최대 50자까지 가능합니다',
                'any.required': '이름은 필수 입력 항목입니다'
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            }),

        password: Joi.string()
            .min(1)
            .max(128)
            .required()
            .messages({
                'string.min': '비밀번호를 입력해주세요',
                'string.max': '비밀번호는 최대 128자까지 가능합니다',
                'any.required': '비밀번호는 필수 입력 항목입니다'
            }),

        role: Joi.string()
            .valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER')
            .default('SKKU_MEMBER')
            .messages({
                'any.only': '유효하지 않은 역할입니다'
            }),

        department: Joi.string()
            .max(100)
            .allow('')
            .when('role', {
                is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                then: Joi.string().optional(),
                otherwise: Joi.forbidden()
            })
            .messages({
                'string.max': '학과명은 최대 100자까지 가능합니다',
                'any.unknown': '외부 사용자는 학과 정보를 입력할 수 없습니다'
            }),

        affiliation: Joi.string()
            .max(100)
            .when('role', {
                is: 'EXTERNAL_MEMBER',
                then: Joi.string().required().min(1),
                otherwise: Joi.string().allow('', null).optional()
            })
            .messages({
                'string.max': '소속은 최대 100자까지 가능합니다',
                'string.min': '외부 사용자는 소속을 입력해야 합니다',
                'any.required': '외부 사용자는 소속을 입력해야 합니다'
            }),

        studentYear: Joi.string()
            .pattern(/^[0-9]{2}$/)
            .allow('', null)
            .when('role', {
                is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                then: Joi.string().optional(),
                otherwise: Joi.forbidden()
            })
            .messages({
                'string.pattern.base': '학번은 2자리 숫자여야 합니다 (예: 00, 23)',
                'string.empty': '학번을 입력해주세요',
                'any.unknown': '외부 사용자는 학번 정보를 입력할 수 없습니다'
            }),

        isClubMember: Joi.boolean()
            .default(false)
            .when('role', {
                is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                then: Joi.boolean().optional(),
                otherwise: Joi.forbidden()
            })
            .messages({
                'any.unknown': '외부 사용자는 동아리 회원 정보를 설정할 수 없습니다'
            })
    }),

    // 로그인 검증 스키마
    login: Joi.object({
        username: Joi.string()
            .required()
            .messages({
                'any.required': '사용자명을 입력해주세요'
            }),

        password: Joi.string()
            .required()
            .messages({
                'any.required': '비밀번호를 입력해주세요'
            })
    }),

    // 프로필 수정 검증 스키마
    updateProfile: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 최대 50자까지 가능합니다'
            }),

        department: Joi.string()
            .max(100)
            .allow('')
            .optional()
            .messages({
                'string.max': '학과명은 최대 100자까지 가능합니다'
            }),

        affiliation: Joi.string()
            .max(100)
            .allow('', null)
            .optional()
            .messages({
                'string.max': '소속은 최대 100자까지 가능합니다'
            }),

        studentYear: Joi.string()
            .pattern(/^[0-9]{2}$/)
            .allow('', null)
            .optional()
            .messages({
                'string.pattern.base': '학번은 2자리 숫자여야 합니다 (예: 00, 23)',
                'string.empty': '학번을 입력해주세요'
            }),

        newPassword: Joi.string()
            .min(1)
            .max(128)
            .optional()
            .messages({
                'string.min': '새 비밀번호를 입력해주세요',
                'string.max': '새 비밀번호는 최대 128자까지 가능합니다'
            }),

        confirmPassword: Joi.string()
            .when('newPassword', {
                is: Joi.exist(),
                then: Joi.required().valid(Joi.ref('newPassword')),
                otherwise: Joi.optional()
            })
            .messages({
                'any.required': '비밀번호 확인을 입력해주세요',
                'any.only': '비밀번호가 일치하지 않습니다'
            })
    }),

    // 이메일 검증 스키마
    email: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            })
    }),

    // 비밀번호 재설정 검증 스키마
    resetPassword: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            })
    })
};

/**
 * 검증 미들웨어 생성 함수
 * @param {Joi.ObjectSchema} schema - 검증할 Joi 스키마
 * @param {string} source - 검증할 데이터 소스 ('body', 'query', 'params')
 * @returns {Function} Express 미들웨어 함수
 */
export function validateInput(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const dataToValidate = req[source];

            // Joi 검증 실행
            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false, // 모든 에러를 수집
                allowUnknown: true, // 정의되지 않은 필드 허용
                stripUnknown: true  // 정의되지 않은 필드 제거
            });

            if (error) {
                // 검증 실패 로깅
                logger.warn('입력 검증 실패', {
                    endpoint: req.originalUrl,
                    method: req.method,
                    source,
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value
                    })),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });

                // 기존 API 응답 형식에 맞게 에러 응답 생성
                const errorMessage = error.details.map(detail => detail.message).join(', ');
                return res.status(400).json(ApiResponse.error(errorMessage));
            }

            // 검증된 데이터로 교체
            req[source] = value;

            // 검증 성공 로깅 (디버그 레벨)
            logger.debug('입력 검증 성공', {
                endpoint: req.originalUrl,
                method: req.method,
                source,
                validatedFields: Object.keys(value)
            });

            next();
        } catch (validationError) {
            // 검증 과정에서 예외 발생
            logger.error('검증 미들웨어 오류', {
                error: validationError.message,
                stack: validationError.stack,
                endpoint: req.originalUrl,
                method: req.method,
                source
            });

            return res.status(500).json(ApiResponse.error('서버 내부 오류가 발생했습니다'));
        }
    };
}

/**
 * 사용자 관련 검증 미들웨어들
 */
export const UserValidationMiddleware = {
    // 사용자 등록 검증
    validateRegister: validateInput(UserValidationSchemas.register, 'body'),

    // 로그인 검증
    validateLogin: validateInput(UserValidationSchemas.login, 'body'),

    // 프로필 수정 검증
    validateUpdateProfile: validateInput(UserValidationSchemas.updateProfile, 'body'),

    // 이메일 검증 (쿼리 파라미터)
    validateEmailQuery: validateInput(UserValidationSchemas.email, 'query'),

    // 비밀번호 재설정 검증
    validateResetPassword: validateInput(UserValidationSchemas.resetPassword, 'body')
};

/**
 * 커스텀 검증 함수들
 */
export const CustomValidators = {
    /**
     * 성균관대학교 이메일 도메인 검증 (선택적 사용)
     * @param {string} email - 검증할 이메일
     * @returns {boolean} 검증 결과
     */
    isSKKUEmail(email) {
        const skkuDomains = ['@skku.edu', '@g.skku.edu'];
        return skkuDomains.some(domain => email.toLowerCase().endsWith(domain));
    },

    /**
     * 학번 형식 검증 (2자리 숫자)
     * @param {string} studentYear - 검증할 학번
     * @returns {boolean} 검증 결과
     */
    isValidStudentYear(studentYear) {
        if (!studentYear) return true; // 선택적 필드이므로 빈 값 허용
        return /^[0-9]{2}$/.test(studentYear);
    },

    /**
     * 비밀번호 기본 검증 (길이만 확인)
     * @param {string} password - 검증할 비밀번호
     * @returns {Object} 검증 결과
     */
    checkPasswordLength(password) {
        const isValid = password && password.length >= 1 && password.length <= 128;
        return {
            isValid,
            length: password ? password.length : 0,
            message: isValid ? '유효한 비밀번호입니다' : '비밀번호는 1자 이상 128자 이하여야 합니다'
        };
    },

    /**
     * 역할별 필수 필드 검증
     * @param {Object} userData - 사용자 데이터
     * @returns {Object} 검증 결과
     */
    validateRoleSpecificFields(userData) {
        const { role, affiliation, department, studentYear } = userData;
        const errors = [];

        if (role === 'EXTERNAL_MEMBER') {
            // 외부 사용자는 소속 필수
            if (!affiliation || affiliation.trim() === '') {
                errors.push('외부 사용자는 소속을 입력해야 합니다');
            }
            // 외부 사용자는 SKKU 관련 필드 금지
            if (department) {
                errors.push('외부 사용자는 학과 정보를 입력할 수 없습니다');
            }
            if (studentYear) {
                errors.push('외부 사용자는 학번 정보를 입력할 수 없습니다');
            }
        } else if (role === 'SKKU_MEMBER' || role === 'ADMIN') {
            // SKKU 사용자는 소속 선택적 (null 허용)
            // 학번이 있다면 형식 검증
            if (studentYear && !this.isValidStudentYear(studentYear)) {
                errors.push('학번은 2자리 숫자여야 합니다 (예: 00, 23)');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * 사용자 등록 데이터 전체 검증
     * @param {Object} userData - 사용자 등록 데이터
     * @returns {Object} 검증 결과
     */
    validateUserRegistration(userData) {
        const roleValidation = this.validateRoleSpecificFields(userData);
        const passwordValidation = this.checkPasswordLength(userData.password);

        const allErrors = [];

        if (!roleValidation.isValid) {
            allErrors.push(...roleValidation.errors);
        }

        if (!passwordValidation.isValid) {
            allErrors.push(passwordValidation.message);
        }

        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }
};

export default {
    UserValidationSchemas,
    validateInput,
    UserValidationMiddleware,
    CustomValidators
};
