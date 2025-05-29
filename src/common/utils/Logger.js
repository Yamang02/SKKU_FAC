import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { infrastructureConfig } from '../../config/infrastructure.js';
import fs from 'fs';
import path from 'path';

class WinstonLogger {
    constructor() {
        this.environment = infrastructureConfig.environment;
        this.isDevelopment = this.environment === 'development' || this.environment === 'local';
        this.isTest = this.environment === 'test';
        this.isStaging = this.environment === 'staging';
        this.isProduction = process.env.NODE_ENV === 'production';
        this.isRailway = this.detectRailwayEnvironment();
        this.logDir = path.join(process.cwd(), 'logs');

        // Railway가 아닌 환경에서만 로그 디렉토리 생성 시도
        if (!this.isDevelopment && !this.isTest && !this.isRailway) {
            this.ensureLogDirectory();
        }

        this.winston = this.createWinstonLogger();

        // 로그 설정 상태 출력 (test 환경이 아닐 때만)
        if (!this.isTest) {
            this.logCurrentSettings();
        }

        // Railway 환경에서 이메일 로그 전송을 위한 설정
        if (this.isRailway) {
            this.initializeEmailLogging();
        }
    }

    /**
     * Winston 로거 인스턴스 생성
     */
    createWinstonLogger() {
        const transports = [];

        // test 환경에서는 로그 출력을 최소화
        if (this.isTest) {
            // test 환경: error 레벨만 출력
            transports.push(
                new winston.transports.Console({
                    format: this.getTestFormat(),
                    level: this.getLogLevel(),
                    silent: process.env.TEST_SILENT === 'true' // TEST_SILENT=true면 완전히 조용
                })
            );
        } else {
            // Console transport (test가 아닌 환경)
            transports.push(
                new winston.transports.Console({
                    format: this.isDevelopment ? this.getDevFormat() : this.getProdFormat(),
                    level: this.getLogLevel()
                })
            );

            // 파일 transport (Railway가 아닌 프로덕션 및 스테이징 환경)
            if ((this.isProduction || this.isStaging) && !this.isRailway) {
                // 에러 로그 파일 (일별 로테이션)
                transports.push(
                    new DailyRotateFile({
                        filename: path.join(this.logDir, 'error-%DATE%.log'),
                        datePattern: 'YYYY-MM-DD',
                        level: 'error',
                        format: this.getProdFormat(),
                        maxSize: '20m', // 파일 최대 크기
                        maxFiles: '30d', // 30일간 보관
                        zippedArchive: true, // 압축 보관
                        auditFile: path.join(this.logDir, 'error-audit.json')
                    })
                );

                // 전체 로그 파일 (일별 로테이션)
                transports.push(
                    new DailyRotateFile({
                        filename: path.join(this.logDir, 'combined-%DATE%.log'),
                        datePattern: 'YYYY-MM-DD',
                        format: this.getProdFormat(),
                        maxSize: '50m', // 파일 최대 크기
                        maxFiles: '14d', // 14일간 보관
                        zippedArchive: true, // 압축 보관
                        auditFile: path.join(this.logDir, 'combined-audit.json')
                    })
                );

                // HTTP 요청 로그 파일 (별도 관리)
                transports.push(
                    new DailyRotateFile({
                        filename: path.join(this.logDir, 'access-%DATE%.log'),
                        datePattern: 'YYYY-MM-DD',
                        level: 'info',
                        format: this.getAccessLogFormat(),
                        maxSize: '100m', // 파일 최대 크기
                        maxFiles: '7d', // 7일간 보관
                        zippedArchive: true, // 압축 보관
                        auditFile: path.join(this.logDir, 'access-audit.json')
                    })
                );
            }
        }

        return winston.createLogger({
            level: this.getLogLevel(),
            transports,
            exitOnError: false
        });
    }

    /**
     * 개발 환경용 포맷 (이모지 포함)
     */
    getDevFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                const prefix = this.getPrefix(level);

