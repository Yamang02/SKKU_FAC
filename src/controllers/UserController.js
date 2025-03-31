import SessionUtil from '../utils/SessionUtil.js';
import UserRepository from '../repositories/UserRepository.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';
import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import bcrypt from 'bcrypt';
import Page from '../models/common/page/Page.js';


export default class UserController {
    constructor() {
        this.userRepository = new UserRepository();
        this.artworkRepository = new ArtworkRepository();
    }

    /**
     * 로그인 페이지를 렌더링합니다.
     */
    getUserLoginPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN);
    }

    /**
     * 로그인을 처리합니다.
     */
    async loginUser(req, res) {
        try {
            const { username, password } = req.body;


            const user = await this.userRepository.findUserByUsername(username);


            if (!user) {
                throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
            }


            const isPasswordValid = await bcrypt.compare(password, user.password);


            if (!isPasswordValid) {
                throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
            }

            // 필요한 사용자 정보를 세션에 저장
            const sessionUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'ADMIN'
            };
            console.log('세션에 저장할 사용자 정보:', sessionUser);
            await SessionUtil.saveUserToSession(req, sessionUser);

            const redirectUrl = req.body.redirectUrl || '/';
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('로그인 처리 중 오류:', error);
            ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN, {
                title: '로그인',
                error: error.message,
                username: req.body.username,
                redirectUrl: req.body.redirectUrl
            });
        }
    }

    /**
     * 로그아웃을 처리합니다.
     */
    async logoutUser(req, res) {
        try {
            await SessionUtil.destroySession(req);
            res.redirect('/');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            res.redirect('/');
        }
    }

    /**
     * 회원가입 페이지를 렌더링합니다.
     */
    getUserRegistrationPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER);
    }

    /**
     * 회원가입을 처리합니다.
     */
    async registerUser(req, res) {
        try {
            const {
                username,
                email,
                password,
                name,
                department,
                studentYear,
                role,
                isClubMember,
                affiliation
            } = req.body;

            // 이메일 중복 확인
            const existingEmail = await this.userRepository.findUserByEmail(email);
            if (existingEmail) {
                throw new Error('이미 사용 중인 이메일입니다.');
            }

            // 사용자명 중복 확인
            const existingUsername = await this.userRepository.findUserByUsername(username);
            if (existingUsername) {
                throw new Error('이미 사용 중인 아이디입니다.');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // 사용자 데이터 구성
            const userData = {
                username,
                email,
                password: hashedPassword,
                name,
                role,
                isClubMember: role === 'SKKU_MEMBER' ? Boolean(isClubMember) : false
            };

            // 역할에 따른 추가 정보 설정
            if (role === 'SKKU_MEMBER') {
                userData.department = department;
                userData.studentYear = studentYear;
            } else if (role === 'EXTERNAL_MEMBER') {
                userData.affiliation = affiliation;
            }

            const user = await this.userRepository.createUser(userData);

            // 세션에 필요한 사용자 정보만 저장
            const sessionUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'admin',
                isClubMember: user.isClubMember
            };
            await SessionUtil.saveUserToSession(req, sessionUser);

            // JSON 응답으로 변경
            res.json({
                success: true,
                message: '회원가입이 완료되었습니다. 로그인해주세요.'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * 프로필 페이지를 렌더링합니다.
     */
    async getUserProfilePage(req, res) {
        try {
            const userId = req.session.user.id;
            const user = await this.userRepository.findUserById(userId);

            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE, {
                user
            });
        } catch (error) {
            console.error('프로필 페이지 조회 중 오류 발생:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 프로필을 수정합니다.
     */
    async updateUserProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const {
                name, department, studentYear,
                isClubMember, affiliation,
                currentPassword, newPassword
            } = req.body;

            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            const updateData = {
                name,
                department,
                studentYear,
                isClubMember,
                affiliation,
                updatedAt: new Date()
            };

            // 비밀번호 변경 처리
            if (newPassword) {
                // 현재 비밀번호 확인
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    throw new Error('현재 비밀번호가 일치하지 않습니다.');
                }

                // 새 비밀번호 해싱
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updateData.password = hashedPassword;
            }

            await this.userRepository.updateUser(userId, updateData);

            // 세션 업데이트 (비밀번호 제외)
            req.session.user = {
                ...req.session.user,
                name,
                department,
                studentYear,
                isClubMember,
                affiliation
            };

            res.json({
                success: true,
                message: '프로필이 성공적으로 수정되었습니다.'
            });
        } catch (error) {
            console.error('프로필 수정 중 오류 발생:', error);
            res.status(500).json({
                success: false,
                message: error.message || '프로필 수정 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 비밀번호 재설정 페이지를 렌더링합니다.
     */
    getUserPasswordResetPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD);
    }

    /**
     * 비밀번호 찾기를 처리합니다.
     */
    async handleUserPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findUserByEmail(email);

            if (!user) {
                throw new Error('해당 이메일로 등록된 사용자가 없습니다.');
            }

            // TODO: 비밀번호 재설정 이메일 발송 로직 구현
            const message = '비밀번호 재설정 링크가 이메일로 발송되었습니다.';

            ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
                title: '비밀번호 찾기',
                success: message
            });
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
                title: '비밀번호 찾기',
                error: error.message
            });
        }
    }

    /**
     * 관리자용 사용자 목록을 조회합니다.
     */
    async getManagementUserList(req, res) {
        try {
            const { page = 1, limit = 10, keyword } = req.query;
            const filters = { keyword };

            const users = await this.userRepository.findUsers({
                page: parseInt(page),
                limit: parseInt(limit),
                ...filters
            });

            const pageData = new Page(users.total, {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/admin/management/user',
                filters
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                title: '회원 관리',
                users: users.items || [],
                page: pageData,
                filters
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 상세를 조회합니다.
     */
    async getManagementUserDetail(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findUserById(id);

            if (!user) {
                throw new Error('회원을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.DETAIL, {
                title: '회원 상세',
                user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 정보를 수정합니다.
     */
    async updateManagementUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;

            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            await this.userRepository.updateUser(userId, updateData);
            res.json({
                success: true,
                message: '회원 정보가 저장되었습니다.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || '회원 정보 저장 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 사용자를 삭제합니다.
     */
    async deleteManagementUser(req, res) {
        try {
            const userId = req.params.id;
            const success = await this.userRepository.deleteUser(userId);

            if (!success) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            res.json({
                success: true,
                message: '회원이 삭제되었습니다.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || '회원 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 사용자 계정을 삭제합니다.
     */
    async deleteUserAccount(req, res) {
        try {
            const userId = req.session.user.id;  // 세션에서 현재 로그인한 사용자의 ID를 가져옴
            const success = await this.userRepository.deleteUser(userId);

            if (!success) {
                throw new Error('계정 삭제에 실패했습니다.');
            }

            // 세션 삭제
            await SessionUtil.destroySession(req);

            res.json({
                success: true,
                message: '계정이 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);
            res.status(500).json({
                success: false,
                message: error.message || '계정 삭제 중 오류가 발생했습니다.'
            });
        }
    }
}
