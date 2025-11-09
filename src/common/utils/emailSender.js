import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import Config from '../../config/Config.js';
import logger from './Logger.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();
const emailConfig = config.getEmailConfig();
const appConfig = config.getAppConfig();

// 이메일 제공자 확인 (기본값: resend)
const emailProvider = emailConfig.emailProvider || 'resend';

// 이메일 설정 디버그 정보 출력
logger.debug('📧 이메일 설정 로드됨:', {
    provider: emailProvider,
    from: emailConfig.from,
    hasResendApiKey: !!emailConfig.resendApiKey,
    resendApiKeyLength: emailConfig.resendApiKey ? emailConfig.resendApiKey.length : 0,
    hasUser: !!emailConfig.user,
    hasPass: !!emailConfig.pass
});

// Resend 클라이언트 초기화 (Resend 사용 시)
let resendClient = null;
if (emailProvider === 'resend' && emailConfig.resendApiKey) {
    resendClient = new Resend(emailConfig.resendApiKey);
    logger.info('✅ Resend 클라이언트 초기화 완료');
} else if (emailProvider === 'resend' && !emailConfig.resendApiKey) {
    logger.warn('⚠️ Resend를 사용하려면 RESEND_API_KEY 환경 변수가 필요합니다.');
}

// Gmail SMTP Transporter 초기화 (SMTP 사용 시)
let transporter = null;
if (emailProvider === 'smtp' && emailConfig.user && emailConfig.pass) {
    // Gmail 앱 비밀번호 형식 검증
    function validateGmailAppPassword(password) {
        if (!password) {
            return { valid: false, reason: '비밀번호가 설정되지 않음' };
        }
        if (password.length !== 16) {
            return { valid: false, reason: `길이가 올바르지 않음 (${password.length}자, 16자 필요)` };
        }
        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            return { valid: false, reason: '영문자와 숫자만 포함해야 함' };
        }
        return { valid: true, reason: '유효한 형식' };
    }

    const passwordValidation = validateGmailAppPassword(emailConfig.pass);
    if (!passwordValidation.valid) {
        logger.warn(`⚠️ Gmail 앱 비밀번호 형식 오류: ${passwordValidation.reason}`);
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
        }
    });
    logger.info('✅ Gmail SMTP Transporter 초기화 완료');
}

/**
 * Resend를 사용한 이메일 전송
 */
async function sendEmailViaResend(to, subject, html, text = null, attachments = []) {
    if (!resendClient) {
        throw new Error('Resend 클라이언트가 초기화되지 않았습니다. RESEND_API_KEY를 확인하세요.');
    }

    try {
        logger.debug('📤 Resend 이메일 전송 시도:', { to, subject });

        const emailData = {
            from: emailConfig.from || 'SKKU Gallery <onboarding@resend.dev>',
            to: [to],
            subject,
            html
        };

        if (text) {
            emailData.text = text;
        }

        if (attachments && attachments.length > 0) {
            emailData.attachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType
            }));
        }

        const result = await resendClient.emails.send(emailData);

        logger.info('✅ Resend 이메일 전송 성공:', {
            to,
            messageId: result.id,
            subject
        });

        return result;
    } catch (error) {
        const errorDetails = {
            to,
            subject,
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            resendConfig: {
                hasApiKey: !!emailConfig.resendApiKey,
                apiKeyLength: emailConfig.resendApiKey ? emailConfig.resendApiKey.length : 0,
                from: emailConfig.from
            }
        };

        logger.error('❌ Resend 이메일 전송 실패:', error, {
            to: errorDetails.to,
            subject: errorDetails.subject,
            timestamp: errorDetails.timestamp,
            errorName: errorDetails.error.name,
            errorMessage: errorDetails.error.message,
            hasResendApiKey: errorDetails.resendConfig.hasApiKey,
            resendApiKeyLength: errorDetails.resendConfig.apiKeyLength,
            resendFrom: errorDetails.resendConfig.from,
            errorStack: errorDetails.error.stack
        });
        throw error;
    }
}

/**
 * SMTP를 사용한 이메일 전송
 */
