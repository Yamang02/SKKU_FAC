import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그 디렉토리 설정
const logDir = path.join(__dirname, '../../logs');

// Pino 로거 설정
export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            levelFirst: true,
            messageFormat: false,
            singleLine: true
        }
    },
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            query: req.query,
            body: req.body
        }),
        res: (res) => ({
            statusCode: res.statusCode
        }),
        err: (err) => ({
            type: err.type,
            message: err.message,
            stack: err.stack
        })
    },
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}, pino.destination({
    dest: path.join(logDir, 'app.log'),
    sync: false,
    mkdir: true,
    mode: 0o644
}));

// 에러 로거 설정
export const errorLogger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            levelFirst: true,
            messageFormat: '{msg}'
        }
    },
    level: 'error'
}, pino.destination({
    dest: path.join(logDir, 'error.log'),
    sync: false,
    mkdir: true,
    mode: 0o644,
    encoding: 'utf8'
}));

// 성능 로거 설정
export const performanceLogger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            levelFirst: true,
            messageFormat: '{msg}'
        }
    },
    level: 'info'
}, pino.destination({
    dest: path.join(logDir, 'performance.log'),
    sync: false,
    mkdir: true,
    mode: 0o644,
    encoding: 'utf8'
}));
