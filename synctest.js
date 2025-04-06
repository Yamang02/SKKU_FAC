import { syncModels } from './src/infrastructure/db/models/relationships/ModelRelationships.js';

// syncModels 함수 실행
const runSyncModels = async () => {
    try {
        await syncModels();
        console.log('모델 동기화가 완료되었습니다.');
    } catch (error) {
        console.error('모델 동기화 중 오류 발생:', error);
    }
};

runSyncModels();