                // 스택 트레이스가 있으면 별도 처리
                if (stack) {
                    const metaStr = Object.keys(meta).length ? `\n메타데이터: ${JSON.stringify(meta, null, 2)}` : '';
                    return `[${timestamp}] ${prefix} ${message}\n스택 트레이스:\n${stack}${metaStr}`;
                }

                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `[${timestamp}] ${prefix} ${message}${metaStr}`;
            })
        );
    }

    /**
     * 프로덕션 환경용 포맷 (JSON)
     */
    getProdFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.printf((info) => {
                // 민감한 정보 제거
                const sanitized = this.sanitizeLogData(info);
                return JSON.stringify(sanitized);
            })
        );
    }

    /**
     * 테스트 환경용 포맷 (간결한 형태)
     */
    getTestFormat() {
        return winston.format.combine(
            winston.format.printf(({ level, message }) => {
                return `[TEST] ${level.toUpperCase()}: ${message}`;
            })
        );
    }

    /**
     * 로그 데이터에서 민감한 정보 제거
     */
    sanitizeLogData(data) {
        const sensitiveFields = [
            'password', 'token', 'authorization', 'cookie', 'secret',
            'x-auth-token', 'x-api-key', 'access_token', 'refresh_token',
            'sessionId', 'apiKey', 'privateKey'
        ];

        const sanitized = { ...data };

        // 재귀적으로 민감한 필드 제거
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;

            const result = Array.isArray(obj) ? [] : {};

            for (const [key, value] of Object.entries(obj)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveFields.some(field => lowerKey.includes(field))) {
                    result[key] = '[REDACTED]';
                } else if (typeof value === 'object' && value !== null) {
                    result[key] = sanitizeObject(value);
                } else {
                    result[key] = value;
                }
            }

            return result;
        };

        return sanitizeObject(sanitized);
    }

    /**
     * 환경별 로그 레벨 결정 (ErrorHandler와 일관성 유지)
     */
    getLogLevel() {
        // 환경변수로 로그 레벨 오버라이드 가능
        const envLogLevel = process.env.LOG_LEVEL;
        if (envLogLevel && this.isValidLogLevel(envLogLevel)) {
            console.log(`🔧 LOG_LEVEL 환경변수 적용: ${envLogLevel.toLowerCase()} (환경: ${this.environment})`);
            return envLogLevel.toLowerCase();
        }

        // 환경별 기본 로그 레벨 (ErrorHandler와 동일)
        let defaultLevel;
        switch (this.environment) {
            case 'development':
            case 'local':
                defaultLevel = 'debug';
                break;
            case 'test':
            case 'testing':
                defaultLevel = 'error';
                break;
            case 'staging':
                defaultLevel = 'warn';
                break;
            case 'production':
                defaultLevel = 'error';
                break;
            default:
                defaultLevel = 'info';
        }

        console.log(`🔧 기본 로그 레벨 적용: ${defaultLevel} (환경: ${this.environment})`);
        return defaultLevel;
    }

    /**
     * 유효한 로그 레벨인지 확인
     */
    isValidLogLevel(level) {
        const validLevels = ['error', 'warn', 'info', 'debug'];
        return validLevels.includes(level.toLowerCase());
    }

    /**
     * 현재 로그 레벨에서 특정 레벨이 출력되는지 확인
     */
    shouldLog(level) {
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        const currentLevel = levels[this.getLogLevel()] || 0;
        const checkLevel = levels[level] || 0;
        return checkLevel <= currentLevel;
    }

    /**
     * Railway 환경 감지 (Railway에서 자동으로 제공하는 환경변수들)
     */
    detectRailwayEnvironment() {
        // Railway에서 자동으로 제공하는 환경변수들을 확인
        return !!(
            process.env.RAILWAY_ENVIRONMENT_NAME ||
            process.env.RAILWAY_PROJECT_ID ||
            process.env.RAILWAY_SERVICE_ID ||
            process.env.RAILWAY_DEPLOYMENT_ID
        );
    }

    /**
     * Railway 환경에서 이메일 로깅 초기화
     */
    initializeEmailLogging() {
        // 일별 로그 수집을 위한 버퍼
        this.dailyLogBuffer = [];
        this.lastDailyEmailSent = null; // 마지막 일별 이메일 전송 날짜
        this.criticalLogBuffer = []; // 즉시 전송이 필요한 중요 로그들
        this.maxDailyBufferSize = 1000; // 일별 로그 최대 1000개
        this.maxCriticalBufferSize = 10; // 중요 로그 최대 10개

        // 매일 자정에 일별 로그 요약 이메일 전송
        if (this.isProduction) {
            this.scheduleDailyLogEmail();
        }
    }

    /**
     * 일별 로그 이메일 스케줄링
     */
    scheduleDailyLogEmail() {
        // 다음 자정까지의 시간 계산
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // 자정으로 설정

        const timeUntilMidnight = tomorrow.getTime() - now.getTime();

        // 첫 번째 실행을 자정에 예약
        setTimeout(() => {
            this.sendDailyLogEmail();

            // 이후 24시간마다 반복 실행
            setInterval(() => {
                this.sendDailyLogEmail();
            }, 24 * 60 * 60 * 1000); // 24시간

        }, timeUntilMidnight);

        this.info('📅 일별 로그 이메일 스케줄링 완료', {
            nextEmailTime: tomorrow.toISOString(),
            timeUntilNext: `${Math.round(timeUntilMidnight / 1000 / 60)}분`
        });
    }

    /**
     * 로그 디렉토리 생성
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * 로그 레벨별 프리픽스 (기존 커스텀 로거와 동일)
     */
    getPrefix(level) {
        const prefixes = {
            info: '✅',
            warn: '⚠️',
            error: '❌',
            debug: '🔍',
            success: '🎉',
            http: '🌐',
            auth: '🔐',
            db: '💾'
        };
        return prefixes[level] || 'ℹ️';
    }

    /**
     * 메시지 포맷팅 (사용자 정보 포함)
     */
    formatMessage(level, message, meta = {}, userInfo = null) {
        const userPrefix = userInfo ? `[${userInfo.username}]` : '';
        const formattedMessage = userPrefix ? `${userPrefix} ${message}` : message;

        // 민감한 정보 제거
        const sanitizedMeta = this.sanitizeLogData(meta);

        const logData = {
            level,
            message: formattedMessage,
            environment: this.environment,
            ...(userInfo && { user: userInfo }),
            ...sanitizedMeta
        };

        return logData;
    }

    /**
     * 정보 로그
     */
    info(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('info', message, meta, userInfo);
        this.winston.info(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('info', message, meta);
    }

    /**
     * 성공 로그 (info 레벨로 처리)
     */
    success(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('success', message, meta, userInfo);
        this.winston.info(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('success', message, meta);
    }

    /**
     * 경고 로그
     */
    warn(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('warn', message, meta, userInfo);
        this.winston.warn(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('warn', message, meta);
    }

    /**
     * 에러 로그 (강화된 버전)
     */
    error(message, error = null, meta = {}, userInfo = null) {
        const errorMeta = error ? {
            ...meta,
            error: {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
                name: error.name,
                code: error.code,
                statusCode: error.statusCode
            }
        } : meta;

        const logData = this.formatMessage('error', message, errorMeta, userInfo);
        this.winston.error(logData);

        // Railway 환경에서 로그 버퍼에 추가
        this.addToDailyLogBuffer('error', message, errorMeta);
        this.addToCriticalLogBuffer('error', message, errorMeta);
    }

    /**
     * 에러 심각도 자동 판단
     */
    getErrorSeverity(error) {
        // 시스템 에러 (CRITICAL)
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.message.toLowerCase().includes('database') ||
            error.message.toLowerCase().includes('connection') ||
            error.name.toLowerCase().includes('error')) {
            return 'CRITICAL';
        }

        // 보안 관련 에러 (HIGH)
        if (error.statusCode === 401 ||
            error.statusCode === 403 ||
            error.message.includes('unauthorized') ||
            error.message.includes('forbidden')) {
            return 'HIGH';
        }

        // 비즈니스 로직 에러 (MEDIUM)
        if (error.statusCode >= 400 && error.statusCode < 500) {
            return 'MEDIUM';
        }

        // 서버 에러 (HIGH)
        if (error.statusCode >= 500) {
            return 'HIGH';
        }

        return 'LOW';
    }

    /**
     * 에러 분류 (확장 가능한 동적 시스템)
     */
    categorizeError(error) {
        // 기본 카테고리 정의
        const defaultCategories = {
            DATABASE: ['database', 'connection', 'query', 'sql', 'redis', 'cache'],
            NETWORK: ['network', 'timeout', 'econnrefused', 'enotfound'],
            AUTHENTICATION: ['auth', 'login', 'token', 'session', 'unauthorized'],
            VALIDATION: ['validation', 'invalid', 'required', 'format'],
            BUSINESS: ['business', 'logic', 'rule', 'constraint'],
            SYSTEM: ['system', 'memory', 'cpu', 'disk', 'resource'],
            EXTERNAL: ['api', 'service', 'third-party', 'external']
        };

        // 환경변수나 설정으로 추가 카테고리 확장 가능
        const customCategories = this.getCustomErrorCategories();
        const categories = { ...defaultCategories, ...customCategories };

        const errorText = `${error.message} ${error.name} ${error.code}`.toLowerCase();

        // 우선순위: 커스텀 카테고리 -> 기본 카테고리
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => errorText.includes(keyword))) {
                return category;
            }
        }

        return 'UNKNOWN';
    }

    /**
     * 커스텀 에러 카테고리 로드 (확장성을 위한 메서드)
     */
    getCustomErrorCategories() {
        try {
            // 환경변수나 설정 파일에서 커스텀 카테고리 로드
            const customConfig = process.env.CUSTOM_ERROR_CATEGORIES;
            if (customConfig) {
                return JSON.parse(customConfig);
            }
        } catch (error) {
            // 파싱 에러 시 빈 객체 반환
            this.debug('커스텀 에러 카테고리 로드 실패', { error: error.message });
        }
        return {};
    }

    /**
     * 에러 복구 제안 생성 (확장 가능한 동적 시스템)
     */
    generateRecoverySuggestion(error) {
        const category = this.categorizeError(error);

        // 기본 복구 제안
        const defaultSuggestions = {
            DATABASE: [
                '데이터베이스 연결 상태를 확인하세요',
                '쿼리 문법을 검토하세요',
                '데이터베이스 서버 상태를 점검하세요',
                '연결 풀 설정을 확인하세요'
            ],
            NETWORK: [
                '네트워크 연결을 확인하세요',
                '방화벽 설정을 점검하세요',
                'DNS 설정을 확인하세요'
            ],
            AUTHENTICATION: [
                '인증 토큰을 갱신하세요',
                '사용자 권한을 확인하세요',
                '세션 상태를 점검하세요'
            ],
            VALIDATION: [
                '입력 데이터 형식을 확인하세요',
                '필수 필드가 누락되지 않았는지 점검하세요',
                '데이터 유효성 규칙을 검토하세요'
            ],
            BUSINESS: [
                '비즈니스 로직을 재검토하세요',
                '데이터 상태를 확인하세요',
                '워크플로우를 점검하세요'
            ],
            SYSTEM: [
                '시스템 리소스를 확인하세요',
                '메모리 사용량을 점검하세요',
                '서버 상태를 모니터링하세요'
            ],
            EXTERNAL: [
                '외부 서비스 상태를 확인하세요',
                'API 키와 권한을 점검하세요',
                '서비스 문서를 참조하세요',
                '외부 API 응답 상태를 확인하세요'
            ]
        };

        // 커스텀 복구 제안과 병합
        const customSuggestions = this.getCustomRecoverySuggestions();
        const allSuggestions = { ...defaultSuggestions, ...customSuggestions };

        return allSuggestions[category] || ['에러 로그를 자세히 분석하세요'];
    }

    /**
     * 커스텀 복구 제안 로드 (확장성을 위한 메서드)
     */
    getCustomRecoverySuggestions() {
        try {
            // 환경변수나 설정 파일에서 커스텀 복구 제안 로드
            const customConfig = process.env.CUSTOM_RECOVERY_SUGGESTIONS;
            if (customConfig) {
                return JSON.parse(customConfig);
            }
        } catch (error) {
            this.debug('커스텀 복구 제안 로드 실패', { error: error.message });
        }
        return {};
    }

    /**
     * 일별 로그 파일 이메일 전송
     */
    async sendDailyLogEmail() {
        if (!this.isRailway || this.dailyLogBuffer.length === 0) {
            return;
        }

        // SMTP 설정이 완전하지 않으면 이메일 전송 건너뛰기
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('📧 EMAIL 설정이 완전하지 않아 일별 로그 이메일 전송을 건너뜁니다.');
            return;
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

        // 이미 오늘 이메일을 보냈다면 스킵
        if (this.lastDailyEmailSent === today) {
            return;
        }

        try {
            // 로그 파일 내용 생성
            const logContent = this.generateLogFileContent(this.dailyLogBuffer, today);

            // 기존 emailSender 모듈 동적 import
            const { sendDailyLogFileEmail } = await import('./emailSender.js');

            const subject = `📋 [SKKU Gallery] 일별 로그 파일 - ${today}`;

            await sendDailyLogFileEmail(
                process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject,
                logContent,
                `skku-gallery-logs-${today}.txt`
            );

            this.lastDailyEmailSent = today;

            // 전송 후 버퍼 초기화
            this.dailyLogBuffer = [];

            console.log(`✅ 일별 로그 파일 이메일 전송 완료: ${today}`);

        } catch (emailError) {
            // 이메일 전송 실패 시 콘솔에만 로그 (무한 루프 방지)
            console.error('Failed to send daily log email:', emailError.message);
        }
    }

    /**
     * 중요 로그 즉시 이메일 전송 (에러 5개 이상 누적 시)
     */
    async sendCriticalLogEmail() {
        if (!this.isRailway || this.criticalLogBuffer.length === 0) {
            return;
        }

        // SMTP 설정이 완전하지 않으면 이메일 전송 건너뛰기
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('�� EMAIL 설정이 완전하지 않아 긴급 로그 이메일 전송을 건너뜁니다.');
            return;
        }

        try {
            // 기존 emailSender 모듈 동적 import
            const { sendLogNotificationEmail } = await import('./emailSender.js');

            const subject = `🚨 [SKKU Gallery] 긴급 로그 알림 - ${new Date().toLocaleString('ko-KR')}`;
            const htmlContent = this.generateCriticalLogEmailHTML(this.criticalLogBuffer);

            await sendLogNotificationEmail(
                process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject,
                htmlContent
            );

            // 전송 후 중요 로그 버퍼 초기화
            this.criticalLogBuffer = [];

            console.log('🚨 긴급 로그 알림 이메일 전송 완료');

        } catch (emailError) {
            // 이메일 전송 실패 시 콘솔에만 로그 (무한 루프 방지)
            console.error('Failed to send critical log email:', emailError.message);
        }
    }

    /**
     * 로그 파일 내용 생성 (텍스트 형식)
     */
    generateLogFileContent(logs, date) {
        const header = `
=================================================================
SKKU Gallery 일별 로그 파일
=================================================================
날짜: ${date}
환경: ${this.environment}
Railway 프로젝트: ${process.env.RAILWAY_PROJECT_NAME || 'Unknown'}
총 로그 수: ${logs.length}개
생성 시간: ${new Date().toLocaleString('ko-KR')}
=================================================================

`;

        // 로그를 시간순으로 정렬
        const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const logEntries = sortedLogs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString('ko-KR');
            const level = log.level.toUpperCase().padEnd(8);
            const metaStr = log.meta && Object.keys(log.meta).length > 0
                ? `\n    메타데이터: ${JSON.stringify(log.meta, null, 4)}`
                : '';

            return `[${timestamp}] ${level} ${log.message}${metaStr}`;
        }).join('\n\n');

        // 통계 정보
        const stats = {
            total: logs.length,
            error: logs.filter(log => log.level === 'error').length,
            warn: logs.filter(log => log.level === 'warn').length,
            info: logs.filter(log => log.level === 'info').length,
            auth: logs.filter(log => log.level === 'auth').length,
            http: logs.filter(log => log.level === 'http').length,
            debug: logs.filter(log => log.level === 'debug').length
        };

        const statsSection = `

=================================================================
로그 통계
=================================================================
총 로그: ${stats.total}개
에러: ${stats.error}개
경고: ${stats.warn}개
정보: ${stats.info}개
인증: ${stats.auth}개
HTTP: ${stats.http}개
디버그: ${stats.debug}개
=================================================================

`;

        return header + statsSection + logEntries + '\n\n=== 로그 파일 끝 ===\n';
    }

    /**
     * 긴급 로그 이메일 HTML 생성
     */
    generateCriticalLogEmailHTML(logs) {
        return `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .log-item { background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
                    .timestamp { color: #6c757d; font-size: 0.85em; }
                    .message { font-weight: 500; margin: 5px 0; }
                    .meta { color: #6c757d; font-size: 0.85em; background: #e9ecef; padding: 5px; border-radius: 3px; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🚨 긴급 로그 알림</h2>
                    <p><strong>시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                    <p><strong>환경:</strong> ${this.environment}</p>
                </div>

                <div class="alert">
                    <strong>⚠️ 주의:</strong> 중요한 에러가 ${logs.length}개 감지되어 즉시 알림을 전송합니다.
                </div>

                ${logs.map(log => `
                    <div class="log-item">
                        <div class="timestamp">${new Date(log.timestamp).toLocaleString('ko-KR')}</div>
                        <div class="message">${log.message}</div>
                        ${log.meta && Object.keys(log.meta).length > 0 ? `<div class="meta">${JSON.stringify(log.meta, null, 2)}</div>` : ''}
                    </div>
                `).join('')}

                <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px;">
                    <p><small>즉시 확인이 필요한 중요 로그입니다.</small></p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * 일별 로그 버퍼에 추가
     */
    addToDailyLogBuffer(level, message, meta = {}) {
        if (!this.isRailway || !this.dailyLogBuffer) return;

        // 모든 로그를 일별 버퍼에 추가
        this.dailyLogBuffer.push({
            level,
            message,
            meta,
            timestamp: new Date().toISOString()
        });

        // 일별 버퍼 크기 제한
        if (this.dailyLogBuffer.length > this.maxDailyBufferSize) {
            this.dailyLogBuffer = this.dailyLogBuffer.slice(-this.maxDailyBufferSize);
        }
    }

    /**
     * 중요 로그 버퍼에 추가 (즉시 전송용)
     */
    addToCriticalLogBuffer(level, message, meta = {}) {
        if (!this.isRailway || !this.criticalLogBuffer) return;

        // 에러 레벨만 중요 로그 버퍼에 추가
        if (level === 'error') {
            this.criticalLogBuffer.push({
                level,
                message,
                meta,
                timestamp: new Date().toISOString()
            });

            // 중요 로그 버퍼 크기 제한
            if (this.criticalLogBuffer.length > this.maxCriticalBufferSize) {
                this.criticalLogBuffer = this.criticalLogBuffer.slice(-this.maxCriticalBufferSize);
            }

            // 에러 로그가 5개 이상 누적되면 즉시 전송
            if (this.criticalLogBuffer.length >= 5) {
                this.sendCriticalLogEmail();
            }
        }
    }

    /**
     * 강화된 에러 로깅 (분석 포함)
     */
    logErrorWithAnalysis(message, error, meta = {}, userInfo = null, req = null) {
        if (!error) {
            return this.error(message, null, meta, userInfo);
        }

        const severity = this.getErrorSeverity(error);
        const category = this.categorizeError(error);
        const suggestions = this.generateRecoverySuggestion(error);
        const errorId = this.generateErrorId();

        const enhancedMeta = {
            ...meta,
            errorAnalysis: {
                id: errorId,
                severity,
                category,
                suggestions,
                timestamp: new Date().toISOString(),
                environment: this.environment
            },
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                statusCode: error.statusCode,
                stack: this.isDevelopment ? error.stack : undefined
            }
        };

        // 요청 정보 추가
        if (req) {
            enhancedMeta.request = {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.id || this.generateRequestId()
            };
        }

        const logData = this.formatMessage('error', `[${errorId}] ${message}`, enhancedMeta, userInfo);

        // 심각도에 따른 로깅 레벨 조정
        if (severity === 'CRITICAL') {
            this.winston.error(logData);
            // 중요한 에러는 별도 알림도 고려
            this.logCriticalErrorAlert(errorId, error, enhancedMeta);
        } else if (severity === 'HIGH') {
            this.winston.error(logData);
        } else if (severity === 'MEDIUM') {
            this.winston.warn(logData);
        } else {
            this.winston.info(logData);
        }

        return errorId;
    }

    /**
     * 에러 ID 생성
     */
    generateErrorId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `ERR_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * 중요 에러 알림 로깅
     */
    logCriticalErrorAlert(errorId, error, meta) {
        this.winston.error(`🚨 CRITICAL ERROR ALERT - ${errorId}`, {
            alert: true,
            errorId,
            error: error.message,
            category: meta.errorAnalysis.category,
            environment: this.environment,
            timestamp: new Date().toISOString(),
            requiresImmedateAttention: true
        });
    }

    /**
     * 에러 통계 로깅
     */
    logErrorStats(timeframe = '1h') {
        if (this.shouldLog('info')) {
            this.info('📊 에러 통계 요청', {
                timeframe,
                statsType: 'error-summary',
                environment: this.environment
            });
        }
    }

    /**
     * 에러 패턴 감지 로깅
     */
    logErrorPattern(pattern, count, timeframe) {
        if (this.shouldLog('warn')) {
            this.warn('🔍 에러 패턴 감지', {
                pattern,
                count,
                timeframe,
                environment: this.environment,
                alertType: 'pattern-detection'
            });
        }
    }

    /**
     * 에러 복구 시도 로깅
     */
    logErrorRecovery(errorId, recoveryAction, success = false) {
        const level = success ? 'info' : 'warn';
        const emoji = success ? '✅' : '⚠️';

        this[level](`${emoji} 에러 복구 시도`, {
            errorId,
            recoveryAction,
            success,
            environment: this.environment,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 디버그 로그
     */
    debug(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('debug', message, meta, userInfo);
        this.winston.debug(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('debug', message, meta);
    }

    /**
     * 인증 관련 로그
     */
    auth(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('auth', message, meta, userInfo);
        this.winston.info(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('auth', message, meta);
    }

    /**
     * 데이터베이스 관련 로그
     */
    db(message, meta = {}, userInfo = null) {
        const logData = this.formatMessage('db', message, meta, userInfo);
        this.winston.info(logData);

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('db', message, meta);
    }

    /**
     * HTTP 요청 로그 (사용자 정보 포함)
     */
    http(req, res, duration) {
        const userInfo = req.session?.user ? {
            username: req.session.user.username,
            role: req.session.user.role
        } : null;

        const userPrefix = userInfo ? `[${userInfo.username}]` : '';
        const message = `${userPrefix} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            user: userInfo
        };

        const logData = this.formatMessage('http', message, meta);

        if (res.statusCode >= 400) {
            this.winston.warn(logData);
        } else {
            this.winston.info(logData);
        }

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer('http', message, meta);
    }

    /**
     * 환경 정보 로그
     */
    logEnvironmentInfo() {
        // test 환경에서는 환경 정보 로그 출력하지 않음
        if (this.isTest) {
            return;
        }

        this.info('==== 환경 설정 정보 ====');
        this.info(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
        this.info(`현재 환경: ${this.environment}`);
        this.info(`로그 레벨: ${this.getLogLevel()}`);
        this.info(`LOG_LEVEL 오버라이드: ${process.env.LOG_LEVEL || 'None'}`);
        this.info(`DB_HOST: ${process.env.DB_HOST}`);
        this.info(`DB_NAME: ${process.env.DB_NAME}`);
        this.info(`DB_PORT: ${process.env.DB_PORT}`);
        this.info(`BASE_URL: ${process.env.BASE_URL}`);
        this.info(`PORT 환경변수 있음: ${process.env.PORT ? 'Yes' : 'No'}`);
        this.info(`프로덕션 환경: ${this.isProduction ? 'Yes' : 'No'}`);
        this.info(`테스트 환경: ${this.isTest ? 'Yes' : 'No'}`);
        this.info(`스테이징 환경: ${this.isStaging ? 'Yes' : 'No'}`);
        this.info('=====================');
    }

    /**
     * 서버 시작 로그
     */
    logServerStart(port) {
        // test 환경에서는 서버 시작 로그 출력하지 않음
        if (this.isTest) {
            return;
        }

        this.success(`서버가 포트 ${port}에서 실행 중입니다.`);
        this.info(`환경: ${process.env.NODE_ENV || 'development'}`);
        this.info(`헬스체크 URL: http://localhost:${port}/health`);
    }

    /**
     * 요청 컨텍스트에서 사용자 정보 추출
     */
    extractUserInfo(req) {
        if (req?.session?.user) {
            return {
                username: req.session.user.username,
                role: req.session.user.role,
                id: req.session.user.id
            };
        }
        return null;
    }

    /**
     * 컨텍스트 기반 로깅 헬퍼 메서드들
     */
    withContext(req) {
        const userInfo = this.extractUserInfo(req);

        return {
            info: (message, meta = {}) => this.info(message, meta, userInfo),
            success: (message, meta = {}) => this.success(message, meta, userInfo),
            warn: (message, meta = {}) => this.warn(message, meta, userInfo),
            error: (message, error = null, meta = {}) => this.error(message, error, meta, userInfo),
            debug: (message, meta = {}) => this.debug(message, meta, userInfo),
            auth: (message, meta = {}) => this.auth(message, meta, userInfo),
            db: (message, meta = {}) => this.db(message, meta, userInfo)
        };
    }

    /**
     * 성능 측정을 위한 타이머 시작
     */
    startTimer(label) {
        const startTime = process.hrtime.bigint();
        return {
            end: () => {
                const endTime = process.hrtime.bigint();
                const duration = Number(endTime - startTime) / 1000000; // 밀리초로 변환
                this.info(`⏱️ 성능 측정: ${label}`, {
                    duration: `${duration.toFixed(2)}ms`,
                    label
                });
                return duration;
            }
        };
    }

    /**
     * 요청 추적을 위한 고유 ID 생성
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 구조화된 로그 메시지 생성
     */
    createStructuredLog(level, message, meta = {}) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            environment: this.environment,
            service: 'skku-gallery',
            version: process.env.APP_VERSION || '1.0.0',
            ...meta
        };
    }

    /**
     * 조건부 로깅 (특정 조건에서만 로그 출력)
     */
    logIf(condition, level, message, meta = {}, userInfo = null) {
        if (condition && this.shouldLog(level)) {
            this[level](message, meta, userInfo);
        }
    }

    /**
     * 배치 로깅 (여러 로그를 한 번에 출력)
     */
    logBatch(logs) {
        logs.forEach(({ level, message, meta, userInfo }) => {
            if (this.shouldLog(level)) {
                this[level](message, meta, userInfo);
            }
        });
    }

    /**
     * 메모리 사용량 로깅
     */
    logMemoryUsage(label = '메모리 사용량') {
        if (this.shouldLog('debug')) {
            const usage = process.memoryUsage();
            this.debug(`💾 ${label}`, {
                rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(usage.external / 1024 / 1024)}MB`
            });
        }
    }

    /**
     * 에러 체인 추적 로깅
     */
    logErrorChain(errors, context = {}) {
        if (!Array.isArray(errors) || errors.length === 0) {
            return;
        }

        const chainId = this.generateErrorId();

        this.error(`🔗 에러 체인 감지 - ${chainId}`, {
            chainId,
            errorCount: errors.length,
            context,
            chain: errors.map((error, index) => ({
                sequence: index + 1,
                message: error.message,
                name: error.name,
                code: error.code,
                timestamp: error.timestamp || new Date().toISOString()
            }))
        });

        return chainId;
    }

    /**
     * 에러 상관관계 분석 로깅
     */
    logErrorCorrelation(primaryError, relatedErrors = [], correlationFactors = {}) {
        const correlationId = this.generateErrorId();

        this.warn(`🔍 에러 상관관계 분석 - ${correlationId}`, {
            correlationId,
            primaryError: {
                message: primaryError.message,
                category: this.categorizeError(primaryError),
                severity: this.getErrorSeverity(primaryError)
            },
            relatedErrorsCount: relatedErrors.length,
            correlationFactors,
            analysis: {
                timeWindow: correlationFactors.timeWindow || '5m',
                similarityScore: correlationFactors.similarityScore || 0,
                userImpact: correlationFactors.userImpact || 'unknown'
            }
        });

        return correlationId;
    }

    /**
     * 성능 저하 에러 로깅
     */
    logPerformanceError(operation, duration, threshold, meta = {}) {
        const severity = duration > threshold * 2 ? 'HIGH' : 'MEDIUM';
        const errorId = this.generateErrorId();

        this.warn(`⚡ 성능 저하 감지 - ${errorId}`, {
            errorId,
            operation,
            duration: `${duration}ms`,
            threshold: `${threshold}ms`,
            overThresholdBy: `${duration - threshold}ms`,
            severity,
            ...meta
        });

        return errorId;
    }

    /**
     * 리소스 부족 에러 로깅
     */
    logResourceError(resourceType, current, limit, meta = {}) {
        const usage = (current / limit) * 100;
        const severity = usage > 90 ? 'CRITICAL' : usage > 80 ? 'HIGH' : 'MEDIUM';
        const errorId = this.generateErrorId();

        this.error(`📊 리소스 부족 - ${errorId}`, {
            errorId,
            resourceType,
            current,
            limit,
            usagePercentage: `${usage.toFixed(1)}%`,
            severity,
            ...meta
        });

        return errorId;
    }

    /**
     * 사용자 영향 에러 로깅
     */
    logUserImpactError(error, affectedUsers = [], impactLevel = 'MEDIUM', meta = {}) {
        const errorId = this.generateErrorId();

        this.error(`👥 사용자 영향 에러 - ${errorId}`, {
            errorId,
            error: {
                message: error.message,
                category: this.categorizeError(error)
            },
            affectedUsersCount: affectedUsers.length,
            impactLevel,
            affectedUserIds: affectedUsers.slice(0, 10), // 최대 10명만 로깅
            ...meta
        });

        return errorId;
    }

    /**
     * 에러 해결 시간 추적
     */
    logErrorResolution(errorId, resolutionTime, resolutionMethod, success = true) {
        const level = success ? 'info' : 'warn';
        const emoji = success ? '✅' : '❌';

        this[level](`${emoji} 에러 해결 완료`, {
            errorId,
            resolutionTime: `${resolutionTime}ms`,
            resolutionMethod,
            success,
            environment: this.environment
        });
    }

    /**
     * 에러 빈도 분석 로깅
     */
    logErrorFrequency(errorPattern, frequency, timeWindow, threshold) {
        const isAnomalous = frequency > threshold;
        const level = isAnomalous ? 'warn' : 'info';
        const emoji = isAnomalous ? '🚨' : '📈';

        this[level](`${emoji} 에러 빈도 분석`, {
            errorPattern,
            frequency,
            timeWindow,
            threshold,
            isAnomalous,
            anomalyLevel: isAnomalous ? (frequency > threshold * 2 ? 'HIGH' : 'MEDIUM') : 'NORMAL'
        });
    }

    /**
     * 에러 트렌드 분석 로깅
     */
    logErrorTrend(trendData, analysis) {
        this.info('📊 에러 트렌드 분석', {
            period: trendData.period,
            totalErrors: trendData.totalErrors,
            trend: analysis.trend, // 'increasing', 'decreasing', 'stable'
            changePercentage: analysis.changePercentage,
            categories: trendData.categories,
            recommendations: analysis.recommendations
        });
    }

    /**
     * 에러 컨텍스트 강화 로깅
     */
    logEnhancedError(error, context = {}) {
        const errorId = this.generateErrorId();
        const severity = this.getErrorSeverity(error);
        const category = this.categorizeError(error);

        // 시스템 상태 정보 수집
        const systemContext = {
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version
        };

        // 요청 컨텍스트 정보
        const requestContext = context.req ? {
            method: context.req.method,
            url: context.req.originalUrl,
            headers: this.sanitizeLogData(context.req.headers),
            body: this.sanitizeLogData(context.req.body),
            query: context.req.query,
            params: context.req.params
        } : {};

        this.error(`🔍 강화된 에러 분석 - ${errorId}`, {
            errorId,
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                stack: this.isDevelopment ? error.stack : undefined
            },
            analysis: {
                severity,
                category,
                suggestions: this.generateRecoverySuggestion(error)
            },
            context: {
                ...context,
                system: systemContext,
                request: requestContext
            }
        });

        return errorId;
    }

    // ==================== 성능 모니터링 로깅 시스템 ====================

    /**
     * 성능 메트릭 수집 및 로깅
     */
    logPerformanceMetrics(operation, metrics = {}) {
        const performanceId = this.generatePerformanceId();

        // 기본 시스템 메트릭 수집
        const systemMetrics = this.collectSystemMetrics();

        // 성능 임계값 체크
        const alerts = this.checkPerformanceThresholds(metrics, systemMetrics);

        const level = alerts.length > 0 ? 'warn' : 'info';
        const emoji = alerts.length > 0 ? '⚠️' : '📊';

        this[level](`${emoji} 성능 메트릭 - ${performanceId}`, {
            performanceId,
            operation,
            timestamp: new Date().toISOString(),
            metrics: {
                ...metrics,
                system: systemMetrics
            },
            alerts,
            environment: this.environment
        });

        // Railway 환경에서 일별 로그 버퍼에 추가
        this.addToDailyLogBuffer(level, `성능 메트릭 - ${operation}`, {
            performanceId,
            metrics,
            alerts
        });

        return performanceId;
    }

    /**
     * 성능 ID 생성
     */
    generatePerformanceId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `PERF_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * 시스템 메트릭 수집
     */
    collectSystemMetrics() {
        const memory = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        return {
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024), // MB
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
                external: Math.round(memory.external / 1024 / 1024), // MB
                heapUsagePercentage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: Math.round(process.uptime()),
            loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
            timestamp: Date.now()
        };
    }

    /**
     * 성능 임계값 체크
     */
    checkPerformanceThresholds(metrics, systemMetrics) {
        const alerts = [];

        // 메모리 사용량 체크
        if (systemMetrics.memory.heapUsagePercentage > 85) {
            alerts.push({
                type: 'MEMORY_HIGH',
                severity: systemMetrics.memory.heapUsagePercentage > 95 ? 'CRITICAL' : 'HIGH',
                message: `힙 메모리 사용량이 ${systemMetrics.memory.heapUsagePercentage}%입니다`,
                threshold: '85%',
                current: `${systemMetrics.memory.heapUsagePercentage}%`
            });
        }

        // 응답 시간 체크
        if (metrics.responseTime && metrics.responseTime > 1000) {
            alerts.push({
                type: 'RESPONSE_TIME_HIGH',
                severity: metrics.responseTime > 5000 ? 'CRITICAL' : 'HIGH',
                message: `응답 시간이 ${metrics.responseTime}ms입니다`,
                threshold: '1000ms',
                current: `${metrics.responseTime}ms`
            });
        }

        // 데이터베이스 쿼리 시간 체크
        if (metrics.dbQueryTime && metrics.dbQueryTime > 500) {
            alerts.push({
                type: 'DB_QUERY_SLOW',
                severity: metrics.dbQueryTime > 2000 ? 'CRITICAL' : 'MEDIUM',
                message: `DB 쿼리 시간이 ${metrics.dbQueryTime}ms입니다`,
                threshold: '500ms',
                current: `${metrics.dbQueryTime}ms`
            });
        }

        // 동시 연결 수 체크
        if (metrics.activeConnections && metrics.activeConnections > 100) {
            alerts.push({
                type: 'HIGH_CONNECTIONS',
                severity: metrics.activeConnections > 200 ? 'HIGH' : 'MEDIUM',
                message: `활성 연결 수가 ${metrics.activeConnections}개입니다`,
                threshold: '100',
                current: `${metrics.activeConnections}`
            });
        }

        return alerts;
    }

    /**
     * API 엔드포인트 성능 로깅
     */
    logApiPerformance(req, res, responseTime, additionalMetrics = {}) {
        const endpoint = `${req.method} ${req.route?.path || req.originalUrl}`;

        const metrics = {
            responseTime,
            statusCode: res.statusCode,
            contentLength: res.get('content-length') || 0,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            ...additionalMetrics
        };

        // 사용자 정보 추가
        const userInfo = this.extractUserInfo(req);
        if (userInfo) {
            metrics.user = userInfo;
        }

        return this.logPerformanceMetrics(`API ${endpoint}`, metrics);
    }

    /**
     * 데이터베이스 쿼리 성능 로깅
     */
    logDatabasePerformance(operation, queryTime, queryType = 'SELECT', additionalMetrics = {}) {
        const metrics = {
            dbQueryTime: queryTime,
            queryType,
            ...additionalMetrics
        };

        return this.logPerformanceMetrics(`DB ${operation}`, metrics);
    }

    /**
     * 파일 I/O 성능 로깅
     */
    logFileIOPerformance(operation, duration, fileSize = 0, additionalMetrics = {}) {
        const metrics = {
            ioTime: duration,
            fileSize: Math.round(fileSize / 1024), // KB
            throughput: fileSize > 0 ? Math.round(fileSize / duration) : 0, // bytes/ms
            ...additionalMetrics
        };

        return this.logPerformanceMetrics(`File I/O ${operation}`, metrics);
    }

    /**
     * 외부 API 호출 성능 로깅
     */
    logExternalApiPerformance(apiName, duration, statusCode, additionalMetrics = {}) {
        const metrics = {
            apiCallTime: duration,
            statusCode,
            ...additionalMetrics
        };

        return this.logPerformanceMetrics(`External API ${apiName}`, metrics);
    }

    /**
     * 캐시 성능 로깅
     */
    logCachePerformance(operation, hitRate, responseTime, additionalMetrics = {}) {
        const metrics = {
            cacheHitRate: hitRate,
            cacheResponseTime: responseTime,
            ...additionalMetrics
        };

        return this.logPerformanceMetrics(`Cache ${operation}`, metrics);
    }

    /**
     * 성능 트렌드 분석 로깅
     */
    logPerformanceTrend(operation, currentMetrics, historicalAverage, trendAnalysis = {}) {
        const performanceChange = currentMetrics.responseTime && historicalAverage.responseTime
            ? ((currentMetrics.responseTime - historicalAverage.responseTime) / historicalAverage.responseTime * 100)
            : 0;

        const level = Math.abs(performanceChange) > 20 ? 'warn' : 'info';
        const emoji = performanceChange > 20 ? '📈' : performanceChange < -20 ? '📉' : '📊';

        this[level](`${emoji} 성능 트렌드 분석 - ${operation}`, {
            operation,
            current: currentMetrics,
            historical: historicalAverage,
            trend: {
                performanceChange: `${performanceChange.toFixed(1)}%`,
                direction: performanceChange > 5 ? 'degrading' : performanceChange < -5 ? 'improving' : 'stable',
                ...trendAnalysis
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 성능 임계값 위반 알림
     */
    logPerformanceAlert(alertType, severity, metrics, threshold, recommendations = []) {
        const alertId = this.generatePerformanceId();

        this.warn(`🚨 성능 알림 - ${alertId}`, {
            alertId,
            alertType,
            severity,
            metrics,
            threshold,
            recommendations,
            timestamp: new Date().toISOString(),
            environment: this.environment
        });

        // 중요한 성능 알림은 즉시 이메일 전송 고려
        if (severity === 'CRITICAL' && this.isRailway) {
            this.addToCriticalLogBuffer('warn', `성능 알림 - ${alertType}`, {
                alertId,
                severity,
                metrics,
                threshold
            });
        }

        return alertId;
    }

    /**
     * 성능 최적화 제안 로깅
     */
    logPerformanceOptimization(operation, currentMetrics, optimizationSuggestions = []) {
        this.info(`💡 성능 최적화 제안 - ${operation}`, {
            operation,
            currentMetrics,
            suggestions: optimizationSuggestions,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 리소스 사용량 모니터링
     */
    logResourceUsage(resourceType = 'system', customMetrics = {}) {
        const systemMetrics = this.collectSystemMetrics();

        const resourceData = {
            type: resourceType,
            system: systemMetrics,
            custom: customMetrics,
            timestamp: new Date().toISOString()
        };

        // 리소스 사용량이 높으면 경고
        const alerts = this.checkPerformanceThresholds({}, systemMetrics);
        const level = alerts.length > 0 ? 'warn' : 'debug';

        this[level]('📊 리소스 사용량 모니터링', resourceData);

        return resourceData;
    }

    /**
     * 성능 벤치마크 로깅
     */
    logPerformanceBenchmark(operation, iterations, totalTime, averageTime, additionalMetrics = {}) {
        const throughput = iterations / (totalTime / 1000); // operations per second

        this.info(`🏁 성능 벤치마크 - ${operation}`, {
            operation,
            iterations,
            totalTime: `${totalTime}ms`,
            averageTime: `${averageTime.toFixed(2)}ms`,
            throughput: `${throughput.toFixed(2)} ops/sec`,
            ...additionalMetrics,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 성능 회귀 감지 로깅
     */
    logPerformanceRegression(operation, baselineMetrics, currentMetrics, regressionThreshold = 20) {
        const regressionPercentage = ((currentMetrics.responseTime - baselineMetrics.responseTime) / baselineMetrics.responseTime) * 100;

        if (regressionPercentage > regressionThreshold) {
            this.warn(`📉 성능 회귀 감지 - ${operation}`, {
                operation,
                baseline: baselineMetrics,
                current: currentMetrics,
                regression: {
                    percentage: `${regressionPercentage.toFixed(1)}%`,
                    threshold: `${regressionThreshold}%`,
                    severity: regressionPercentage > 50 ? 'HIGH' : 'MEDIUM'
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * 성능 대시보드 데이터 로깅
     */
    logPerformanceDashboard(dashboardData) {
        this.info('📊 성능 대시보드 업데이트', {
            dashboard: dashboardData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 현재 로그 설정 상태 출력 (디버깅용)
     */
    logCurrentSettings() {
        console.log('=== Logger 설정 상태 ===');
        console.log(`환경: ${this.environment}`);
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`LOG_LEVEL 환경변수: ${process.env.LOG_LEVEL || 'undefined'}`);
        console.log(`현재 로그 레벨: ${this.getLogLevel()}`);
        console.log(`isDevelopment: ${this.isDevelopment}`);
        console.log(`isTest: ${this.isTest}`);
        console.log(`isProduction: ${this.isProduction}`);
        console.log(`isRailway: ${this.isRailway}`);
        console.log('========================');
    }
}

// 싱글톤 인스턴스
const logger = new WinstonLogger();

export default logger;
