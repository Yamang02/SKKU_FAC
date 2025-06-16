import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../../config/Config.js';
import fs from 'fs';
import path from 'path';

class WinstonLogger {
    constructor() {
        this.config = config;
        this.environmentManager = config.getEnvironmentManager();
        this.environment = this.environmentManager.getEnvironment();
        this.isDevelopment = this.environmentManager.is('isDevelopment');
        this.isTest = this.environmentManager.is('isTest');
        this.isStaging = this.environment === 'staging';
        this.isProduction = this.environmentManager.is('isProduction');
        this.isRailway = this.environmentManager.is('isRailwayDeployment');
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
                    silent: this.environmentManager.getEnvironmentValue({
                        test: true,
                        'local-test': true,
                        development: false,
                        production: false
                    }) // 테스트 환경에서는 조용
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
            winston.format.printf(({ timestamp, level, message, stack, error, ...meta }) => {
                const prefix = this.getPrefix(level);

                // 스택 트레이스 처리 - error 객체에서 직접 가져오거나 stack 속성 사용
                let stackTrace = null;
                if (this.environmentManager.is('enableStackTrace')) {
                    if (stack && typeof stack === 'string') {
                        stackTrace = stack;
                    } else if (error && error.stack && typeof error.stack === 'string') {
                        stackTrace = error.stack;
                    } else if (meta.error && meta.error.stack && typeof meta.error.stack === 'string') {
                        stackTrace = meta.error.stack;
                    }
                }

                // 메타데이터에서 error.stack 제거 (중복 방지)
                const cleanMeta = { ...meta };
                if (cleanMeta.error && cleanMeta.error.stack) {
                    delete cleanMeta.error.stack;
                }

                const metaStr = Object.keys(cleanMeta).length ? ` ${JSON.stringify(cleanMeta)}` : '';

                if (stackTrace) {
                    return `[${timestamp}] ${prefix} ${message}${metaStr}\n🔍 Stack trace for ${cleanMeta.errorAnalysis?.id || 'error'}:\n${stackTrace}`;
                }

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
            winston.format.printf(info => {
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
            'password',
            'token',
            'authorization',
            'cookie',
            'secret',
            'x-auth-token',
            'x-api-key',
            'access_token',
            'refresh_token',
            'sessionId',
            'apiKey',
            'privateKey'
        ];

        const sanitized = { ...data };

        // 재귀적으로 민감한 필드 제거
        const sanitizeObject = obj => {
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
     * 로그 레벨 가져오기
     */
    getLogLevel() {
        // Config 클래스에서 로그 레벨 가져오기
        const loggingConfig = this.config.get('logging');
        return loggingConfig ? loggingConfig.level : 'info';
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
            setInterval(
                () => {
                    this.sendDailyLogEmail();
                },
                24 * 60 * 60 * 1000
            ); // 24시간
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
        const errorMeta = error
            ? {
                ...meta,
                error: {
                    message: error.message,
                    stack: this.environmentManager.is('enableStackTrace') ? error.stack : undefined,
                    name: error.name,
                    code: error.code,
                    statusCode: error.statusCode
                }
            }
            : meta;

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
        if (
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.message.toLowerCase().includes('database') ||
            error.message.toLowerCase().includes('connection') ||
            error.name.toLowerCase().includes('error')
        ) {
            return 'CRITICAL';
        }

        // 보안 관련 에러 (HIGH)
        if (
            error.statusCode === 401 ||
            error.statusCode === 403 ||
            error.message.includes('unauthorized') ||
            error.message.includes('forbidden')
        ) {
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
            NETWORK: ['네트워크 연결을 확인하세요', '방화벽 설정을 점검하세요', 'DNS 설정을 확인하세요'],
            AUTHENTICATION: ['인증 토큰을 갱신하세요', '사용자 권한을 확인하세요', '세션 상태를 점검하세요'],
            VALIDATION: [
                '입력 데이터 형식을 확인하세요',
                '필수 필드가 누락되지 않았는지 점검하세요',
                '데이터 유효성 규칙을 검토하세요'
            ],
            BUSINESS: ['비즈니스 로직을 재검토하세요', '데이터 상태를 확인하세요', '워크플로우를 점검하세요'],
            SYSTEM: ['시스템 리소스를 확인하세요', '메모리 사용량을 점검하세요', '서버 상태를 모니터링하세요'],
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
        // 개발환경에서는 일별 로그 이메일도 비활성화
        if (!this.shouldSendCriticalEmail() || this.dailyLogBuffer.length === 0) {
            return;
        }

        // SMTP 설정이 완전하지 않으면 이메일 전송 건너뛰기
        const emailConfig = this.environmentManager.getEmailConfig();
        if (!emailConfig.user || !emailConfig.pass) {
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
                emailConfig.user, // 관리자 이메일이 별도로 설정되어 있지 않으면 발신자 이메일 사용
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
        // 이메일 전송 조건 재확인
        if (!this.shouldSendCriticalEmail() || this.criticalLogBuffer.length === 0) {
            return;
        }

        // SMTP 설정이 완전하지 않으면 이메일 전송 건너뛰기
        const emailConfig = this.environmentManager.getEmailConfig();
        if (!emailConfig.user || !emailConfig.pass) {
            console.log('📧 EMAIL 설정이 완전하지 않아 긴급 로그 이메일 전송을 건너뜁니다.');
            return;
        }

        try {
            // 기존 emailSender 모듈 동적 import
            const { sendLogNotificationEmail } = await import('./emailSender.js');

            const subject = `🚨 [SKKU Gallery] 긴급 로그 알림 - ${new Date().toLocaleString('ko-KR')}`;
            const htmlContent = this.generateCriticalLogEmailHTML(this.criticalLogBuffer);

            await sendLogNotificationEmail(emailConfig.user, subject, htmlContent);

            // 전송 후 중요 로그 버퍼 초기화
            this.criticalLogBuffer = [];

            console.log('🚨 긴급 로그 알림 이메일 전송 완료');
        } catch (emailError) {
            // 이메일 전송 실패 시 콘솔에만 로그 (무한 루프 방지)
            console.error('Failed to send critical log email:', emailError.message);
        }
    }

    /**
     * 긴급 로그 이메일 전송 여부 체크
     */
    shouldSendCriticalEmail() {
        // 개발환경, 로컬 테스트 환경에서는 이메일 전송 비활성화
        if (this.environmentManager.is('isDevelopment') || this.environmentManager.is('isTest')) {
            return false;
        }

        // Railway 환경이고 프로덕션 또는 스테이징 환경에서만 활성화
        return this.environmentManager.is('isRailwayDeployment') &&
            (this.environmentManager.is('isProduction') || this.environment === 'staging');
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
Railway 프로젝트: ${this.environmentManager.is('isRailwayDeployment') ? 'Railway Deployment' : 'Local/Other'}
총 로그 수: ${logs.length}개
생성 시간: ${new Date().toLocaleString('ko-KR')}
=================================================================

`;

        // 로그를 시간순으로 정렬
        const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const logEntries = sortedLogs
            .map(log => {
                const timestamp = new Date(log.timestamp).toLocaleString('ko-KR');
                const level = log.level.toUpperCase().padEnd(8);
                const metaStr =
                    log.meta && Object.keys(log.meta).length > 0
                        ? `\n    메타데이터: ${JSON.stringify(log.meta, null, 4)}`
                        : '';

                return `[${timestamp}] ${level} ${log.message}${metaStr}`;
            })
            .join('\n\n');

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

                ${logs
                .map(
                    log => `
                    <div class="log-item">
                        <div class="timestamp">${new Date(log.timestamp).toLocaleString('ko-KR')}</div>
                        <div class="message">${log.message}</div>
                        ${log.meta && Object.keys(log.meta).length > 0 ? `<div class="meta">${JSON.stringify(log.meta, null, 2)}</div>` : ''}
                    </div>
                `
                )
                .join('')}

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
        // 개발환경, 로컬 테스트 환경에서는 긴급 로그 이메일 전송 비활성화
        if (!this.shouldSendCriticalEmail() || !this.criticalLogBuffer) return;

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
                stack: this.environmentManager.is('enableStackTrace') ? error.stack : undefined
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
        const userInfo = req.session?.user
            ? {
                username: req.session.user.username,
                role: req.session.user.role
            }
            : null;

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
        if (this.environmentManager.is('isTest') && this.environment !== 'local-test') {
            return;
        }

        this.info('==== 환경 설정 정보 ====');
        this.info(`현재 환경: ${this.environment}`);
        this.info(`로그 레벨: ${this.getLogLevel()}`);
        this.info(`프로덕션 환경: ${this.environmentManager.is('isProduction') ? 'Yes' : 'No'}`);
        this.info(`개발 환경: ${this.environmentManager.is('isDevelopment') ? 'Yes' : 'No'}`);
        this.info(`테스트 환경: ${this.environmentManager.is('isTest') ? 'Yes' : 'No'}`);
        this.info(`Railway 배포: ${this.environmentManager.is('isRailwayDeployment') ? 'Yes' : 'No'}`);
        this.info(`스택 트레이스 활성화: ${this.environmentManager.is('enableStackTrace') ? 'Yes' : 'No'}`);
        this.info(`디버그 모드: ${this.environmentManager.is('enableDebugMode') ? 'Yes' : 'No'}`);
        this.info('=====================');
    }

    /**
     * 서버 시작 로그
     */
    logServerStart(port) {
        // test 환경에서는 서버 시작 로그 출력하지 않음
        if (this.environmentManager.is('isTest')) {
            return;
        }

        this.success(`서버가 포트 ${port}에서 실행 중입니다.`);
        this.info(`환경: ${this.environment}`);
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
            version: '1.0.0',
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
            severity: isAnomalous ? 'HIGH' : 'LOW'
        });
    }

    /**
     * 현재 로거 설정 로깅
     */
    logCurrentSettings() {
        this.info('📋 Logger 설정 정보', {
            environment: this.environment,
            logLevel: this.getLogLevel(),
            emailLogging: !!this.config?.email?.user,
            fileLogging: true,
            consoleLogging: true
        });
    }
}

// 싱글톤 인스턴스 생성
const logger = new WinstonLogger();

export default logger;
