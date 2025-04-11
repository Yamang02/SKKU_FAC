import { UserAccount, SkkuUserProfile, ExternalUserProfile, Artwork } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';
import { db } from '../adapter/MySQLDatabase.js';

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
            where: { username, status: 'ACTIVE' },
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
        const transaction = await db.transaction();

        try {
            // UserAccount 생성
            const user = await UserAccount.create({
                ...userData,

                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction });

            // 프로필 정보 생성
            if (userData.role === 'SKKU_MEMBER') {
                await SkkuUserProfile.create({
                    id: userData.skkuUserId,
                    userId: user.id,
                    department: userData.department,
                    studentYear: userData.studentYear,
                    isClubMember: userData.isClubMember,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { transaction });
            } else if (userData.role === 'EXTERNAL_MEMBER') {
                await ExternalUserProfile.create({
                    id: userData.externalUserId,
                    userId: user.id,
                    affiliation: userData.affiliation,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { transaction });
            }

            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            console.error('사용자 생성 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUserProfile(userData) {
        const transaction = await db.transaction();
        try {
            userData.updatedAt = new Date();
            await userData.save({ transaction });
            if (userData.SkkuUserProfile !== null) {
                await userData.SkkuUserProfile.save({ transaction });
            }
            if (userData.ExternalUserProfile !== null) {
                await userData.ExternalUserProfile.save({ transaction });
            }
            await transaction.commit();
            return userData;
        } catch (error) {
            await transaction.rollback();
            console.error('사용자 정보 수정 중 오류 발생:', error);
            throw error;
        }
    }


    /**
     * 사용자 정보를 업데이트합니다.
     */
    async updateUser(id, userData) {
        return await UserAccount.update(userData, { where: { id } });
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(id) {
        const user = await UserAccount.findByPk(id, {
            include: [{ model: SkkuUserProfile, required: false },
            { model: ExternalUserProfile, required: false },
            { model: Artwork, required: false }]
        });
        if (!user) {
            return false;
        }

        const transaction = await db.transaction();
        try {
            // DB FK 미설정 , 삭제 처리 필요
            // 관련된 Artwork 삭제
            if (user.Artworks && user.Artworks.length > 0) {
                for (const artwork of user.Artworks) {
                    await artwork.destroy({ transaction });
                }
            }
            if (user.SkkuUserProfile !== null) {
                await user.SkkuUserProfile.destroy({ transaction });
            }
            if (user.ExternalUserProfile !== null) {
                await user.ExternalUserProfile.destroy({ transaction });
            }

            await user.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error('사용자 삭제 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 이메일 인증 토큰으로 사용자를 조회합니다.
     */
    async findUserByEmailVerificationToken(token) {
        return await UserAccount.findOne({ where: { emailVerificationToken: token } });
    }
}
