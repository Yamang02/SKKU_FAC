import logger from '../utils/Logger.js';
import { ApiResponse } from '../../domain/common/model/ApiResponse.js';

/**
 * DTO 기반 검증 미들웨어
 * BaseDto를 확장한 DTO 클래스들과 함께 사용하여 요청 데이터를 검증합니다.
 */

/**
 * DTO 클래스와 스키마를 사용하여 검증 미들웨어를 생성합니다.
 * @param {Class} DtoClass - BaseDto를 확장한 DTO 클래스
 * @param {Function} schemaMethod - DTO 클래스의 정적 스키마 메서드
 * @param {Object} options - 검증 옵션
 * @returns {Function} Express 미들웨어 함수
 */
export function validateWithDto(DtoClass, schemaMethod, options = {}) {
    const {
        source = 'body',
        attachDto = true,
        dtoProperty = 'dto',
        validationOptions = {}
    } = options;

    return (req, res, next) => {
        try {
            const dataToValidate = req[source];

            // DTO 인스턴스 생성
            const dto = new DtoClass(dataToValidate);

            // 스키마 메서드가 함수인지 확인
            if (typeof schemaMethod !== 'function') {
                throw new Error('schemaMethod must be a function that returns a Joi schema');
            }

            // 스키마 가져오기
            const schema = schemaMethod();
            if (!schema) {
                throw new Error('Schema method must return a valid Joi schema');
            }

            // DTO의 validateWithSchema 메서드 사용
            const validationResult = dto.validateWithSchema(schema, {
                abortEarly: false,
                allowUnknown: true,
                stripUnknown: true,
                ...validationOptions
            });

            if (!validationResult.isValid) {
                // 검증 실패 로깅
                logger.warn('DTO 검증 실패', {
                    endpoint: req.originalUrl,
                    method: req.method,
                    source,
                    dtoClass: DtoClass.name,
                    schemaMethod: schemaMethod.name,
                    errors: validationResult.errors.map(error => ({
                        field: error.path?.join('.') || error.context?.key,
                        message: error.message,
                        value: error.context?.value
                    })),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });

                // 에러 메시지 생성
                const errorMessage = validationResult.errors
                    .map(error => error.message)
                    .join(', ');

                return res.status(400).json(ApiResponse.error(errorMessage));
            }

            // 검증된 데이터로 교체
            req[source] = validationResult.value;

            // DTO 인스턴스를 요청 객체에 첨부 (선택적)
            if (attachDto) {
                req[dtoProperty] = new DtoClass(validationResult.value);
            }

            // 검증 성공 로깅 (디버그 레벨)
            logger.debug('DTO 검증 성공', {
                endpoint: req.originalUrl,
                method: req.method,
                source,
                dtoClass: DtoClass.name,
                schemaMethod: schemaMethod.name,
                validatedFields: Object.keys(validationResult.value)
            });

            next();
        } catch (validationError) {
            // 검증 과정에서 예외 발생
            logger.error('DTO 검증 미들웨어 오류', {
                error: validationError.message,
                stack: validationError.stack,
                endpoint: req.originalUrl,
                method: req.method,
                source,
                dtoClass: DtoClass?.name,
                schemaMethod: schemaMethod?.name
            });

            return res.status(500).json(ApiResponse.error('서버 내부 오류가 발생했습니다'));
        }
    };
}

/**
 * 여러 검증 조건을 조합하여 사용할 수 있는 고급 검증 미들웨어
 * @param {Array} validationRules - 검증 규칙 배열
 * @returns {Function} Express 미들웨어 함수
 */
export function validateMultiple(validationRules) {
    return async (req, res, next) => {
        try {
            const validationResults = [];
            const attachedDtos = {};

            for (const rule of validationRules) {
                const {
                    DtoClass,
                    schemaMethod,
                    source = 'body',
                    attachDto = true,
                    dtoProperty,
                    validationOptions = {},
                    condition
                } = rule;

                // 조건부 검증 (condition이 있는 경우)
                if (condition && !condition(req)) {
                    continue;
                }

                const dataToValidate = req[source];
                const dto = new DtoClass(dataToValidate);
                const schema = schemaMethod();

                const validationResult = dto.validateWithSchema(schema, {
                    abortEarly: false,
                    allowUnknown: true,
                    stripUnknown: true,
                    ...validationOptions
                });

                if (!validationResult.isValid) {
                    // 첫 번째 검증 실패 시 즉시 응답
                    const errorMessage = validationResult.errors
                        .map(error => error.message)
                        .join(', ');

                    logger.warn('다중 DTO 검증 실패', {
                        endpoint: req.originalUrl,
                        method: req.method,
                        failedRule: {
                            dtoClass: DtoClass.name,
                            schemaMethod: schemaMethod.name,
                            source
                        },
                        errors: validationResult.errors
                    });

                    return res.status(400).json(ApiResponse.error(errorMessage));
                }

                // 검증 성공 시 결과 저장
                validationResults.push({
                    source,
                    value: validationResult.value,
                    dto: new DtoClass(validationResult.value)
                });

                // 검증된 데이터로 교체
                req[source] = validationResult.value;

                // DTO 첨부
                if (attachDto) {
                    const propName = dtoProperty || `${source}Dto`;
                    attachedDtos[propName] = new DtoClass(validationResult.value);
                }
            }

            // 모든 DTO를 요청 객체에 첨부
            Object.assign(req, attachedDtos);

            logger.debug('다중 DTO 검증 성공', {
                endpoint: req.originalUrl,
                method: req.method,
                validatedRules: validationResults.length,
                attachedDtos: Object.keys(attachedDtos)
            });

            next();
        } catch (error) {
            logger.error('다중 DTO 검증 미들웨어 오류', {
                error: error.message,
                stack: error.stack,
                endpoint: req.originalUrl,
                method: req.method
            });

            return res.status(500).json(ApiResponse.error('서버 내부 오류가 발생했습니다'));
        }
    };
}

