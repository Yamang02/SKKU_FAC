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
    getLoginPage(req, res) {
        const redirectUrl = req.query.redirect || '/';
        ViewResolver.render(res, ViewPath.MAIN.USER.LOGIN, {
            title: '로그인',
            redirectUrl
        });
    }

    /**
     * 로그인을 처리합니다.
     */
    async login(req, res) {
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

            await SessionUtil.saveUserToSession(req, user);
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
    logout(req, res) {
        SessionUtil.destroySession(req);
        res.redirect('/');
    }

    /**
     * 회원가입 페이지를 렌더링합니다.
     */
    getRegisterPage(req, res) {
        const departments = [
            { id: 'art', name: '미술학과' },
            { id: 'design', name: '디자인학과' },
            { id: 'craft', name: '공예학과' },
            { id: 'digital', name: '디지털아트학과' }
        ];

        const roles = [
            { value: 'student', label: '학생' },
            { value: 'professor', label: '교수' },
            { value: 'staff', label: '교직원' }
        ];

        ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
            title: '회원가입',
            departments,
            roles
        });
    }

    /**
     * 회원가입을 처리합니다.
     */
    async register(req, res) {
        try {
            const { username, email, password, name, department, role } = req.body;

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
            const user = await this.userRepository.createUser({
                username,
                email,
                password: hashedPassword,
                name,
                department,
                role
            });

            SessionUtil.createSession(req, user);
            res.redirect('/');
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.REGISTER, {
                title: '회원가입',
                error: error.message,
                departments: [
                    { id: 'art', name: '미술학과' },
                    { id: 'design', name: '디자인학과' },
                    { id: 'craft', name: '공예학과' },
                    { id: 'digital', name: '디지털아트학과' }
                ],
                roles: [
                    { value: 'student', label: '학생' },
                    { value: 'professor', label: '교수' },
                    { value: 'staff', label: '교직원' }
                ],
                formData: req.body
            });
        }
    }

    /**
     * 프로필 페이지를 렌더링합니다.
     */
    async getProfilePage(req, res) {
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
    async getProfileEditPage(req, res) {
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
    async updateProfile(req, res) {
        try {
            const { name, currentPassword, newPassword } = req.body;
            const user = await this.userRepository.findUserById(req.session.user.id);

            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }

            const updateData = { name };

            if (currentPassword && newPassword) {
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    throw new Error('현재 비밀번호가 일치하지 않습니다.');
                }
                updateData.password = await bcrypt.hash(newPassword, 10);
            }

            await this.userRepository.updateUser(req.session.user.id, updateData);
            res.redirect('/users/profile');
        } catch (error) {
            ViewResolver.render(res, ViewPath.MAIN.USER.PROFILE, {
                title: '프로필',
                user: await this.userRepository.findUserById(req.session.user.id),
                error: error.message
            });
        }
    }

    /**
     * 비밀번호 찾기 페이지를 렌더링합니다.
     */
    getForgotPasswordPage(req, res) {
        ViewResolver.render(res, ViewPath.MAIN.USER.FORGOT_PASSWORD, {
            title: '비밀번호 찾기'
        });
    }

    /**
     * 비밀번호 찾기를 처리합니다.
     */
    async handleForgotPassword(req, res) {
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
    async getUserList(req, res) {
        try {
            const users = await this.userRepository.findUsers();
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.LIST, {
                currentPage: req.path,
                users,
                title: '사용자 관리'
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 상세를 조회합니다.
     */
    async getUserDetail(req, res) {
        try {
            const user = await this.userRepository.findUserById(parseInt(req.params.id));
            if (!user) {
                return ViewResolver.renderError(res, new Error('사용자를 찾을 수 없습니다.'));
            }
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.USER.DETAIL, {
                currentPage: req.path,
                user,
                title: '사용자 상세'
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 사용자 삭제를 처리합니다.
     */
    async deleteUser(req, res) {
        try {
            await this.userRepository.deleteUser(req.params.id);
            res.redirect('/admin/management/user/list');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    async updateUserRole(req, res) {
        try {
            await this.userRepository.updateRole(req.params.id, req.body.role);
            res.redirect('/admin/management/user/list');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}
