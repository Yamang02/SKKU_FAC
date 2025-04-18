import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.BASE_URL}/user/password/reset?token=${encodeURIComponent(token)}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: '비밀번호 재설정 요청',
        html: `<p>비밀 번호 재설정을 위해 아래 주소로 접속하세요:</p>
           <a href="${resetUrl}">${resetUrl}</a>`
    };

    await transporter.sendMail(mailOptions);
};


export const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${process.env.BASE_URL}/user/verify-email?token=${encodeURIComponent(token)}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: '이메일 인증 요청',
        html: `<p>아래 링크를 클릭하여 이메일 인증을 완료하세요:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>`
    };

    await transporter.sendMail(mailOptions);
};
