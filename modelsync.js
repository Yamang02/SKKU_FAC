
import { syncModels } from './src/infrastructure/db/model/relationship/ModelRelationships.js';

const runSync = async () => {
    try {
        await syncModels();
        console.log('모델 동기화 완료');
    } catch (error) {
        console.error('모델 동기화 중 오류 발생:', error);
    }
};

runSync();
