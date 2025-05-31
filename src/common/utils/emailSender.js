import nodemailer from 'nodemailer';
import Config from '../../config/Config.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();
const emailConfig = config.getEmailConfig();
const appConfig = config.getAppConfig();

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

    await transporter.sendMail(mailOptions);
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

    await transporter.sendMail(mailOptions);
};

export const sendLogNotificationEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
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

    await transporter.sendMail(mailOptions);
};
