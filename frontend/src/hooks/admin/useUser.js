import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import UserApi from '../../api/UserApi.js';

export const useUser = (userId = null) => {
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

            const response = await UserApi.getUserById(id);

            if (response.success && response.data) {
                const userData = response.data;
                setUser(userData);
                setFormData({
                    role: userData.role || '',
                    status: userData.status || '',
                });
            } else {
                setError(response.message || '사용자를 찾을 수 없습니다.');
            }
        } catch (err) {
            console.error('사용자 조회 오류:', err);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateUser = useCallback(async (updateData = formData) => {
        if (!id) return { success: false, message: '사용자 ID가 없습니다.' };

        try {
            setLoading(true);
            const response = await UserApi.updateUser(id, updateData);

            if (response.success) {
                // 사용자 정보 새로고침
                await loadUser();
                return { success: true, message: '사용자 정보가 업데이트되었습니다.' };
            } else {
                return { success: false, message: response.message || '업데이트에 실패했습니다.' };
            }
        } catch (err) {
            console.error('사용자 업데이트 오류:', err);
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
        } finally {
            setLoading(false);
        }
    }, [id, formData, loadUser]);

    const deleteUser = useCallback(async () => {
        if (!id) return { success: false, message: '사용자 ID가 없습니다.' };

        try {
            setLoading(true);
            const response = await UserApi.deleteUser(id);

            if (response.success) {
                return { success: true, message: '사용자가 삭제되었습니다.' };
            } else {
                return { success: false, message: response.message || '삭제에 실패했습니다.' };
            }
        } catch (err) {
            console.error('사용자 삭제 오류:', err);
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
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

    // 초기 로드
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        // State
        user,
        loading,
        error,
        formData,

        // Actions
        loadUser,
        updateUser,
        deleteUser,
        handleFormChange,
        resetForm,
    };
};

export default useUser;
