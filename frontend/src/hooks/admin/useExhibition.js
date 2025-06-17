import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AdminExhibitionApi from '../../api/admin/AdminExhibitionApi.js';

export const useExhibition = () => {
    const { id } = useParams();
    const [exhibition, setExhibition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        exhibitionType: 'regular',
        isSubmissionOpen: false,
        isFeatured: false,
        maxArtworks: 50,
        submissionStartDate: '',
        submissionEndDate: ''
    });

    // 전시 정보 로딩
    const loadExhibition = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await AdminExhibitionApi.getExhibitionDetail(id);

            if (response.success) {
                const exhibitionData = response.data;
                setExhibition(exhibitionData);

                // 폼 데이터 설정
                setFormData({
                    title: exhibitionData.title || '',
                    description: exhibitionData.description || '',
                    location: exhibitionData.location || '',
                    startDate: exhibitionData.startDate ? exhibitionData.startDate.split('T')[0] : '',
                    endDate: exhibitionData.endDate ? exhibitionData.endDate.split('T')[0] : '',
                    exhibitionType: exhibitionData.exhibitionType || 'regular',
                    isSubmissionOpen: exhibitionData.isSubmissionOpen || false,
                    isFeatured: exhibitionData.isFeatured || false,
                    maxArtworks: exhibitionData.maxArtworks || 50,
                    submissionStartDate: exhibitionData.submissionStartDate ?
                        exhibitionData.submissionStartDate.split('T')[0] : '',
                    submissionEndDate: exhibitionData.submissionEndDate ?
                        exhibitionData.submissionEndDate.split('T')[0] : ''
                });
            } else {
                setError(response.message || '전시 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Exhibition loading error:', err);
            setError('전시 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 초기 데이터 로딩
    useEffect(() => {
        loadExhibition();
    }, [loadExhibition]);

    // 폼 데이터 변경 처리
    const handleFormChange = useCallback((key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // 전시 정보 업데이트
    const updateExhibition = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminExhibitionApi.updateExhibition(id, formData);

            if (response.success) {
                await loadExhibition(); // 최신 데이터로 새로고침
                return { success: true, message: '전시 정보가 성공적으로 수정되었습니다.' };
            } else {
                const errorMessage = response.message || '전시 정보 수정에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Exhibition update error:', err);
            const errorMessage = '전시 정보 수정 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [id, formData, loadExhibition]);

    // 전시 삭제
    const deleteExhibition = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminExhibitionApi.deleteExhibition(id);

            if (response.success) {
                return { success: true, message: '전시가 성공적으로 삭제되었습니다.' };
            } else {
                const errorMessage = response.message || '전시 삭제에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Exhibition delete error:', err);
            const errorMessage = '전시 삭제 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 폼 초기화
    const resetForm = useCallback(() => {
        if (exhibition) {
            setFormData({
                title: exhibition.title || '',
                description: exhibition.description || '',
                location: exhibition.location || '',
                startDate: exhibition.startDate ? exhibition.startDate.split('T')[0] : '',
                endDate: exhibition.endDate ? exhibition.endDate.split('T')[0] : '',
                exhibitionType: exhibition.exhibitionType || 'regular',
                isSubmissionOpen: exhibition.isSubmissionOpen || false,
                isFeatured: exhibition.isFeatured || false,
                maxArtworks: exhibition.maxArtworks || 50,
                submissionStartDate: exhibition.submissionStartDate ?
                    exhibition.submissionStartDate.split('T')[0] : '',
                submissionEndDate: exhibition.submissionEndDate ?
                    exhibition.submissionEndDate.split('T')[0] : ''
            });
        }
        setError(null);
    }, [exhibition]);

    return {
        exhibition,
        loading,
        error,
        formData,
        updateExhibition,
        deleteExhibition,
        handleFormChange,
        resetForm,
        reload: loadExhibition
    };
};