async function sendEmailViaSMTP(mailOptions) {
    if (!transporter) {
        throw new Error('SMTP Transporter가 초기화되지 않았습니다.');
    }

    try {
        logger.debug('📤 SMTP 이메일 전송 시도:', {
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const result = await transporter.sendMail(mailOptions);

        logger.info('✅ SMTP 이메일 전송 성공:', {
            to: mailOptions.to,
            messageId: result.messageId,
            response: result.response
        });

        return result;
    } catch (error) {
        const errorDetails = {
            to: mailOptions.to,
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                code: error.code,
                message: error.message,
                stack: error.stack,
                response: error.response,
                responseCode: error.responseCode,
                command: error.command,
                errno: error.errno,
                syscall: error.syscall,
                hostname: error.hostname,
                port: error.port
            },
            emailConfig: {
                user: emailConfig.user ? `${emailConfig.user.substring(0, 3)}***@${emailConfig.user.split('@')[1]}` : 'undefined',
                hasPassword: !!emailConfig.pass,
                passwordLength: emailConfig.pass ? emailConfig.pass.length : 0,
                from: emailConfig.from
            },
            transporter: {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587
            }
        };

        logger.error('❌ SMTP 이메일 전송 실패:', error, {
            to: errorDetails.to,
            timestamp: errorDetails.timestamp,
            errorCode: errorDetails.error.code,
            errorMessage: errorDetails.error.message,
            errorCommand: errorDetails.error.command,
            errorSyscall: errorDetails.error.syscall,
            errorHostname: errorDetails.error.hostname,
            errorPort: errorDetails.error.port,
            errorErrno: errorDetails.error.errno,
            emailUser: errorDetails.emailConfig.user,
            emailHasPassword: errorDetails.emailConfig.hasPassword,
            emailPasswordLength: errorDetails.emailConfig.passwordLength,
            emailFrom: errorDetails.emailConfig.from,
            transporterService: errorDetails.transporter.service,
            transporterHost: errorDetails.transporter.host,
            transporterPort: errorDetails.transporter.port,
            errorStack: errorDetails.error.stack
        });
        throw error;
    }
}

/**
 * 비밀번호 재설정 이메일 전송
 */
export const sendPasswordResetEmail = async (to, token) => {
    const baseUrl = appConfig.baseUrl || `http://localhost:${appConfig.port}`;
    const resetUrl = `${baseUrl}/user/password/reset?token=${token}`;

    const subject = '비밀번호 재설정 요청';
    const html = `<p>비밀 번호 재설정을 위해 아래 주소로 접속하세요:</p>
       <a href="${resetUrl}">${resetUrl}</a>`;

    if (emailProvider === 'resend') {
        return await sendEmailViaResend(to, subject, html);
    } else {
        return await sendEmailViaSMTP({
            from: emailConfig.from,
            to,
            subject,
            html
        });
    }
};

/**
 * 이메일 인증 이메일 전송
 */
export const sendVerificationEmail = async (to, token) => {
    const baseUrl = appConfig.baseUrl || `http://localhost:${appConfig.port}`;
    const verifyUrl = `${baseUrl}/user/verify-email?token=${token}`;

    const subject = '이메일 인증 요청';
    const html = `<p>아래 링크를 클릭하여 이메일 인증을 완료하세요:</p>
       <a href="${verifyUrl}">${verifyUrl}</a>`;

    if (emailProvider === 'resend') {
        return await sendEmailViaResend(to, subject, html);
    } else {
        return await sendEmailViaSMTP({
            from: emailConfig.from,
            to,
            subject,
            html
        });
    }
};

/**
 * 로그 알림 이메일 전송
 */
export const sendLogNotificationEmail = async (to, subject, htmlContent) => {
    if (emailProvider === 'resend') {
        return await sendEmailViaResend(to, subject, htmlContent);
    } else {
        return await sendEmailViaSMTP({
            from: emailConfig.from,
            to,
            subject,
            html: htmlContent
        });
    }
};

/**
 * 일별 로그 파일 이메일 전송
 */
export const sendDailyLogFileEmail = async (to, subject, logContent, filename) => {
    const text = `SKKU Gallery 일별 로그 파일을 첨부합니다.\n\n파일명: ${filename}\n생성 시간: ${new Date().toLocaleString('ko-KR')}`;

    if (emailProvider === 'resend') {
        const attachments = [{
            filename: filename,
            content: logContent,
            contentType: 'text/plain; charset=utf-8'
        }];
        return await sendEmailViaResend(to, subject, text, text, attachments);
    } else {
        return await sendEmailViaSMTP({
            from: emailConfig.from,
            to,
            subject,
            text,
            attachments: [
                {
                    filename: filename,
                    content: logContent,
                    contentType: 'text/plain; charset=utf-8'
                }
            ]
        });
    }
};
