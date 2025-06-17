import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AdminUserApi } from '../../api/index.js';

export const useAdminUser = (userId = null) => {
    const params = useParams();
    const id = userId || params.id;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        role: '',
        status: '',
    });

    const loadUser = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await AdminUserApi.getUserDetail(id);

            if (response.success && response.data) {
                const userData = response.data;
                setUser(userData);
                setFormData({
                    role: userData.role || '',
                    status: userData.status || '',
                });
            } else {
                setError(response.error || '사용자 정보를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('사용자 정보 로드 중 오류:', error);
            setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateUser = useCallback(async (updateData) => {
        if (!id) return { success: false, error: '사용자 ID가 없습니다.' };

        try {
            setLoading(true);
            const response = await AdminUserApi.updateUser(id, updateData);

            if (response.success) {
                // 성공 시 사용자 정보 다시 로드
                await loadUser();
            }

            return response;
        } catch (error) {
            console.error('사용자 정보 수정 중 오류:', error);
            return { success: false, error: '사용자 정보 수정에 실패했습니다.' };
        } finally {
            setLoading(false);
        }
    }, [id, loadUser]);

    const deleteUser = useCallback(async () => {
        if (!id) return { success: false, error: '사용자 ID가 없습니다.' };

        try {
            setLoading(true);
            const response = await AdminUserApi.deleteUser(id);
            return response;
        } catch (error) {
            console.error('사용자 삭제 중 오류:', error);
            return { success: false, error: '사용자 삭제에 실패했습니다.' };
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const resetForm = useCallback(() => {
        if (user) {
            setFormData({
                role: user.role || '',
                status: user.status || '',
            });
        }
    }, [user]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,
        loading,
        error,
        formData,
        updateUser,
        deleteUser,
        handleFormChange,
        resetForm,
        reload: loadUser,
    };
};

export default useAdminUser;
