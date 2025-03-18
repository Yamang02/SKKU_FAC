import UserRepository from '../../domain/user/repository/UserRepository.js';
import user, { UserRole } from '../data/user.js';

class UserRepositoryImpl extends UserRepository {
    async findByUsername(username) {
        try {
            return user.find(u => u.username === username) || null;
        } catch (error) {
            console.error('Error in findByUsername:', error);
            throw error;
        }
    }

    async findByStudentId(studentId) {
        try {
            return user.find(u => u.studentId === studentId) || null;
        } catch (error) {
            console.error('Error in findByStudentId:', error);
            throw error;
        }
    }

    async findByRole(role) {
        try {
            return user.filter(u => u.role === role);
        } catch (error) {
            console.error('Error in findByRole:', error);
            throw error;
        }
    }

    async save(userData) {
        try {
            const newId = user.length > 0 ? Math.max(...user.map(u => u.id)) + 1 : 1;

            // username 중복 체크
            if (await this.findByUsername(userData.username)) {
                throw new Error('이미 사용 중인 아이디입니다.');
            }

            // 학번이 있는 경우 중복 체크
            if (userData.studentId && await this.findByStudentId(userData.studentId)) {
                throw new Error('이미 등록된 학번입니다.');
            }

            const newUser = {
                id: newId,
                ...userData,
                role: userData.role || UserRole.GUEST,  // 기본값은 GUEST
                createdAt: new Date(),
                updatedAt: new Date()
            };
            user.push(newUser);
            return newId;
        } catch (error) {
            console.error('Error in save:', error);
            throw error;
        }
    }

    async update(userData) {
        try {
            const index = user.findIndex(u => u.username === userData.username);
            if (index === -1) return false;

            // 학번 변경 시 중복 체크
            if (userData.studentId &&
                userData.studentId !== user[index].studentId &&
                await this.findByStudentId(userData.studentId)) {
                throw new Error('이미 등록된 학번입니다.');
            }

            user[index] = {
                ...user[index],
                ...userData,
                updatedAt: new Date()
            };
            return true;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    async delete(username) {
        try {
            const index = user.findIndex(u => u.username === username);
            if (index === -1) return false;

            user.splice(index, 1);
            return true;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}

export default UserRepositoryImpl;
