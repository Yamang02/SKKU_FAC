import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { homeStyles, getResponsiveHomeStyles } from '../../../styles/pages/home';
import { Modal, Card } from '../../../components/common';
import { useNotification } from '../../../contexts/NotificationContext';
import { Exhibition, Artwork } from '../../../types';
import { ExhibitionApi, ArtworkApi } from '../../../services/api';

interface HomePageProps {
    onNavigate?: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    // State
    const [featuredExhibitions, setFeaturedExhibitions] = useState<Exhibition[]>([]);
    const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Refs
    const slideInterval = useRef<NodeJS.Timeout | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Hooks
    const { showError } = useNotification();
    const responsiveStyles = getResponsiveHomeStyles();
    const { width: screenWidth } = Dimensions.get('window');

    // Effects
    useEffect(() => {
        loadFeaturedData();
        return () => {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        if (featuredExhibitions.length > 0) {
            startSlideInterval();
        }
        return () => {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
            }
        };
    }, [featuredExhibitions]);

    // Data loading functions
    const loadFeaturedData = async () => {
        try {
            setLoading(true);

            // 임시 테스트 데이터
            setFeaturedExhibitions([{
                id: '1',
                title: '테스트 전시회',
                description: '테스트 전시회입니다.',
                location: '성균관대학교',
                imageUrl: 'https://via.placeholder.com/800x400',
                imagePublicId: null,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                exhibitionType: 'group',
                isActive: true,
                isSubmissionOpen: false,
                isFeatured: true,
                artworkCount: 5,
                artists: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }]);

            setFeaturedArtworks([{
                id: '1',
                title: '테스트 작품',
                slug: 'test-artwork',
                medium: '유화',
                size: '50x70cm',
                year: '2024',
                description: '테스트 작품입니다.',
                imageUrl: 'https://via.placeholder.com/400x300',
                isFeatured: true,
                userId: 'test-user',
                artistName: '테스트 작가',
                artistAffiliation: '성균관대학교',
                RepresentativeExhibitionexhibitionId: null,
                exhibitions: [],
                relatedArtworks: [],
                submittableExhibitions: [],
            }]);

            // 실제 API 호출 (나중에 활성화)
            // await Promise.all([
            //     loadFeaturedExhibitions(),
            //     loadFeaturedArtworks(),
            // ]);
        } catch (error) {
            console.error('데이터 로딩 중 오류:', error);
            showError('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadFeaturedExhibitions = async () => {
        try {
            const response = await ExhibitionApi.getFeaturedExhibitions(5);

            if (response.success && response.data) {
                setFeaturedExhibitions(response.data);
            } else {
                throw new Error(response.error || '주요 전시회를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('주요 전시회 로딩 중 오류:', error);
            // 기본 슬라이드 설정
            setFeaturedExhibitions([{
                id: '0',
                title: 'Welcome',
                description: '성균관대학교 미술동아리 갤러리에 오신 것을 환영합니다.',
                location: '',
                imageUrl: '/images/hero_default.jpg',
                imagePublicId: null,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                exhibitionType: 'group',
                isActive: true,
                isSubmissionOpen: false,
                isFeatured: true,
                artworkCount: 0,
                artists: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }]);
        }
    };

    const loadFeaturedArtworks = async () => {
        try {
            const response = await ArtworkApi.getFeaturedArtworks();

            if (response.success && response.data) {
                setFeaturedArtworks(response.data);
            } else {
                throw new Error(response.error || '주요 작품을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('주요 작품 로딩 중 오류:', error);
            setFeaturedArtworks([]);
        }
    };

    // Slider functions
    const startSlideInterval = () => {
        if (slideInterval.current) {
            clearInterval(slideInterval.current);
        }

        if (featuredExhibitions.length > 1) {
            slideInterval.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % featuredExhibitions.length);
            }, 5000) as any;
        }
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        if (slideInterval.current) {
            clearInterval(slideInterval.current);
            startSlideInterval();
        }
    };

    const handleSlidePress = (exhibition: Exhibition) => {
        if (exhibition.id && onNavigate) {
            onNavigate(`/artwork?exhibition=${exhibition.id}&page=1`);
        }
    };

    // Modal functions
    const showArtworkModal = (artwork: Artwork) => {
        setSelectedArtwork(artwork);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedArtwork(null);
    };

    // Render functions
    const renderHeroSlide = (exhibition: Exhibition, index: number) => (
        <TouchableOpacity
            key={exhibition.id}
            style={[
                homeStyles.heroSlide,
                currentSlide === index && homeStyles.heroSlideActive,
            ]}
            onPress={() => handleSlidePress(exhibition)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: exhibition.imageUrl || '/images/hero_default.jpg' }}
                style={homeStyles.heroSlideBackground}
                resizeMode="cover"
            />
            <View style={homeStyles.heroContent}>
                <Text
                    style={[
                        homeStyles.heroTitle,
                        exhibition.id ? homeStyles.heroTitleWithBackground : null,
                    ]}
                >
                    {exhibition.title}
                </Text>
                {exhibition.location && (
                    <Text style={homeStyles.heroDescription}>
                        {exhibition.location}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSliderDots = () => (
        <View style={homeStyles.heroSliderNavigation}>
            <View style={homeStyles.heroSliderDots}>
                {featuredExhibitions.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            homeStyles.heroSliderDot,
                            currentSlide === index && homeStyles.heroSliderDotActive,
                        ]}
                        onPress={() => goToSlide(index)}
                    />
                ))}
            </View>
        </View>
    );

    const renderArtworkCard = ({ item }: { item: Artwork }) => (
        <TouchableOpacity
            style={homeStyles.cardHome}
            onPress={() => showArtworkModal(item)}
            activeOpacity={0.8}
        >
            <Card
                title={item.title}
                subtitle={item.artistName}
            >
                <Image
                    source={{ uri: item.imageUrl || '/images/artwork-placeholder.svg' }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                />
            </Card>
        </TouchableOpacity>
    );

    const renderFeaturedSection = () => (
        <View style={homeStyles.featuredSection}>
            <View style={homeStyles.contentContainer}>
                <View style={[homeStyles.featuredHeader, responsiveStyles.featuredHeader]}>
                    <Text style={homeStyles.featuredTitle}>주요 작품</Text>
                    <TouchableOpacity
                        style={homeStyles.featuredLink}
                        onPress={() => onNavigate?.('/artwork')}
                    >
                        <Text style={homeStyles.linkText}>전체 보기</Text>
                        <Text style={homeStyles.linkIcon}>→</Text>
                    </TouchableOpacity>
                </View>

                {featuredArtworks.length > 0 ? (
                    <FlatList
                        data={featuredArtworks}
                        renderItem={renderArtworkCard}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={screenWidth > 768 ? 4 : screenWidth > 480 ? 2 : 1}
                        columnWrapperStyle={screenWidth > 480 ? homeStyles.artworkGrid : undefined}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={homeStyles.noticeEmpty}>
                        <Text style={homeStyles.noticeEmptyText}>
                            등록된 작품이 없습니다.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderArtworkModal = () => (
        <Modal
            visible={modalVisible}
            onClose={closeModal}
            size="large"
        >
            {selectedArtwork && (
                <View style={homeStyles.modalBody}>
                    <View style={homeStyles.modalImageContainer}>
                        <Image
                            source={{ uri: selectedArtwork.imageUrl || '/images/artwork-placeholder.svg' }}
                            style={homeStyles.modalImage}
                        />
                    </View>
                    <View style={homeStyles.modalInfo}>
                        <View style={homeStyles.modalInfoContent}>
                            <Text style={homeStyles.modalInfoTitle}>
                                {selectedArtwork.title}
                            </Text>
                            <View style={homeStyles.artworkInfoSection}>
                                <View style={homeStyles.infoItem}>
                                    <Text style={homeStyles.infoItemText}>
                                        작가: {selectedArtwork.artistName}
                                    </Text>
                                </View>
                                {selectedArtwork.artistAffiliation && (
                                    <View style={homeStyles.infoItem}>
                                        <Text style={homeStyles.infoItemText}>
                                            소속: {selectedArtwork.artistAffiliation}
                                        </Text>
                                    </View>
                                )}
                                <View style={homeStyles.infoItem}>
                                    <Text style={homeStyles.infoItemText}>
                                        전시회: {selectedArtwork.exhibitions?.[0]?.title || '출품 전시회 없음'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={homeStyles.modalDetailLink}
                                onPress={() => {
                                    closeModal();
                                    onNavigate?.(`/artwork/${selectedArtwork.slug}`);
                                }}
                            >
                                <Text style={homeStyles.modalDetailLinkText}>
                                    자세히 보기
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </Modal>
    );

    if (loading) {
        return (
            <View style={homeStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={homeStyles.loadingText}>로딩 중...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={[homeStyles.heroContainer, responsiveStyles.heroContainer]}>
                <View style={homeStyles.featuredExhibitionsContainer}>
                    {featuredExhibitions.map((exhibition, index) =>
                        renderHeroSlide(exhibition, index)
                    )}
                </View>
                {featuredExhibitions.length > 1 && renderSliderDots()}
            </View>

            {/* Featured Artworks Section */}
            {renderFeaturedSection()}

            {/* Artwork Modal */}
            {renderArtworkModal()}
        </ScrollView>
    );
};

export default HomePage;
