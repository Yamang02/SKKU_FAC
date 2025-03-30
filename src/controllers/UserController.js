import SessionUtil from '../utils/SessionUtil.js';
import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcrypt';
import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';

export default class UserController {
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * 로그인 페이지를 렌더링합니다.
     */
    getUserLoginPage(req, res) {
        const redirectUrl = req.query.redirect || '/';
        ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN, {
            title: '로그인',
            redirectUrl
        });
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
                isAdmin: user.role === 'admin'
            };
            await SessionUtil.saveUserToSession(req, sessionUser);

            const redirectUrl = req.body.redirectUrl || '/';
            res.redirect(redirectUrl);
        } catch (error) {
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
        ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
            title: '회원가입'
        });
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

            res.redirect('/');
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
                title: '회원가입',
                error: error.message,
                formData: req.body
            });
        }
    }

    /**
     * 프로필 페이지를 렌더링합니다.
     */
    async getUserProfilePage(req, res) {
        try {
            const user = await this.userRepository.findUserById(req.session.user.id);
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE, {
                title: '프로필',
                user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 프로필 수정 페이지를 렌더링합니다.
     */
    async getUserProfileEditPage(req, res) {
        try {
            const user = await this.userRepository.findUserById(req.session.user.id);
            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE_EDIT, {
                title: '프로필 수정',
                profile: user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 프로필을 수정합니다.
     */
    async updateUserProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const { name, email, department, studentYear } = req.body;

            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            const updateData = {
                name,
                email,
                department,
                studentYear,
                updatedAt: new Date()
            };

            await this.userRepository.updateUser(userId, updateData);
            req.session.user = { ...req.session.user, ...updateData };

            res.redirect('/user/profile');
        } catch (error) {
            console.error('프로필 수정 중 오류 발생:', error);
            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE_EDIT, {
                title: '프로필 수정',
                profile: await this.userRepository.findUserById(req.session.user.id),
                error: error.message
            });
        }
    }

    /**
     * 비밀번호 찾기 페이지를 렌더링합니다.
     */
    getUserPasswordResetPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
            title: '비밀번호 찾기'
        });
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

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                title: '회원 관리',
                users: users.items || [],
                result: {
                    total: users.total,
                    totalPages: Math.ceil(users.total / limit)
                },
                page: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(users.total / limit),
                    hasPreviousPage: parseInt(page) > 1,
                    hasNextPage: parseInt(page) < Math.ceil(users.total / limit)
                },
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
     * 관리자용 사용자 삭제를 처리합니다.
     */
    async deleteManagementUser(req, res) {
        try {
            const { id } = req.params;
            const result = await this.userRepository.deleteUser(id);

            if (result) {
                res.json({
                    success: true,
                    message: '회원이 삭제되었습니다.'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '회원을 찾을 수 없습니다.'
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: '회원 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 사용자 역할을 수정합니다.
     */
    async updateManagementUserRole(req, res) {
        try {
            await this.userRepository.updateRole(req.params.id, req.body.role);
            res.redirect('/admin/management/user/list');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 회원 정보를 수정합니다.
     */
    async updateManagementUserInfo(req, res) {
        try {
            const { id } = req.params;
            const { role, status } = req.body;

            const result = await this.userRepository.updateUser(id, { role, status });

            if (result) {
                res.json({
                    success: true,
                    message: '회원 정보가 수정되었습니다.'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '회원을 찾을 수 없습니다.'
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: '회원 정보 수정 중 오류가 발생했습니다.'
            });
        }
    }
}
