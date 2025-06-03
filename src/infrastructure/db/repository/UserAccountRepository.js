import { UserAccount, SkkuUserProfile, ExternalUserProfile, Artwork } from '../model/entity/EntitityIndex.js';
import BaseRepository from './BaseRepository.js';
import TransactionManager from '../transaction/TransactionManager.js';

export default class UserAccountRepository extends BaseRepository {
    constructor() {
        super(UserAccount);
    }

    /**
     * 기본 include 옵션 (사용자 프로필 포함)
     */
    getDefaultInclude() {
        return [
            { model: SkkuUserProfile, required: false },
            { model: ExternalUserProfile, required: false }
        ];
    }

    /**
     * 모든 사용자를 조회합니다.
     */
    async findUsers({ page = 1, limit = 10, keyword, role, status } = {}) {
        const where = {};

        // 키워드 검색 조건
        if (keyword) {
            Object.assign(where, this.buildSearchCondition(keyword, ['name', 'email', 'username']));
        }

        // 역할 필터링
        if (role) {
            where.role = role;
        }

        // 상태 필터링
        if (status) {
            where.status = status;
        }

        return await this.findAll({
            where,
            page,
            limit,
            order: [['createdAt', 'DESC']],
            include: this.getDefaultInclude()
        });
    }

    /**
     * ID로 사용자를 조회합니다.
     */
    async findUserById(id) {
        return await this.findById(id, {
            include: this.getDefaultInclude()
        });
    }

    /**
     * 이메일로 사용자를 조회합니다.
     */
    async findUserByEmail(email) {
        return await this.findOne(
            { email },
            { include: this.getDefaultInclude() }
        );
    }

    /**
     * 사용자명으로 사용자를 조회합니다.
     */
    async findUserByUsername(username) {
        return await this.findOne(
            { username },
            { include: this.getDefaultInclude() }
        );
    }

    /**
     * 이메일 인증 토큰으로 사용자를 조회합니다.
     */
    async findUserByEmailVerificationToken(token) {
        return await this.findOne({ emailVerificationToken: token });
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userData) {
        return await TransactionManager.executeInTransaction(async (transaction) => {
            // UserAccount 생성
            const user = await this.create(userData, { transaction });

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

            return user;
        });
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    async updateUserProfile(userData) {
        return await TransactionManager.executeInTransaction(async (transaction) => {
            userData.updatedAt = new Date();
            await userData.save({ transaction });

            if (userData.SkkuUserProfile !== null) {
                await userData.SkkuUserProfile.save({ transaction });
            }

            if (userData.ExternalUserProfile !== null) {
                await userData.ExternalUserProfile.save({ transaction });
            }

            return userData;
        });
    }

    /**
     * 사용자 정보를 업데이트합니다.
     */
    async updateUser(id, userData) {
        return await this.updateById(id, userData, { returning: false });
    }

    /**
     * 사용자를 삭제합니다.
     */
    async deleteUser(id) {
        return await TransactionManager.executeInTransaction(async (transaction) => {
            const user = await this.findById(id, {
                include: [
                    { model: SkkuUserProfile, required: false },
                    { model: ExternalUserProfile, required: false },
                    { model: Artwork, required: false }
                ],
                transaction
            });

            if (!user) {
                return false;
            }

            // DB FK 미설정, 삭제 처리 필요
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
            return true;
        });
    }
}
