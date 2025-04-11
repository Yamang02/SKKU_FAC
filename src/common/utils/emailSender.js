import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${process.env.BASE_URL}/user/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: '이메일 인증 요청',
        html: `<p>아래 링크를 클릭하여 이메일 인증을 완료하세요:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>`
    };

    console.log('mailOptions:', mailOptions);

    await transporter.sendMail(mailOptions);
};
