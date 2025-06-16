/**
 * Railway 환경 최적화 에러 리포터
 * 외부 서비스 없이 구조화된 로그와 선택적 이메일 알림 제공
 */

import logger from '../utils/Logger.js';
import { ErrorSeverity } from '../error/BaseError.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import config from '../../config/Config.js';

export class ErrorReporter {
    constructor(options = {}) {
        this.config = config;
        this.projectName = options.projectName || 'SKKU Gallery';
        this.environment = this.config.getEnvironment();
        this.notificationEnabled = options.enableNotifications ?? this.environment === 'production';
        this.emailConfig = options.emailConfig || null;

        // 에러 버퍼 (중복 방지)
        this.errorBuffer = new Map();
        this.bufferCleanupInterval = 5 * 60 * 1000; // 5분

        // 이메일 알림 제한 (스팸 방지)
        this.lastNotificationTimes = new Map();
        this.notificationCooldown = 10 * 60 * 1000; // 10분

        this.initializeCleanup();
    }

    /**
     * 에러 리포팅
     * @param {Error} error - 에러 객체
     * @param {Object} context - 추가 컨텍스트
     * @param {string} severity - 에러 심각도
     */
    async reportError(error, context = {}, severity = ErrorSeverity.MEDIUM) {
        const errorReport = this.createErrorReport(error, context, severity);

        // Railway 로그에 구조화된 형태로 출력
        this.logToRailway(errorReport);

        // 중요한 에러인 경우 이메일 알림
        if (this.shouldSendNotification(errorReport)) {
            await this.sendEmailNotification(errorReport);
        }

        // 중복 에러 추적
        this.trackErrorOccurrence(errorReport);
    }

    /**
     * 구조화된 에러 리포트 생성
     * @param {Error} error - 에러 객체
     * @param {Object} context - 컨텍스트
     * @param {string} severity - 심각도
     * @returns {Object} 에러 리포트
     */
    createErrorReport(error, context, severity) {
        const timestamp = new Date().toISOString();
        const errorId = this.generateErrorId(error);

        return {
            // Railway 필터링용 태그
            project: this.projectName,
            environment: this.environment,
            severity,
            errorId,
            timestamp,

            // 에러 정보
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                statusCode: error.statusCode
            },

            // 컨텍스트 정보
            context: {
                url: context.url,
                method: context.method,
                userId: context.userId,
                ip: context.ip,
                userAgent: context.userAgent,
                referer: context.referer,
                ...context.extra
            },

            // Railway 메타데이터
            meta: {
                nodeVersion: process.version,
                platform: process.platform,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };
    }

    /**
     * Railway 로그에 구조화된 형태로 출력
     * @param {Object} errorReport - 에러 리포트
     */
    logToRailway(errorReport) {
        const { severity, errorId, error, context } = errorReport;

        // Railway에서 쉽게 필터링할 수 있는 형태로 로그 출력
        const logMessage = `🚨 ERROR_REPORT | ${errorId}`;
        const logData = {
            errorId,
            severity,
            project: this.projectName,
            environment: this.environment,
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.statusCode
            },
            context: {
                url: context.url,
                method: context.method,
                userId: context.userId,
                ip: context.ip
            },
            timestamp: errorReport.timestamp
        };

        // 심각도에 따른 로그 레벨 선택
        switch (severity) {
        case ErrorSeverity.CRITICAL:
            logger.error(`${logMessage} | CRITICAL`, logData);
            break;
        case ErrorSeverity.HIGH:
            logger.error(`${logMessage} | HIGH`, logData);
            break;
        case ErrorSeverity.MEDIUM:
            logger.warn(`${logMessage} | MEDIUM`, logData);
            break;
        case ErrorSeverity.LOW:
        default:
            logger.info(`${logMessage} | LOW`, logData);
            break;
        }

