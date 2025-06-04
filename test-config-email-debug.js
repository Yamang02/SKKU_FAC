import Config from './src/config/Config.js';

console.log('🔍 Config 이메일 설정 디버그 시작\n');

try {
    // Config 인스턴스 가져오기
    const config = Config.getInstance();

    console.log('📧 Config.getEmailConfig() 결과:');
    const emailConfig = config.getEmailConfig();
    console.log('User:', emailConfig.user);
    console.log('Pass length:', emailConfig.pass ? emailConfig.pass.length : 'undefined');
    console.log('Pass (first 4 chars):', emailConfig.pass ? emailConfig.pass.substring(0, 4) + '***' : 'undefined');
    console.log('From:', emailConfig.from);
    console.log('Admin Email:', emailConfig.adminEmail);
    console.log('');

    console.log('🔍 환경변수 직접 확인:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
    console.log('EMAIL_PASS (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '***' : 'undefined');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    console.log('');

    console.log('🔑 Config.get() 방식으로 이메일 설정 확인:');
    const storedEmail = config.get('email');
    if (storedEmail) {
        console.log('Stored email config found:');
        console.log('User:', storedEmail.user);
        console.log('Pass length:', storedEmail.pass ? storedEmail.pass.length : 'undefined');
        console.log('Pass (first 4 chars):', storedEmail.pass ? storedEmail.pass.substring(0, 4) + '***' : 'undefined');
        console.log('From:', storedEmail.from);
        console.log('Admin Email:', storedEmail.adminEmail);
    } else {
        console.log('No stored email config found');
    }
    console.log('');

    console.log('🔐 개별 키로 확인:');
    const emailUser = config.get('email.user');
    const emailPass = config.get('email.pass');
    const emailFrom = config.get('email.from');
    const adminEmail = config.get('email.adminEmail');

    console.log('email.user:', emailUser);
    console.log('email.pass length:', emailPass ? emailPass.length : 'undefined');
    console.log('email.pass (first 4 chars):', emailPass ? emailPass.substring(0, 4) + '***' : 'undefined');
    console.log('email.from:', emailFrom);
    console.log('email.adminEmail:', adminEmail);
    console.log('');

    console.log('📊 비교 분석:');
    console.log('환경변수 EMAIL_PASS와 config email.pass가 같은가?', process.env.EMAIL_PASS === emailPass);
    console.log('Config getEmailConfig().pass와 config.get("email.pass")가 같은가?', emailConfig.pass === emailPass);

} catch (error) {
    console.error('❌ Config 디버그 실패:', error);
    console.error(error.stack);
}
