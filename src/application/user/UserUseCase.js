import bcrypt from 'bcrypt';

class UserUseCase {
    constructor(userService) {
        this.userService = userService;
    }

    async login(username, password) {
        const user = await this.userService.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        this.userService.validateUserStatus(user);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return user;
    }

    async register(userData) {
        await this.userService.checkDuplicateUsername(userData.username);
        await this.userService.checkDuplicateEmail(userData.email);
        this.userService.validatePassword(userData.password);

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = {
            ...userData,
            password: hashedPassword,
            status: 'ACTIVE',
            createdAt: new Date()
        };

        return await this.userService.userRepository.create(newUser);
    }

    async getProfile(userId) {
        const user = await this.userService.userRepository.findById(userId);
        this.userService.validateUserStatus(user);
        return user;
    }

    async updateProfile(userId, profileData) {
        const user = await this.userService.userRepository.findById(userId);
        this.userService.validateUserStatus(user);

        if (profileData.email && profileData.email !== user.email) {
            await this.userService.checkDuplicateEmail(profileData.email);
        }

        if (profileData.password) {
            this.userService.validatePassword(profileData.password);
            profileData.password = await bcrypt.hash(profileData.password, 10);
        }

        const updatedUser = {
            ...user,
            ...profileData,
            updatedAt: new Date()
        };

        return await this.userService.userRepository.update(userId, updatedUser);
    }

    async deleteUser(userId) {
        const user = await this.userService.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        await this.userService.userRepository.delete(userId);
    }

    async updateUserRole(userId, newRole) {
        const user = await this.userService.userRepository.findById(userId);
        this.userService.validateUserStatus(user);

        const updatedUser = {
            ...user,
            role: newRole,
            updatedAt: new Date()
        };

        return await this.userService.userRepository.update(userId, updatedUser);
    }

    async getUserList(page, limit, filters) {
        return await this.userService.getUserList(page, limit, filters);
    }

    async getUserStats() {
        return await this.userService.getUserStats();
    }
}

export default UserUseCase;
