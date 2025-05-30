import Config from './Config.js';

// Config 인스턴스 가져오기
const config = Config.getInstance();

// 새로운 방식으로 설정에 접근하는 함수들 제공
const getDatabaseConfig = () => {
    return config.getDatabaseConfig();
};

// 기존 코드와의 호환성을 위해 infrastructureConfig 객체를 유지
// 하지만 내부적으로는 새로운 Config 클래스를 사용
export const infrastructureConfig = {
    environment: config.getEnvironment(),
    database: {
        type: config.getEnvironment() === 'production' ? 'remote' : 'local',
        config: getDatabaseConfig()
    },
    storage: {
        config: config.getStorageConfig()
    },
    redis: {
        config: config.getRedisConfig()
    }
};

export const getStorageConfig = () => config.getStorageConfig();
export const getRedisConfig = () => config.getRedisConfig();
export const getEnvironment = () => config.getEnvironment();
export { getDatabaseConfig };

// 프로덕션 환경에서 로그 출력
if (config.getEnvironment() === 'production') {
    console.log('Infrastructure configuration loaded for production');
}

// 기본 내보내기로 새로운 config 인스턴스 제공
export default config;
