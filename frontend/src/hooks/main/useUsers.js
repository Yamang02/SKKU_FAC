import { useState, useEffect } from 'react';
import { UserApi } from '../../api/main/UserApi.js';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await UserApi.getUsers();

            if (response?.success && response?.data) {
                setUsers(response.data);
            } else {
                // 백업으로 getUserList 시도
                const fallbackResponse = await UserApi.getUserList();
                if (fallbackResponse?.success && fallbackResponse?.data) {
                    setUsers(fallbackResponse.data);
                } else {
                    setUsers([]);
                }
            }
        } catch (err) {
            console.error('사용자 데이터 로드 실패:', err);
            setError(err.message || '사용자 데이터를 불러올 수 없습니다.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const refetch = () => {
        fetchUsers();
    };

    const updateUser = async (userId, userData) => {
        try {
            const response = await UserApi.updateUser(userId, userData);
            if (response?.success) {
                // 사용자 목록 새로고침
                await fetchUsers();
                return response;
            }
            throw new Error('사용자 업데이트에 실패했습니다.');
        } catch (err) {
            console.error('사용자 업데이트 실패:', err);
            throw err;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await UserApi.deleteUser(userId);
            if (response?.success) {
                // 사용자 목록 새로고침
                await fetchUsers();
                return response;
            }
            throw new Error('사용자 삭제에 실패했습니다.');
        } catch (err) {
            console.error('사용자 삭제 실패:', err);
            throw err;
        }
    };

    return {
        users,
        loading,
        error,
        refetch,
        updateUser,
        deleteUser
    };
};
