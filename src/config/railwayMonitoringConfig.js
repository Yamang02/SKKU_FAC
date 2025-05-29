/**
 * Railway 환경 최적화 모니터링 설정
 * 외부 서비스 없이 Railway 로그와 연동되는 가벼운 모니터링
 */

import ErrorReporter from '../common/monitoring/ErrorReporter.js';

/**
 * Railway 환경에 최적화된 에러 리포터 설정
 */
export const railwayErrorReporterConfig = {
    projectName: 'SKKU Gallery',

    // Railway에서는 기존 EMAIL 설정이 완전할 때만 이메일 알림 활성화
    enableNotifications: process.env.NODE_ENV === 'production' &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.ADMIN_EMAIL,

    // 이메일 설정 (기존 EMAIL_* 환경변수 사용)
    emailConfig: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? {
        smtp: {
            host: 'smtp.gmail.com', // Gmail 고정
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        },
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    } : null
};

/**
 * Railway에 최적화된 ErrorHandler 설정
 */
export const railwayErrorHandlerConfig = {
    // 기본 설정
    isDevelopment: process.env.NODE_ENV === 'development',
    includeStackTrace: process.env.NODE_ENV === 'development',
    enableDetailedLogging: true,

    // ErrorReporter 통합
    errorReporter: new ErrorReporter(railwayErrorReporterConfig),
    projectName: 'SKKU Gallery',
    enableNotifications: process.env.NODE_ENV === 'production' &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.ADMIN_EMAIL,
    emailConfig: railwayErrorReporterConfig.emailConfig,

    // 환경별 설정
    environmentConfig: {
        development: {
            includeStackTrace: true,
            enableDetailedLogging: true,
            logLevel: 'debug',
            showInternalErrors: true
        },
        production: {
            includeStackTrace: false,
            enableDetailedLogging: false,
            logLevel: 'error',
            showInternalErrors: false
        }
    },

    // Railway 로그 최적화 설정
    loggingConfig: {
        enableMetrics: true,
        excludeFields: ['password', 'token', 'authorization', 'cookie'],
        maxBodySize: 512, // Railway 로그 크기 제한 고려
        enableRequestId: true,
        customFields: {
            railway_service: process.env.RAILWAY_SERVICE_NAME || 'skku-gallery',
            railway_environment: process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV || 'development'
        }
    },

    // API/웹 응답 설정
    responseConfig: {
        enableCors: true,
        customHeaders: {
            'X-Service': 'SKKU-Gallery',
            'X-Environment': process.env.NODE_ENV || 'development'
        }
    },

    // Railway에서 자주 발생하는 불필요한 에러들 필터링
    filterRules: {
        // 봇, 크롤러 요청 무시
        ignoreUserAgents: [
            /googlebot/i,
            /bingbot/i,
            /slurp/i,
            /crawler/i,
            /spider/i,
            /facebookexternalhit/i
        ],

        // 자주 발생하는 404들 무시 (로그는 남기되 알림은 하지 않음)
        ignorePatterns: [
            /favicon\.ico$/,
            /robots\.txt$/,
            /\.well-known/,
            /wp-admin/,
            /phpMyAdmin/
        ],

        // 무시할 상태코드 (너무 빈번한 것들)
        ignoreStatusCodes: []  // Railway에서는 모든 에러를 로그로 남기는 것이 좋음
    },

    // 에러 메시지 사용자 친화화
    transformRules: {
        messageTransforms: {
            'ECONNREFUSED.*3306': '데이터베이스 연결에 실패했습니다.',
            'CLOUDINARY_.*': '이미지 업로드 서비스에 일시적인 문제가 발생했습니다.',
            'Redis connection.*': '세션 서비스에 일시적인 문제가 발생했습니다.'
        }
    }
};

/**
 * Railway 로그 필터링 가이드
 * Railway 대시보드에서 사용할 수 있는 필터 패턴들
 */
