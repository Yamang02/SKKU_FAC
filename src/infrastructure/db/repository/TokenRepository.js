import { Token } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';

export default class TokenRepository {
    async saveToken(tokenData) {
        return await Token.create(tokenData);
    }

    async findByToken(token, type) {
        return await Token.findOne({
            where: { token, type }
        });
    }

    async deleteToken(token, type) {
        return await Token.destroy({
            where: { token, type }
        });
    }

    async deleteAllTokensForUser(userId, type) {
        return await Token.destroy({
            where: { userId, type }
        });
    }

    async findUserTokens(userId, type) {
        return await Token.findAll({
            where: { userId, type }
        });
    }

    async cleanExpiredTokens() {
        return await Token.destroy({
            where: {
                expiresAt: { [Op.lt]: new Date() }
            }
        });
    }
}
