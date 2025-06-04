import Config from './src/config/Config.js';
import { createTransport } from 'nodemailer';

console.log('🔍 이메일 설정 테스트 시작\n');

// Config 인스턴스 가져오기
const config = Config.getInstance();
const emailConfig = config.getEmailConfig();

console.log('📧 현재 이메일 설정:');
console.log('User:', emailConfig.user ? `${emailConfig.user.substring(0, 3)}***@${emailConfig.user.split('@')[1]}` : 'undefined');
console.log('Pass:', emailConfig.pass ? `${emailConfig.pass.substring(0, 4)}${'*'.repeat(Math.max(0, emailConfig.pass.length - 4))}` : 'undefined');
console.log('From:', emailConfig.from);
console.log('Admin Email:', emailConfig.adminEmail);
console.log('');

console.log('🔍 환경변수 직접 확인:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'undefined');
console.log('GMAIL_USER:', process.env.GMAIL_USER || 'undefined');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***masked***' : 'undefined');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '***masked***' : 'undefined');
console.log('');

// 이메일 설정이 유효한지 확인
if (!emailConfig.user || !emailConfig.pass) {
    console.error('❌ 이메일 설정이 불완전합니다.');
    console.log('필요한 환경변수: EMAIL_USER 또는 GMAIL_USER, EMAIL_PASS 또는 GMAIL_PASS');
    process.exit(1);
}

console.log('✅ 이메일 설정이 유효합니다. 연결 테스트를 시작합니다...\n');

async function testEmailConnection() {
    try {
        // Nodemailer transporter 생성
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        });

        console.log('📧 SMTP 연결 테스트 중...');

        // 연결 확인
        await transporter.verify();
        console.log('✅ SMTP 연결 성공!');

        // 테스트 이메일 전송 (선택사항)
        const shouldSendTestEmail = process.argv.includes('--send-test');

        if (shouldSendTestEmail) {
            console.log('📤 테스트 이메일 전송 중...');

            const mailOptions = {
                from: emailConfig.from || emailConfig.user,
                to: emailConfig.user, // 자기 자신에게
                subject: 'SKKU Gallery 이메일 설정 테스트',
                text: `이메일 설정이 올바르게 구성되었습니다.\n\n테스트 시간: ${new Date().toLocaleString('ko-KR')}\n환경: ${config.getEnvironment()}`
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ 테스트 이메일 전송 성공!');
            console.log('Message ID:', info.messageId);
        } else {
            console.log('💡 실제 이메일을 보내려면 --send-test 옵션을 추가하세요.');
        }

    } catch (error) {
        console.error('❌ 이메일 테스트 실패:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n💡 인증 오류 해결 방법:');
            console.log('1. Gmail 2단계 인증이 활성화되어 있는지 확인');
            console.log('2. 앱 비밀번호를 생성하여 사용 (16자리)');
            console.log('3. 일반 비밀번호가 아닌 앱 비밀번호를 사용해야 함');
        }

        process.exit(1);
    }
}

testEmailConnection();
