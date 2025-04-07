import { UserAccount, SkkuUserProfile, ExternalUserProfile } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';

export default class UserAccountRepository {
    constructor() {
    }

    /**
     * 모든 사용자를 조회합니다.
     */
    async findUsers({ page = 1, limit = 10, keyword, role } = {}) {
        const offset = (page - 1) * limit; // 페이지네이션을 위한 오프셋 계산

        const where = {};
        if (keyword) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${keyword}%` } },
                { email: { [Op.iLike]: `%${keyword}%` } },
                { department: { [Op.iLike]: `%${keyword}%` } },
                { username: { [Op.iLike]: `%${keyword}%` } }
            ];
        }

        if (role) {
            where.role = role; // 역할 필터링
        }

        const { count, rows } = await UserAccount.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']], // 정렬 기준
            include: [
                {
                    model: SkkuUserProfile,
                    required: false // SKKU 프로필이 없어도 결과에 포함
                },
                {
                    model: ExternalUserProfile,
                    required: false // 외부 프로필이 없어도 결과에 포함
                }
            ]
        });

        return {
            items: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * ID로 사용자를 조회합니다.
     */
    async findUserById(id) {
        return await UserAccount.findByPk(id, {
            include: [
                { model: SkkuUserProfile, required: false },
                { model: ExternalUserProfile, required: false }
            ]
        }) || null;
    }

    /**
     * 이메일로 사용자를 조회합니다.
     */
    async findUserByEmail(email) {
        return await UserAccount.findOne({
            where: { email },
            include: [
                { model: SkkuUserProfile, required: false },
                { model: ExternalUserProfile, required: false }
            ]
        }) || null;
    }

    /**
     * 사용자명으로 사용자를 조회합니다.
     */
    async findUserByUsername(username) {
        return await UserAccount.findOne({
            where: { username },
            include: [
                { model: SkkuUserProfile, required: false },
                { model: ExternalUserProfile, required: false }
            ]
        }) || null;
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userData) {
        const user = await UserAccount.create({
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return user;
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUser(id, userData) {
        const user = await UserAccount.findByPk(id);
        if (!user) {
            return null;
        }

        await user.update({
            ...userData,
            updatedAt: new Date()
        });

        return user;
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(id) {
        const user = await UserAccount.findByPk(id);
        if (!user) {
            return false;
        }

        await user.destroy();
        return true;
    }
}
