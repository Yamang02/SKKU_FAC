import { Token } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';
import BaseRepository from './BaseRepository.js';

export default class TokenRepository extends BaseRepository {
    constructor() {
        super(Token);
    }

    async saveToken(tokenData) {
        return await this.create(tokenData);
    }

    async findByToken(token, type) {
        return await this.findOne({ token, type });
    }

    async deleteToken(token, type) {
        return await this.deleteWhere({ token, type });
    }

    async deleteAllTokensForUser(userId, type) {
        return await this.deleteWhere({ userId, type });
    }

    async findUserTokens(userId, type) {
        return await this.findAll({
            where: { userId, type },
            pagination: false
        });
    }

    async cleanExpiredTokens() {
        return await this.deleteWhere({
            expiresAt: { [Op.lt]: new Date() }
        });
    }
}
