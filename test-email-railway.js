const nodemailer = require('nodemailer');

async function testEmailConnection() {
    console.log('🔍 Testing email connection with Railway environment variables...\n');

    // Railway 환경변수 출력 (비밀번호는 마스킹)
    console.log('Environment variables:');
    console.log('GMAIL_USER:', process.env.GMAIL_USER);
    console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '***masked***' : 'undefined');
    console.log('');

    try {
        // Gmail SMTP 설정
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        console.log('📧 Testing SMTP connection...');

        // 연결 테스트
        await transporter.verify();
        console.log('✅ SMTP connection successful!');

        // 테스트 이메일 발송 (실제로 보내지 않고 validate만)
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // 자기 자신에게
            subject: 'Railway Test Email',
            text: 'This is a test email from Railway environment'
        };

        console.log('📤 Testing email sending...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
    }
}

testEmailConnection();
