/**
 * 모든 DTO의 기본 클래스
 * 공통 기능과 검증 로직을 제공합니다.
 */
export default class BaseDto {
    constructor(data = {}) {
        this._originalData = { ...data };
        this._validationSchema = null;
        this._validationErrors = [];
        this._isValid = true;

        // 자동으로 데이터 할당
        this._assignData(data);
    }

    /**
     * 데이터를 DTO 속성에 할당
     * @param {Object} data - 할당할 데이터
     * @private
     */
    _assignData(data) {
        // 스키마가 있는 경우 검증을 통해 허용된 필드만 할당
        const schema = this.getValidationSchema();
        if (schema) {
            try {
                // 검증을 통해 허용된 필드만 추출
                const { value } = schema.validate(data, {
                    allowUnknown: true,
                    stripUnknown: true
                });
                Object.assign(this, value);
            } catch (error) {
                // 검증 실패 시 모든 데이터 할당
                Object.assign(this, data);
            }
        } else {
            // 스키마가 없는 경우 모든 데이터 할당
            Object.assign(this, data);
        }
    }

    /**
     * 검증 스키마를 반환합니다.
     * 하위 클래스에서 반드시 구현해야 합니다.
     * @returns {Object|null} Joi 검증 스키마
     */
    getValidationSchema() {
        return this._validationSchema;
    }

    /**
     * 검증 스키마를 설정합니다.
     * @param {Object} schema - Joi 검증 스키마
     */
    setValidationSchema(schema) {
        this._validationSchema = schema;
    }

    /**
     * DTO 데이터를 검증합니다.
     * @param {Object} options - Joi 검증 옵션
     * @returns {Object} 검증 결과 { isValid, errors, value }
     */
    validate(options = {}) {
        const schema = this.getValidationSchema();
        if (!schema) {
            return {
                isValid: true,
                errors: [],
                value: this.toPlainObject()
            };
        }

        const defaultOptions = {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        };

        const validationOptions = { ...defaultOptions, ...options };
        const { error, value } = schema.validate(this.toPlainObject(), validationOptions);

        this._isValid = !error;
        this._validationErrors = error ? error.details : [];

        return {
            isValid: this._isValid,
            errors: this._validationErrors,
            value: value
        };
    }

    /**
     * 검증 상태를 반환합니다.
     * @returns {boolean} 검증 통과 여부
     */
    isValid() {
        return this._isValid;
    }

    /**
     * 검증 에러를 반환합니다.
     * @returns {Array} 검증 에러 배열
     */
    getValidationErrors() {
        return this._validationErrors;
    }

    /**
     * 검증 에러 메시지를 문자열로 반환합니다.
     * @param {string} separator - 에러 메시지 구분자
     * @returns {string} 에러 메시지 문자열
     */
    getValidationErrorMessages(separator = ', ') {
        return this._validationErrors
            .map(error => error.message)
            .join(separator);
    }

    /**
     * 특정 스키마로 검증하는 메서드
     * @param {Object} schema - Joi 검증 스키마
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과 { isValid, errors, value }
     */
    validateWithSchema(schema, options = {}) {
        if (!schema) {
            return {
                isValid: true,
                errors: [],
                value: this.toPlainObject()
            };
        }

        const defaultOptions = {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        };

        const validationOptions = { ...defaultOptions, ...options };
        const { error, value } = schema.validate(this.toPlainObject(), validationOptions);

        this._isValid = !error;
        this._validationErrors = error ? error.details : [];

        return {
            isValid: this._isValid,
            errors: this._validationErrors,
            value: value
        };
    }

    /**
     * DTO를 일반 객체로 변환합니다.
     * @param {boolean} includePrivate - private 속성 포함 여부
     * @returns {Object} 일반 객체
     */
    toPlainObject(includePrivate = false) {
        const result = {};

        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // private 속성 제외 (언더스코어로 시작하는 속성)
                if (!includePrivate && key.startsWith('_')) {
                    continue;
                }

                const value = this[key];

                // 함수 제외
                if (typeof value === 'function') {
                    continue;
                }

                // 중첩된 DTO 처리
                if (value instanceof BaseDto) {
                    result[key] = value.toPlainObject(includePrivate);
                } else if (Array.isArray(value)) {
                    result[key] = value.map(item =>
                        item instanceof BaseDto ? item.toPlainObject(includePrivate) : item
                    );
                } else {
                    result[key] = value;
                }
            }
        }

        return result;
    }

    /**
     * DTO를 JSON 문자열로 변환합니다.
     * @param {boolean} includePrivate - private 속성 포함 여부
     * @returns {string} JSON 문자열
     */
    toJSON(includePrivate = false) {
        return JSON.stringify(this.toPlainObject(includePrivate), null, 2);
    }

    /**
     * 원본 데이터를 반환합니다.
     * @returns {Object} 원본 데이터
     */
    getOriginalData() {
        return { ...this._originalData };
    }

    /**
     * 특정 필드만 추출하여 새로운 객체를 반환합니다.
     * @param {Array<string>} fields - 추출할 필드 배열
     * @returns {Object} 추출된 필드들로 구성된 객체
     */
    pick(fields) {
        const result = {};
        const plainObject = this.toPlainObject();

        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(plainObject, field)) {
                result[field] = plainObject[field];
            }
        }

        return result;
    }

    /**
     * 특정 필드를 제외하고 새로운 객체를 반환합니다.
     * @param {Array<string>} fields - 제외할 필드 배열
     * @returns {Object} 제외된 필드들을 뺀 객체
     */
    omit(fields) {
        const result = {};
        const plainObject = this.toPlainObject();
        const excludeSet = new Set(fields);

        for (const key in plainObject) {
            if (!excludeSet.has(key)) {
                result[key] = plainObject[key];
            }
        }

        return result;
    }

    /**
     * 다른 DTO나 객체와 병합합니다.
     * @param {Object|BaseDto} other - 병합할 객체
     * @returns {BaseDto} 새로운 DTO 인스턴스
     */
    merge(other) {
        const otherData = other instanceof BaseDto ? other.toPlainObject() : other;
        const mergedData = { ...this.toPlainObject(), ...otherData };

        return new this.constructor(mergedData);
    }

    /**
     * DTO 복사본을 생성합니다.
     * @returns {BaseDto} 복사된 DTO 인스턴스
     */
    clone() {
        return new this.constructor(this.toPlainObject(true));
    }

    /**
     * 정적 메서드: 객체에서 DTO 인스턴스를 생성합니다.
     * @param {Object} data - 변환할 데이터
     * @returns {BaseDto} DTO 인스턴스
     */
    static fromObject(data) {
        return new this(data);
    }

    /**
     * 정적 메서드: 배열에서 DTO 인스턴스 배열을 생성합니다.
     * @param {Array} dataArray - 변환할 데이터 배열
     * @returns {Array<BaseDto>} DTO 인스턴스 배열
     */
    static fromArray(dataArray) {
        return dataArray.map(data => new this(data));
    }
}
