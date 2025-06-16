import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminArtworks = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchArtworks = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/artworks', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('작품 데이터를 가져오는데 실패했습니다.');
            }

            const data = await response.json();
            setArtworks(data.artworks || []);
        } catch (err) {
            setError(err.message);
            console.error('작품 데이터 로딩 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks();
    }, []);

    const handleRetry = () => {
        fetchArtworks();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>작품 관리</Text>

            {loading && (
                <Text style={styles.loadingText}>작품 데이터를 불러오는 중...</Text>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>오류: {error}</Text>
                    <Text style={styles.retryButton} onPress={handleRetry}>
                        다시 시도
                    </Text>
                </View>
            )}

            {!loading && !error && (
                <View style={styles.content}>
                    <Text style={styles.subtitle}>
                        총 {artworks.length}개의 작품
                    </Text>

                    {artworks.length === 0 ? (
                        <Text style={styles.emptyText}>등록된 작품이 없습니다.</Text>
                    ) : (
                        <View style={styles.artworkList}>
                            {artworks.map((artwork, index) => (
                                <View key={artwork.id || index} style={styles.artworkItem}>
                                    <Text style={styles.artworkTitle}>
                                        {artwork.title || '제목 없음'}
                                    </Text>
                                    <Text style={styles.artworkArtist}>
                                        작가: {artwork.artist || '작가 미상'}
                                    </Text>
                                    <Text style={styles.artworkYear}>
                                        제작년도: {artwork.year || '미상'}
                                    </Text>
                                    <Text style={styles.artworkStatus}>
                                        상태: {artwork.status || '대기중'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 24,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6c757d',
        marginBottom: 20,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    loadingText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 50,
    },
    errorContainer: {
        backgroundColor: '#f8d7da',
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    errorText: {
        color: '#721c24',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    retryButton: {
        color: '#0066cc',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
        cursor: 'pointer',
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 50,
    },
    artworkList: {
        marginTop: 20,
    },
    artworkItem: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    artworkTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    artworkArtist: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 4,
    },
    artworkYear: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 4,
    },
    artworkStatus: {
        fontSize: 14,
        color: '#495057',
    },
});

export default AdminArtworks;
