import db from '../adapter/database.js';
import logger from '../../../common/utils/Logger.js';

/**
 * 트랜잭션 관리자
 * 데이터베이스 트랜잭션의 생성, 커밋, 롤백을 표준화된 방식으로 관리합니다.
 */
export default class TransactionManager {
    /**
     * 새로운 트랜잭션을 시작합니다.
     * @param {object} options - 트랜잭션 옵션
     * @param {string} options.isolationLevel - 격리 수준 (READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE)
     * @param {boolean} options.autocommit - 자동 커밋 여부 (기본값: false)
     * @param {number} options.timeout - 타임아웃 (밀리초)
     * @returns {Promise<Transaction>} Sequelize 트랜잭션 객체
     */
    static async beginTransaction(options = {}) {
        try {
            const transactionOptions = {};

            // 격리 수준 설정
            if (options.isolationLevel) {
                transactionOptions.isolationLevel = db.Transaction.ISOLATION_LEVELS[options.isolationLevel];
            }

            // 자동 커밋 설정
            if (options.autocommit !== undefined) {
                transactionOptions.autocommit = options.autocommit;
            }

            // 타임아웃 설정
            if (options.timeout) {
                transactionOptions.timeout = options.timeout;
            }

            const transaction = await db.transaction(transactionOptions);

            logger.debug('Transaction started', {
                transactionId: transaction.id,
                isolationLevel: options.isolationLevel,
                timeout: options.timeout
            });

            return transaction;
        } catch (error) {
            logger.error('Failed to begin transaction', { error: error.message });
            throw error;
        }
    }

    /**
     * 트랜잭션을 커밋합니다.
     * @param {Transaction} transaction - 커밋할 트랜잭션
     * @returns {Promise<void>}
     */
    static async commitTransaction(transaction) {
        if (!transaction) {
            throw new Error('Transaction is required for commit');
        }

        try {
            await transaction.commit();
            logger.debug('Transaction committed', { transactionId: transaction.id });
        } catch (error) {
            logger.error('Failed to commit transaction', {
                transactionId: transaction.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 트랜잭션을 롤백합니다.
     * @param {Transaction} transaction - 롤백할 트랜잭션
     * @returns {Promise<void>}
     */
    static async rollbackTransaction(transaction) {
        if (!transaction) {
            logger.warn('Attempted to rollback null transaction');
            return;
        }

        try {
            await transaction.rollback();
            logger.debug('Transaction rolled back', { transactionId: transaction.id });
        } catch (error) {
            logger.error('Failed to rollback transaction', {
                transactionId: transaction.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 트랜잭션 내에서 함수를 실행합니다.
     * 함수가 성공하면 자동으로 커밋하고, 실패하면 자동으로 롤백합니다.
     * @param {Function} callback - 트랜잭션 내에서 실행할 함수
     * @param {object} options - 트랜잭션 옵션
     * @returns {Promise<any>} 콜백 함수의 반환값
     */
    static async executeInTransaction(callback, options = {}) {
        const transaction = await this.beginTransaction(options);

        try {
            const result = await callback(transaction);
            await this.commitTransaction(transaction);
            return result;
        } catch (error) {
            await this.rollbackTransaction(transaction);
            throw error;
        }
    }

    /**
     * 중첩된 트랜잭션(세이브포인트)을 생성합니다.
     * @param {Transaction} parentTransaction - 부모 트랜잭션
     * @param {string} savepointName - 세이브포인트 이름
     * @returns {Promise<Transaction>} 중첩 트랜잭션 객체
     */
    static async createSavepoint(parentTransaction, savepointName) {
        if (!parentTransaction) {
            throw new Error('Parent transaction is required for savepoint');
        }

        try {
            const savepoint = await parentTransaction.createSavepoint(savepointName);
            logger.debug('Savepoint created', {
                parentTransactionId: parentTransaction.id,
                savepointName
            });
            return savepoint;
        } catch (error) {
            logger.error('Failed to create savepoint', {
                parentTransactionId: parentTransaction.id,
                savepointName,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 세이브포인트로 롤백합니다.
     * @param {Transaction} transaction - 트랜잭션 객체
     * @param {string} savepointName - 롤백할 세이브포인트 이름
     * @returns {Promise<void>}
     */
    static async rollbackToSavepoint(transaction, savepointName) {
        if (!transaction) {
            throw new Error('Transaction is required for savepoint rollback');
        }

        try {
            await transaction.rollbackToSavepoint(savepointName);
            logger.debug('Rolled back to savepoint', {
                transactionId: transaction.id,
                savepointName
            });
        } catch (error) {
            logger.error('Failed to rollback to savepoint', {
                transactionId: transaction.id,
                savepointName,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 트랜잭션의 현재 상태를 확인합니다.
     * @param {Transaction} transaction - 확인할 트랜잭션
     * @returns {string} 트랜잭션 상태 ('pending', 'committed', 'rolledback')
     */
    static getTransactionStatus(transaction) {
        if (!transaction) {
            return 'none';
        }

        if (transaction.finished === 'commit') {
            return 'committed';
        } else if (transaction.finished === 'rollback') {
            return 'rolledback';
        } else {
            return 'pending';
        }
    }

    /**
     * 활성 트랜잭션인지 확인합니다.
     * @param {Transaction} transaction - 확인할 트랜잭션
     * @returns {boolean} 활성 상태 여부
     */
    static isActiveTransaction(transaction) {
        return transaction && this.getTransactionStatus(transaction) === 'pending';
    }

    /**
     * 트랜잭션 타임아웃을 설정합니다.
     * @param {Transaction} transaction - 트랜잭션 객체
     * @param {number} timeoutMs - 타임아웃 시간 (밀리초)
     * @returns {Promise<void>}
     */
    static async setTransactionTimeout(transaction, timeoutMs) {
        if (!transaction) {
            throw new Error('Transaction is required for timeout setting');
        }

        try {
            await transaction.setTimeout(timeoutMs);
            logger.debug('Transaction timeout set', {
                transactionId: transaction.id,
                timeoutMs
            });
        } catch (error) {
            logger.error('Failed to set transaction timeout', {
                transactionId: transaction.id,
                timeoutMs,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 데이터베이스 연결 상태를 확인합니다.
     * @returns {Promise<boolean>} 연결 상태
     */
    static async checkDatabaseConnection() {
        try {
            await db.authenticate();
            return true;
        } catch (error) {
            logger.error('Database connection check failed', { error: error.message });
            return false;
        }
    }

    /**
     * 격리 수준 상수들
     */
    static ISOLATION_LEVELS = {
        READ_UNCOMMITTED: 'READ_UNCOMMITTED',
        READ_COMMITTED: 'READ_COMMITTED',
        REPEATABLE_READ: 'REPEATABLE_READ',
        SERIALIZABLE: 'SERIALIZABLE'
    };

    /**
     * 기본 트랜잭션 옵션
     */
    static DEFAULT_OPTIONS = {
        isolationLevel: 'READ_COMMITTED',
        autocommit: false,
        timeout: 30000 // 30초
    };
}
