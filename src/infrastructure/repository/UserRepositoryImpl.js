import UserRepository from '../../domain/user/repository/UserRepository.js';
import user from '../data/user.js';

class UserRepositoryImpl extends UserRepository {
    async findByStudentId(studentId) {
        try {
            return user.find(u => u.studentId === studentId) || null;
        } catch (error) {
            console.error('Error in findByStudentId:', error);
            throw error;
        }
    }

    async save(userData) {
        try {
            const newId = user.length > 0 ? Math.max(...user.map(u => u.id)) + 1 : 1;
            const newUser = {
                id: newId,
                ...userData,
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
            const index = user.findIndex(u => u.studentId === userData.studentId);
            if (index === -1) return false;

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

    async delete(studentId) {
        try {
            const index = user.findIndex(u => u.studentId === studentId);
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
