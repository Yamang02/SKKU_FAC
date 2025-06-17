import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ArtworkApi from '../../api/ArtworkApi.js';

export const useArtwork = () => {
    const { id } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        artistName: '',
        creationYear: '',
        medium: '',
        dimensions: '',
        status: 'PENDING',
        isFeatured: false,
        tags: '',
        notes: ''
    });

    // 작품 정보 로딩
    const loadArtwork = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ArtworkApi.getArtworkDetail(id);

            if (response.success) {
                const artworkData = response.data;
                setArtwork(artworkData);

                // 폼 데이터 설정
                setFormData({
                    title: artworkData.title || '',
                    description: artworkData.description || '',
                    artistName: artworkData.artistName || '',
                    creationYear: artworkData.creationYear || '',
                    medium: artworkData.medium || '',
                    dimensions: artworkData.dimensions || '',
                    status: artworkData.status || 'PENDING',
                    isFeatured: artworkData.isFeatured || false,
                    tags: artworkData.tags ? artworkData.tags.join(', ') : '',
                    notes: artworkData.notes || ''
                });
            } else {
                setError(response.message || '작품 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Artwork loading error:', err);
            setError('작품 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 초기 데이터 로딩
    useEffect(() => {
        loadArtwork();
    }, [loadArtwork]);

    // 폼 데이터 변경 처리
    const handleFormChange = useCallback((key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // 작품 정보 업데이트
    const updateArtwork = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // tags 문자열을 배열로 변환
            const updateData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
            };

            const response = await ArtworkApi.updateArtwork(id, updateData);

            if (response.success) {
                await loadArtwork(); // 최신 데이터로 새로고침
                return { success: true, message: '작품 정보가 성공적으로 수정되었습니다.' };
            } else {
                const errorMessage = response.message || '작품 정보 수정에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Artwork update error:', err);
            const errorMessage = '작품 정보 수정 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [id, formData, loadArtwork]);

    // 작품 삭제
    const deleteArtwork = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ArtworkApi.deleteArtwork(id);

            if (response.success) {
                return { success: true, message: '작품이 성공적으로 삭제되었습니다.' };
            } else {
                const errorMessage = response.message || '작품 삭제에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Artwork delete error:', err);
            const errorMessage = '작품 삭제 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 작품 상태 변경
    const updateArtworkStatus = useCallback(async (newStatus) => {
        try {
            setLoading(true);
            setError(null);

            const response = await ArtworkApi.updateArtworkStatus(id, newStatus);

            if (response.success) {
                await loadArtwork(); // 최신 데이터로 새로고침
                return { success: true, message: `작품 상태가 ${newStatus}로 변경되었습니다.` };
            } else {
                const errorMessage = response.message || '작품 상태 변경에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Artwork status update error:', err);
            const errorMessage = '작품 상태 변경 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [id, loadArtwork]);

    // 폼 초기화
    const resetForm = useCallback(() => {
        if (artwork) {
            setFormData({
                title: artwork.title || '',
                description: artwork.description || '',
                artistName: artwork.artistName || '',
                creationYear: artwork.creationYear || '',
                medium: artwork.medium || '',
                dimensions: artwork.dimensions || '',
                status: artwork.status || 'PENDING',
                isFeatured: artwork.isFeatured || false,
                tags: artwork.tags ? artwork.tags.join(', ') : '',
                notes: artwork.notes || ''
            });
        }
        setError(null);
    }, [artwork]);

    return {
        artwork,
        loading,
        error,
        formData,
        updateArtwork,
        deleteArtwork,
        updateArtworkStatus,
        handleFormChange,
        resetForm,
        reload: loadArtwork
    };
};
