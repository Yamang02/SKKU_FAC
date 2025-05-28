import { Router } from 'express';
import HealthController from './HealthController.js';

const CommonRouter = Router();

// 헬스체크 엔드포인트
CommonRouter.get('/health', (req, res) => HealthController.checkHealth(req, res));

export default CommonRouter;