        // 개발 환경에서는 스택 트레이스도 출력
        if (this.environment === 'development' && error.stack) {
            logger.debug(`Stack trace for ${errorId}:`, error.stack);
        }
    }

    /**
     * 이메일 알림 전송 여부 판단
     * @param {Object} errorReport - 에러 리포트
     * @returns {boolean}
     */
    shouldSendNotification(errorReport) {
        if (!this.notificationEnabled || !this.emailConfig) {
            return false;
        }

        const { severity, errorId } = errorReport;

        // CRITICAL과 HIGH 심각도만 이메일 발송
        if (severity !== ErrorSeverity.CRITICAL && severity !== ErrorSeverity.HIGH) {
            return false;
        }

        // 쿨다운 시간 체크 (같은 에러의 스팸 방지)
        const lastNotification = this.lastNotificationTimes.get(errorId);
        if (lastNotification && Date.now() - lastNotification < this.notificationCooldown) {
            return false;
        }

        return true;
    }

    /**
     * 이메일 알림 전송
     * @param {Object} errorReport - 에러 리포트
     */
    async sendEmailNotification(errorReport) {
        if (!this.emailConfig) return;

        try {
            const transporter = nodemailer.createTransporter(this.emailConfig.smtp);

            const subject = `🚨 [${this.projectName}] ${errorReport.severity} Error - ${errorReport.error.name}`;
            const htmlContent = this.generateEmailHTML(errorReport);

            await transporter.sendMail({
                from: this.emailConfig.from,
                to: this.emailConfig.to,
                subject,
                html: htmlContent
            });

            // 알림 시간 기록
            this.lastNotificationTimes.set(errorReport.errorId, Date.now());

            logger.info(`Error notification sent for ${errorReport.errorId}`);
        } catch (emailError) {
            logger.error('Failed to send error notification email', emailError);
        }
    }

    /**
     * 이메일 HTML 생성
     * @param {Object} errorReport - 에러 리포트
     * @returns {string} HTML 내용
     */
    generateEmailHTML(errorReport) {
        const { error, context, timestamp, severity, errorId } = errorReport;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: ${severity === ErrorSeverity.CRITICAL ? '#dc3545' : '#fd7e14'}; color: white; padding: 15px; border-radius: 5px; }
                .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #333; }
                .code { background-color: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; white-space: pre-wrap; }
                .context-table { width: 100%; border-collapse: collapse; }
                .context-table th, .context-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .context-table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🚨 ${severity} Error Detected</h2>
                <p><strong>Project:</strong> ${this.projectName} (${this.environment})</p>
                <p><strong>Error ID:</strong> ${errorId}</p>
                <p><strong>Time:</strong> ${timestamp}</p>
            </div>

            <div class="content">
                <div class="section">
                    <div class="label">Error Details:</div>
                    <div class="code">
Name: ${error.name}
Message: ${error.message}
Code: ${error.code || 'N/A'}
Status: ${error.statusCode || 'N/A'}
                    </div>
                </div>

                <div class="section">
                    <div class="label">Request Context:</div>
                    <table class="context-table">
                        <tr><th>URL</th><td>${context.url || 'N/A'}</td></tr>
                        <tr><th>Method</th><td>${context.method || 'N/A'}</td></tr>
                        <tr><th>User ID</th><td>${context.userId || 'Anonymous'}</td></tr>
                        <tr><th>IP Address</th><td>${context.ip || 'N/A'}</td></tr>
                        <tr><th>User Agent</th><td>${context.userAgent || 'N/A'}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <div class="label">Stack Trace:</div>
                    <div class="code">${error.stack || 'No stack trace available'}</div>
                </div>

                <div class="section">
                    <p><strong>Railway Log Filter:</strong> <code>🚨 ERROR_REPORT | ${errorId}</code></p>
                    <p><em>Use this filter in Railway logs to find related entries.</em></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * 에러 ID 생성
     * @param {Error} error - 에러 객체
     * @returns {string} 에러 ID
     */
    generateErrorId(error) {
        const errorSignature = `${error.name}_${error.message}_${error.code || 'unknown'}`;
        const hash = crypto.createHash('md5').update(errorSignature).digest('hex');
        return `ERR_${hash.substring(0, 8).toUpperCase()}`;
    }

    /**
     * 에러 발생 추적
     * @param {Object} errorReport - 에러 리포트
     */
    trackErrorOccurrence(errorReport) {
        const { errorId } = errorReport;
        const current = this.errorBuffer.get(errorId) || { count: 0, firstSeen: Date.now(), lastSeen: Date.now() };

        current.count++;
        current.lastSeen = Date.now();

        this.errorBuffer.set(errorId, current);

        // 반복 에러 감지
        if (current.count > 1) {
            logger.warn(`Repeated error detected: ${errorId} (${current.count} times)`);
        }
    }

    /**
     * 버퍼 정리 초기화
     */
    initializeCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [errorId, data] of this.errorBuffer.entries()) {
                if (now - data.lastSeen > this.bufferCleanupInterval) {
                    this.errorBuffer.delete(errorId);
                }
            }

            // 알림 시간 정리
            for (const [errorId, time] of this.lastNotificationTimes.entries()) {
                if (now - time > this.notificationCooldown * 2) {
                    this.lastNotificationTimes.delete(errorId);
                }
            }
        }, this.bufferCleanupInterval);
    }

    /**
     * 설정 업데이트
     * @param {Object} newConfig - 새 설정
     */
    updateConfig(newConfig) {
        if (newConfig.notificationEnabled !== undefined) {
            this.notificationEnabled = newConfig.notificationEnabled;
        }
        if (newConfig.emailConfig) {
            this.emailConfig = newConfig.emailConfig;
        }
    }

    /**
     * 에러 통계 조회
     * @returns {Object} 에러 통계
     */
    getErrorStats() {
        const stats = {
            totalUniqueErrors: this.errorBuffer.size,
            errors: []
        };

        for (const [errorId, data] of this.errorBuffer.entries()) {
            stats.errors.push({
                errorId,
                count: data.count,
                firstSeen: new Date(data.firstSeen).toISOString(),
                lastSeen: new Date(data.lastSeen).toISOString()
            });
        }

        stats.errors.sort((a, b) => b.count - a.count);
        return stats;
    }
}

export default ErrorReporter;
