import Joi from 'joi';
import BaseDto from '../../../common/model/BaseDto.js';

/**
 * 사용자 요청 DTO
 * 사용자 관련 요청 데이터를 검증하고 변환합니다.
 */
export default class UserRequestDto extends BaseDto {
    constructor(data = {}) {
        super(data);

        // 기본값 설정
        this.id = this.id || null;
        this.role = this.role || 'SKKU_MEMBER';
        this.isClubMember = this.isClubMember || false;
        this.emailVerified = this.emailVerified || false;
        this.skkuUserId = this.skkuUserId || null;
        this.externalUserId = this.externalUserId || null;
        this.emailVerificationToken = this.emailVerificationToken || null;
        this.emailVerificationTokenExpiry = this.emailVerificationTokenExpiry || null;
    }

    /**
     * 사용자 등록용 검증 스키마를 반환합니다.
     * @returns {Object} Joi 검증 스키마
     */
    getValidationSchema() {
        return UserRequestDto.getRegisterSchema();
    }

    /**
     * 사용자 등록용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getRegisterSchema() {
        return Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required().messages({
                'string.alphanum': '사용자명은 영문자와 숫자만 포함할 수 있습니다',
                'string.min': '사용자명은 최소 3자 이상이어야 합니다',
                'string.max': '사용자명은 최대 30자까지 가능합니다',
                'string.empty': '사용자명을 입력해주세요',
                'any.required': '사용자명은 필수 입력 항목입니다'
            }),

            name: Joi.string().min(2).max(50).required().messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 최대 50자까지 가능합니다',
                'any.required': '이름은 필수 입력 항목입니다'
            }),

            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            }),

            password: Joi.string().min(1).max(128).required().messages({
                'string.min': '비밀번호를 입력해주세요',
                'string.max': '비밀번호는 최대 128자까지 가능합니다',
                'string.empty': '비밀번호를 입력해주세요',
                'any.required': '비밀번호는 필수 입력 항목입니다'
            }),

            confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
                'any.required': '비밀번호 확인을 입력해주세요',
                'any.only': '비밀번호가 일치하지 않습니다'
            }),

            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').default('SKKU_MEMBER').messages({
                'any.only': '유효하지 않은 역할입니다'
            }),

            department: Joi.string()
                .max(100)
                .when('role', {
                    is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                    then: Joi.string().required().min(1).messages({
                        'string.min': 'SKKU 사용자는 학과를 입력해야 합니다',
                        'any.required': 'SKKU 사용자는 학과를 입력해야 합니다'
                    }),
                    otherwise: Joi.forbidden().messages({
                        'any.unknown': '외부 사용자는 학과 정보를 입력할 수 없습니다'
                    })
                })
                .messages({
                    'string.max': '학과명은 최대 100자까지 가능합니다'
                }),

            affiliation: Joi.string()
                .max(100)
                .when('role', {
                    is: 'EXTERNAL_MEMBER',
                    then: Joi.string().required().min(1).messages({
                        'string.min': '외부 사용자는 소속을 입력해야 합니다',
                        'any.required': '외부 사용자는 소속을 입력해야 합니다'
                    }),
                    otherwise: Joi.string().allow('', null).optional()
                })
                .messages({
                    'string.max': '소속은 최대 100자까지 가능합니다'
                }),

            studentYear: Joi.string()
                .pattern(/^[0-9]{2}$/)
                .when('role', {
                    is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                    then: Joi.string().required().messages({
                        'string.pattern.base': '학번은 2자리 숫자여야 합니다 (예: 00, 23)',
                        'any.required': 'SKKU 사용자는 학번을 입력해야 합니다'
                    }),
                    otherwise: Joi.forbidden().messages({
                        'any.unknown': '외부 사용자는 학번 정보를 입력할 수 없습니다'
                    })
                }),

            isClubMember: Joi.boolean()
                .default(false)
                .when('role', {
                    is: Joi.valid('SKKU_MEMBER', 'ADMIN'),
                    then: Joi.boolean().optional(),
                    otherwise: Joi.forbidden().messages({
                        'any.unknown': '외부 사용자는 동아리 회원 정보를 설정할 수 없습니다'
                    })
                }),

            // 선택적 필드들 - id 필드 제거 (회원가입 시 서버에서 자동 생성)
            skkuUserId: Joi.number().integer().positive().allow(null).optional(),
            externalUserId: Joi.number().integer().positive().allow(null).optional(),
            emailVerified: Joi.boolean().default(false).optional(),
            emailVerificationToken: Joi.string().allow(null).optional(),
            emailVerificationTokenExpiry: Joi.date().allow(null).optional()
        });
    }

    /**
     * 로그인용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getLoginSchema() {
        return Joi.object({
            username: Joi.string().required().messages({
                'string.empty': '사용자명을 입력해주세요',
                'any.required': '사용자명을 입력해주세요'
            }),

            password: Joi.string().required().messages({
                'string.empty': '비밀번호를 입력해주세요',
                'any.required': '비밀번호를 입력해주세요'
            })
        });
    }

    /**
     * 프로필 수정용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getUpdateProfileSchema() {
        return Joi.object({
            name: Joi.string().min(2).max(50).optional().messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 최대 50자까지 가능합니다'
            }),

            department: Joi.string().max(100).allow('').optional().messages({
                'string.max': '학과명은 최대 100자까지 가능합니다'
            }),

            affiliation: Joi.string().max(100).allow('', null).optional().messages({
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

            newPassword: Joi.string().min(1).max(128).optional().messages({
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
        });
    }

    /**
     * 이메일 검증용 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getEmailSchema() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            })
        });
    }

    /**
     * 비밀번호 재설정용 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getResetPasswordSchema() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요',
                'any.required': '이메일은 필수 입력 항목입니다'
            })
        });
    }

    /**
     * 특정 스키마로 검증하는 메서드
     * @param {Object|string} schemaOrType - Joi 스키마 객체 또는 스키마 타입 문자열
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과
     */
    validateWithSchema(schemaOrType, options = {}) {
        let schema;

        // 첫 번째 매개변수가 Joi 스키마 객체인 경우 (BaseDto 호환성)
        if (schemaOrType && typeof schemaOrType === 'object' && schemaOrType.validate) {
            schema = schemaOrType;
        } else if (typeof schemaOrType === 'string') {
            // 문자열인 경우 기존 로직 사용
            switch (schemaOrType) {
                case 'register':
                    schema = UserRequestDto.getRegisterSchema();
                    break;
                case 'login':
                    schema = UserRequestDto.getLoginSchema();
                    break;
                case 'updateProfile':
                    schema = UserRequestDto.getUpdateProfileSchema();
                    break;
                case 'email':
                    schema = UserRequestDto.getEmailSchema();
                    break;
                case 'resetPassword':
                    schema = UserRequestDto.getResetPasswordSchema();
                    break;
                default:
                    schema = this.getValidationSchema();
            }
        } else {
            // 기본값
            schema = this.getValidationSchema();
        }

        const { error, value } = schema.validate(this.toPlainObject(), {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
            ...options
        });

        this._isValid = !error;
        this._validationErrors = error ? error.details : [];

        return {
            isValid: this._isValid,
            errors: this._validationErrors,
            value: value
        };
    }
}
