import nodemailer from 'nodemailer';
import Config from '../../config/Config.js';
import logger from './Logger.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();
const emailConfig = config.getEmailConfig();
const appConfig = config.getAppConfig();

// 이메일 설정 디버그 정보 출력 (비밀번호는 마스킹)
logger.debug('📧 이메일 설정 로드됨:', {
    user: emailConfig.user ? `${emailConfig.user.substring(0, 3)}***@${emailConfig.user.split('@')[1] || 'unknown'}` : 'undefined',
    pass: emailConfig.pass ? `${emailConfig.pass.substring(0, 4)}${'*'.repeat(Math.max(0, emailConfig.pass.length - 4))}` : 'undefined',
    from: emailConfig.from,
    hasUser: !!emailConfig.user,
    hasPass: !!emailConfig.pass,
    passLength: emailConfig.pass ? emailConfig.pass.length : 0
});

// 환경 변수 직접 확인
logger.debug('🔍 환경 변수 직접 확인:', {
    EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***@${process.env.EMAIL_USER.split('@')[1] || 'unknown'}` : 'undefined',
    EMAIL_PASS: process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}${'*'.repeat(Math.max(0, process.env.EMAIL_PASS.length - 4))}` : 'undefined',
    EMAIL_FROM: process.env.EMAIL_FROM,
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
    emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
});

// Gmail 앱 비밀번호 형식 검증
function validateGmailAppPassword(password) {
    if (!password) {
        return { valid: false, reason: '비밀번호가 설정되지 않음' };
    }

    // Gmail 앱 비밀번호는 16자리여야 함
    if (password.length !== 16) {
        return { valid: false, reason: `길이가 올바르지 않음 (${password.length}자, 16자 필요)` };
    }

    // 영문자와 숫자만 포함해야 함
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
        return { valid: false, reason: '영문자와 숫자만 포함해야 함' };
    }

    return { valid: true, reason: '유효한 형식' };
}

// Gmail 앱 비밀번호 검증
const passwordValidation = validateGmailAppPassword(emailConfig.pass);
logger.debug('🔐 Gmail 앱 비밀번호 검증:', passwordValidation);

if (!passwordValidation.valid) {
    logger.warn(`⚠️ Gmail 앱 비밀번호 형식 오류: ${passwordValidation.reason}`);
    logger.info('💡 Gmail 앱 비밀번호 생성 방법:');
    logger.info('   1. Google 계정 관리 → 보안 → 2단계 인증 활성화');
    logger.info('   2. 앱 비밀번호 생성 → 메일 → 사용자 지정 이름 입력');
    logger.info('   3. 생성된 16자리 비밀번호를 EMAIL_PASS에 설정');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

export const sendPasswordResetEmail = async (to, token) => {
    const baseUrl = appConfig.baseUrl || `http://localhost:${appConfig.port}`;

    const mailOptions = {
        from: emailConfig.from,
        to,
        subject: '비밀번호 재설정 요청',
        html: `<p>비밀 번호 재설정을 위해 아래 주소로 접속하세요:</p>
           <a href="${baseUrl}/user/password/reset?token=${token}">${baseUrl}/user/password/reset?token=${token}</a>`
    };

    try {
        logger.debug('📤 비밀번호 재설정 이메일 전송 시도:', { to });
        const result = await transporter.sendMail(mailOptions);
        logger.info('✅ 비밀번호 재설정 이메일 전송 성공:', { to, messageId: result.messageId });
        return result;
    } catch (error) {
        const errorDetails = {
            to,
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
        logger.error('❌ 비밀번호 재설정 이메일 전송 실패:', errorDetails);
        throw error;
    }
};

export const sendVerificationEmail = async (to, token) => {
    const baseUrl = appConfig.baseUrl || `http://localhost:${appConfig.port}`;
    const verifyUrl = `${baseUrl}/user/verify-email?token=${token}`;

    const mailOptions = {
        from: emailConfig.from,
        to,
        subject: '이메일 인증 요청',
        html: `<p>아래 링크를 클릭하여 이메일 인증을 완료하세요:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>`
    };

    try {
        logger.debug('📤 이메일 전송 시도:', {
            to: to,
            from: emailConfig.from,
            subject: mailOptions.subject,
            transporterConfig: {
                service: 'gmail',
                user: emailConfig.user ? `${emailConfig.user.substring(0, 3)}***@${emailConfig.user.split('@')[1]}` : 'undefined',
                hasPassword: !!emailConfig.pass,
                passwordLength: emailConfig.pass ? emailConfig.pass.length : 0
            }
        });

        const result = await transporter.sendMail(mailOptions);

        logger.info('✅ 이메일 전송 성공:', {
            to: to,
            messageId: result.messageId,
            response: result.response
        });

        return result;
    } catch (error) {
        // 상세한 오류 추적 정보 수집
        const errorDetails = {
            to: to,
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
                from: emailConfig.from,
                hasUser: !!emailConfig.user,
                hasPass: !!emailConfig.pass
            },
            transporter: {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587
            }
        };

        logger.error('❌ 이메일 전송 실패:', errorDetails);
        throw error;
    }
};

export const sendLogNotificationEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        html: htmlContent
    };

    try {
        logger.debug('📤 로그 알림 이메일 전송 시도:', { to, subject });
        const result = await transporter.sendMail(mailOptions);
        logger.info('✅ 로그 알림 이메일 전송 성공:', { to, messageId: result.messageId });
        return result;
    } catch (error) {
        const errorDetails = {
            to,
            subject,
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
        logger.error('❌ 로그 알림 이메일 전송 실패:', errorDetails);
        throw error;
    }
};

export const sendDailyLogFileEmail = async (to, subject, logContent, filename) => {
    const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        text: `SKKU Gallery 일별 로그 파일을 첨부합니다.\n\n파일명: ${filename}\n생성 시간: ${new Date().toLocaleString('ko-KR')}`,
        attachments: [
            {
                filename: filename,
                content: logContent,
                contentType: 'text/plain; charset=utf-8'
            }
        ]
    };

    try {
        logger.debug('📤 일별 로그 파일 이메일 전송 시도:', { to, subject, filename });
        const result = await transporter.sendMail(mailOptions);
        logger.info('✅ 일별 로그 파일 이메일 전송 성공:', { to, messageId: result.messageId });
        return result;
    } catch (error) {
        const errorDetails = {
            to,
            subject,
            filename,
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
        logger.error('❌ 일별 로그 파일 이메일 전송 실패:', errorDetails);
        throw error;
    }
};