/**
 * 조건부 검증 미들웨어 생성기
 * 특정 조건에서만 검증을 수행합니다.
 * @param {Function} condition - 검증 조건 함수 (req) => boolean
 * @param {Function} validationMiddleware - 검증 미들웨어
 * @returns {Function} Express 미들웨어 함수
 */
export function validateIf(condition, validationMiddleware) {
    return (req, res, next) => {
        if (condition(req)) {
            return validationMiddleware(req, res, next);
        }
        next();
    };
}

/**
 * 응답 DTO 검증 미들웨어 (개발/테스트 환경용)
 * 응답 데이터가 예상된 형식과 일치하는지 확인합니다.
 * @param {Class} ResponseDtoClass - 응답 DTO 클래스
 * @param {Function} schemaMethod - 응답 스키마 메서드
 * @param {Object} options - 옵션
 * @returns {Function} Express 미들웨어 함수
 */
export function validateResponse(ResponseDtoClass, schemaMethod, options = {}) {
    const {
        enabled = process.env.NODE_ENV !== 'production',
        logOnly = false
    } = options;

    return (req, res, next) => {
        if (!enabled) {
            return next();
        }

        // 원본 json 메서드 저장
        const originalJson = res.json;

        // json 메서드 오버라이드
        res.json = function (data) {
            try {
                // ApiResponse 래퍼 확인
                const responseData = data?.data || data;

                if (responseData) {
                    const responseDto = new ResponseDtoClass(responseData);
                    const schema = schemaMethod();
                    const validationResult = responseDto.validateWithSchema(schema);

                    if (!validationResult.isValid) {
                        const errorMessage = `응답 검증 실패: ${validationResult.errors.map(e => e.message).join(', ')}`;

                        logger.warn('응답 DTO 검증 실패', {
                            endpoint: req.originalUrl,
                            method: req.method,
                            responseClass: ResponseDtoClass.name,
                            schemaMethod: schemaMethod.name,
                            errors: validationResult.errors,
                            responseData
                        });

                        if (!logOnly) {
                            return originalJson.call(this, ApiResponse.error(errorMessage));
                        }
                    } else {
                        logger.debug('응답 DTO 검증 성공', {
                            endpoint: req.originalUrl,
                            method: req.method,
                            responseClass: ResponseDtoClass.name
                        });
                    }
                }
            } catch (error) {
                logger.error('응답 검증 중 오류', {
                    error: error.message,
                    endpoint: req.originalUrl,
                    method: req.method
                });

                if (!logOnly) {
                    return originalJson.call(this, ApiResponse.error('응답 검증 오류'));
                }
            }

            // 원본 메서드 호출
            return originalJson.call(this, data);
        };

        next();
    };
}

/**
 * 파일 업로드 검증 미들웨어
 * multer와 함께 사용하여 업로드된 파일을 검증합니다.
 * @param {Object} fileValidationRules - 파일 검증 규칙
 * @returns {Function} Express 미들웨어 함수
 */
export function validateFiles(fileValidationRules = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB
        allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxFiles = 10,
        required = false
    } = fileValidationRules;

    return (req, res, next) => {
        try {
            const files = req.files || [];
            const file = req.file;

            // 단일 파일 처리
            if (file) {
                const validationResult = validateSingleFile(file, { maxSize, allowedMimeTypes });
                if (!validationResult.isValid) {
                    return res.status(400).json(ApiResponse.error(validationResult.error));
                }
            }

            // 다중 파일 처리
            if (files.length > 0) {
                if (files.length > maxFiles) {
                    return res.status(400).json(ApiResponse.error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다`));
                }

                for (const uploadedFile of files) {
                    const validationResult = validateSingleFile(uploadedFile, { maxSize, allowedMimeTypes });
                    if (!validationResult.isValid) {
                        return res.status(400).json(ApiResponse.error(validationResult.error));
                    }
                }
            }

            // 필수 파일 검증
            if (required && !file && files.length === 0) {
                return res.status(400).json(ApiResponse.error('파일 업로드가 필요합니다'));
            }

            logger.debug('파일 검증 성공', {
                endpoint: req.originalUrl,
                method: req.method,
                fileCount: files.length + (file ? 1 : 0),
                totalSize: [...files, file].filter(Boolean).reduce((sum, f) => sum + f.size, 0)
            });

            next();
        } catch (error) {
            logger.error('파일 검증 미들웨어 오류', {
                error: error.message,
                stack: error.stack,
                endpoint: req.originalUrl,
                method: req.method
            });

            return res.status(500).json(ApiResponse.error('파일 검증 중 오류가 발생했습니다'));
        }
    };
}

/**
 * 단일 파일 검증 헬퍼 함수
 * @param {Object} file - multer 파일 객체
 * @param {Object} rules - 검증 규칙
 * @returns {Object} 검증 결과
 */
function validateSingleFile(file, rules) {
    const { maxSize, allowedMimeTypes } = rules;

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 허용됩니다`
        };
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
            isValid: false,
            error: `지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedMimeTypes.join(', ')}`
        };
    }

    return { isValid: true };
}

export default {
    validateWithDto,
    validateMultiple,
    validateIf,
    validateResponse,
    validateFiles
};
