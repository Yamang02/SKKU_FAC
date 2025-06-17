import { useState, useEffect, useCallback } from 'react';
import UserApi from '../../api/UserApi.js';

export const useUsers = () => {
    const [users, setUsers] = useState([]); // 빈 배열로 초기화
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        role: '',
        keyword: '',
    });

    const loadUsers = useCallback(async (newFilters = filters, newPage = page) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: newPage,
                limit: 10,
                ...newFilters,
            };

            const response = await UserApi.getUsers(params);

            if (response.success) {
                setUsers(response.data.users || []);
                setTotal(response.data.total || 0);
            } else {
                setError(response.error || response.message || '사용자 목록을 불러오는 데 실패했습니다.');
                setUsers(response.data?.users || []);
                setTotal(response.data?.total || 0);
            }
        } catch (err) {
            console.error('사용자 목록 조회 오류:', err);
            setError('네트워크 오류가 발생했습니다.');
            setUsers([]);  // 빈 배열로 초기화
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    const updateUser = useCallback(async (userId, updateData) => {
        try {
            setLoading(true);
            const response = await UserApi.updateUser(userId, updateData);

            if (response.success) {
                // 목록 새로고침
                await loadUsers();
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err) {
            console.error('사용자 업데이트 오류:', err);
            return { success: false, message: '사용자 정보 업데이트에 실패했습니다.' };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const deleteUser = useCallback(async (userId) => {
        try {
            setLoading(true);
            const response = await UserApi.deleteUser(userId);

            if (response.success) {
                // 목록 새로고침
                await loadUsers();
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err) {
            console.error('사용자 삭제 오류:', err);
            return { success: false, message: '사용자 삭제에 실패했습니다.' };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const handleFilterChange = useCallback((field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        setPage(1); // 필터 변경 시 첫 페이지로
    }, [filters]);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    const resetFilters = useCallback(() => {
        const resetFilters = { status: '', role: '', keyword: '' };
        setFilters(resetFilters);
        setPage(1);
    }, []);

    // 초기 로드
    useEffect(() => {
        loadUsers(filters, page);
    }, [filters, page]);

    return {
        // State
        users,
        loading,
        error,
        total,
        page,
        filters,

        // Actions
        loadUsers,
        updateUser,
        deleteUser,
        handleFilterChange,
        handlePageChange,
        resetFilters,
    };
};

export default useUsers;
