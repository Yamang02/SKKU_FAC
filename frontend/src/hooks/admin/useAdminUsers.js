import { useState, useEffect, useCallback } from 'react';
import { AdminUserApi } from '../../api/index.js';

export const useAdminUsers = () => {
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

            const response = await AdminUserApi.getUserList(params);

            if (response.success) {
                // 백엔드는 { items: [], total: 0, page: {} } 구조로 응답
                setUsers(response.data.items || []);
                setTotal(response.data.total || 0);
            } else {
                setError(response.error || response.message || '사용자 목록을 불러오는 데 실패했습니다.');
                setUsers(response.data?.items || []);
                setTotal(response.data?.total || 0);
            }
        } catch (error) {
            console.error('사용자 목록 로드 중 오류:', error);
            setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    const updateUser = useCallback(async (userId, updateData) => {
        try {
            setLoading(true);
            const response = await AdminUserApi.updateUser(userId, updateData);

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
            const response = await AdminUserApi.deleteUser(userId);

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

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setPage(1); // 필터 변경 시 첫 페이지로
        loadUsers(newFilters, 1);
    }, [loadUsers]);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        loadUsers(filters, newPage);
    }, [filters, loadUsers]);

    const resetFilters = useCallback(() => {
        const defaultFilters = {
            status: '',
            role: '',
            keyword: '',
        };
        setFilters(defaultFilters);
        setPage(1);
        loadUsers(defaultFilters, 1);
    }, [loadUsers]);

    useEffect(() => {
        loadUsers();
    }, []);

    return {
        users,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        reload: () => loadUsers(filters, page),
        updateUser,
        deleteUser,
    };
};

export default useAdminUsers;
