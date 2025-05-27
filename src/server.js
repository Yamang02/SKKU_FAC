import logger from './common/utils/Logger.js';
import envValidator from './common/utils/EnvValidator.js';
import ServerManager from './common/utils/ServerManager.js';

// 환경 변수 검증
envValidator.validateAndSetDefaults();

// 환경 정보 출력
logger.logEnvironmentInfo();

// 동적으로 app 모듈 import 및 서버 시작
try {
    const { default: app } = await import('./app.js');

    const serverManager = new ServerManager(app);
    const PORT = envValidator.getEnvNumber('PORT', 3000);

    serverManager.start(PORT);

} catch (error) {
    logger.error('앱 모듈 임포트 실패', error);
    process.exit(1);
}
