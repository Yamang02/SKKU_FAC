import morgan from 'morgan';
import { logger } from '../config/logger.js';

// Morgan 로그 포맷 설정
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Morgan 스트림 설정
const stream = {
    write: (message) => logger.info(message.trim())
};

// Morgan 미들웨어 설정
export const httpLogger = morgan(morganFormat, {
    stream,
    skip: (_req) => process.env.NODE_ENV === 'test'
});
