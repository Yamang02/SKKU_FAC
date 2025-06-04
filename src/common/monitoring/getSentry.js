/**
 * Sentry 에러 추적 시스템 설정
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import Config from '../../config/Config.js';
import logger from '../utils/Logger.js';

class SentryConfig {
    constructor() {
        this.config = Config.getInstance();
        this.environment = this.config.getEnvironment();
        this.dsn = process.env.SENTRY_DSN;
        this.isProduction = this.environment === 'production';
        this.isInitialized = false;

        this.init();
    }

    init() {
        // DSN이 없으면 로컬 에러 추적만 사용
        if (!this.dsn) {
            logger.info('🔄 Sentry DSN이 설정되지 않음 - 로컬 에러 추적 사용');
            return;
        }

        try {
            Sentry.init({
                dsn: this.dsn,
                environment: this.environment,
                integrations: [...(this.isProduction ? [nodeProfilingIntegration()] : [])],
                tracesSampleRate: this.isProduction ? 0.1 : 1.0,
                profilesSampleRate: this.isProduction ? 0.1 : 1.0,
                beforeSend(event) {
                    // 개발 환경에서는 민감한 정보 필터링
                    if (event.request) {
                        delete event.request.cookies;
                        delete event.request.headers?.authorization;
                    }
                    return event;
                }
            });

            this.isInitialized = true;
            logger.info('✅ Sentry 초기화 완료', {
                environment: this.environment,
                dsn: this.dsn.substring(0, 20) + '...'
            });
        } catch (error) {
            logger.error('❌ Sentry 초기화 실패', { error: error.message });
        }
    }

    /**
     * Sentry 요청 핸들러 미들웨어 반환
     * DSN이 없으면 pass-through 미들웨어 반환
     */
    getRequestHandler() {
        if (!this.isInitialized) {
            // DSN이 없거나 초기화 실패 시 pass-through 미들웨어
            return (req, res, next) => next();
        }
        return Sentry.requestHandler();
    }

    /**
     * Sentry 트레이싱 핸들러 미들웨어 반환
     * DSN이 없으면 pass-through 미들웨어 반환
     */
    getTracingHandler() {
        if (!this.isInitialized) {
            // DSN이 없거나 초기화 실패 시 pass-through 미들웨어
            return (req, res, next) => next();
        }
        return Sentry.tracingHandler();
    }

    /**
     * Sentry 에러 핸들러 미들웨어 반환
     * DSN이 없으면 pass-through 미들웨어 반환
     */
    getErrorHandler() {
        if (!this.isInitialized) {
            // DSN이 없거나 초기화 실패 시 기본 에러 핸들러
            return (error, req, res, next) => {
                logger.error('애플리케이션 에러', {
                    error: error.message,
                    stack: error.stack,
                    url: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                next(error);
            };
        }
        return Sentry.errorHandler();
    }

    /**
     * 에러를 Sentry에 수동으로 전송
     */
    captureException(error, context = {}) {
        if (!this.isInitialized) {
            logger.error('에러 캡처 (로컬)', { error: error.message, context });
            return;
        }

        Sentry.captureException(error, {
            tags: {
                environment: this.environment,
                ...context.tags
            },
            extra: context.extra || {},
            user: context.user || {}
        });
    }

    /**
     * 메시지를 Sentry에 전송
     */
    captureMessage(message, level = 'info', context = {}) {
        if (!this.isInitialized) {
            logger[level]('메시지 캡처 (로컬)', { message, context });
            return;
        }

        Sentry.captureMessage(message, level, {
            tags: {
                environment: this.environment,
                ...context.tags
            },
            extra: context.extra || {}
        });
    }

    /**
     * 사용자 컨텍스트 설정
     */
    setUser(user) {
        if (!this.isInitialized) return;

        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username
        });
    }

    /**
     * Sentry 초기화 상태 확인
     */
    isActive() {
        return this.isInitialized;
    }
}

// 싱글톤 인스턴스 생성
let sentryInstance = null;

function getSentry() {
    if (!sentryInstance) {
        sentryInstance = new SentryConfig();
    }
    return sentryInstance;
}

export default getSentry;