export const railwayLogFilters = {
    // 에러 관련 로그만 보기
    errorOnly: '🚨 ERROR_REPORT',

    // 심각도별 필터
    critical: '🚨 ERROR_REPORT | CRITICAL',
    high: '🚨 ERROR_REPORT | HIGH',
    medium: '🚨 ERROR_REPORT | MEDIUM',
    low: '🚨 ERROR_REPORT | LOW',

    // 특정 에러 ID 추적
    errorId: (id) => `🚨 ERROR_REPORT | ${id}`,

    // 서비스별 필터
    service: 'X-Service: SKKU-Gallery',

    // 환경별 필터
    production: 'railway_environment: production',
    development: 'railway_environment: development'
};

/**
 * Railway 모니터링 대시보드용 메트릭 수집기
 */
export class RailwayMetricsCollector {
    constructor() {
        this.metrics = {
            errors: {
                total: 0,
                byHour: {},
                byEndpoint: {},
                byUser: {}
            },
            performance: {
                responseTime: [],
                memoryUsage: [],
                lastCheck: Date.now()
            }
        };

        // 주기적 메트릭 수집
        this.startMetricsCollection();
    }

    /**
     * 에러 메트릭 기록
     */
    recordError(errorInfo, context) {
        const hour = new Date().getHours();
        const endpoint = context.url;
        const userId = context.userId || 'anonymous';

        this.metrics.errors.total++;
        this.metrics.errors.byHour[hour] = (this.metrics.errors.byHour[hour] || 0) + 1;
        this.metrics.errors.byEndpoint[endpoint] = (this.metrics.errors.byEndpoint[endpoint] || 0) + 1;
        this.metrics.errors.byUser[userId] = (this.metrics.errors.byUser[userId] || 0) + 1;
    }

    /**
     * 성능 메트릭 기록
     */
    recordPerformance(responseTime) {
        this.metrics.performance.responseTime.push({
            time: responseTime,
            timestamp: Date.now()
        });

        // 최근 100개만 유지
        if (this.metrics.performance.responseTime.length > 100) {
            this.metrics.performance.responseTime = this.metrics.performance.responseTime.slice(-100);
        }
    }

    /**
     * 메트릭 수집 시작
     */
    startMetricsCollection() {
        setInterval(() => {
            // 메모리 사용량 기록
            const memUsage = process.memoryUsage();
            this.metrics.performance.memoryUsage.push({
                ...memUsage,
                timestamp: Date.now()
            });

            // 최근 24시간 데이터만 유지
            if (this.metrics.performance.memoryUsage.length > 144) { // 10분마다 = 144개/24시간
                this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.slice(-144);
            }

            this.metrics.performance.lastCheck = Date.now();
        }, 10 * 60 * 1000); // 10분마다
    }

    /**
     * 메트릭 조회
     */
    getMetrics() {
        return {
            ...this.metrics,
            summary: {
                totalErrors: this.metrics.errors.total,
                avgMemoryUsage: this.getAverageMemoryUsage(),
                avgResponseTime: this.getAverageResponseTime(),
                topErrorEndpoints: this.getTopErrorEndpoints(5)
            }
        };
    }

    /**
     * 평균 메모리 사용량 계산
     */
    getAverageMemoryUsage() {
        if (this.metrics.performance.memoryUsage.length === 0) return 0;

        const total = this.metrics.performance.memoryUsage.reduce(
            (sum, usage) => sum + usage.heapUsed, 0
        );
        return Math.round(total / this.metrics.performance.memoryUsage.length / 1024 / 1024); // MB
    }

    /**
     * 평균 응답 시간 계산
     */
    getAverageResponseTime() {
        if (this.metrics.performance.responseTime.length === 0) return 0;

        const total = this.metrics.performance.responseTime.reduce(
            (sum, rt) => sum + rt.time, 0
        );
        return Math.round(total / this.metrics.performance.responseTime.length);
    }

    /**
     * 에러가 많은 엔드포인트 Top N
     */
    getTopErrorEndpoints(limit = 5) {
        return Object.entries(this.metrics.errors.byEndpoint)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([endpoint, count]) => ({ endpoint, count }));
    }
}

export default {
    railwayErrorReporterConfig,
    railwayErrorHandlerConfig,
    railwayLogFilters,
    RailwayMetricsCollector
};
