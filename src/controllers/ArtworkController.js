import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import FileUploadUtil from '../utils/FileUploadUtil.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import Artwork from '../models/artwork/Artwork.js';
import fs from 'fs';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { page: _page = 1, limit: _limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;

            // 전시회 데이터만 가져오기
            const exhibitionResult = await this.exhibitionRepository.findExhibitions({ limit: 100 });

            // 전시회 데이터 가공
            const exhibitions = exhibitionResult && exhibitionResult.items ? exhibitionResult.items : [];
            const processedExhibitions = exhibitions.map(ex => ({
                id: ex.id || '',
                code: ex.id ? ex.id.toString() : '',
                title: ex.title || '',
                image: ex.imageUrl || '/images/exhibition-placeholder.svg'
            }));

            // 페이지 렌더링
            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                exhibitions: processedExhibitions,
                searchType: searchType || '',
                keyword: keyword || '',
                sortField: sortField || 'createdAt',
                sortOrder: sortOrder || 'desc',
                selectedExhibition: req.query.exhibition || ''
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 특정 전시회의 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const { exhibitionId } = req.params;
            const { page = 1, limit = 12 } = req.query;
            const artworks = await this.artworkRepository.findArtworksByExhibitionId(exhibitionId, { page, limit });

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '전시회 작품 목록',
                artworks,
                currentPage: page,
                totalPages: Math.ceil(artworks.total / limit)
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            // 작가 정보 가져오기
            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            // 전시회 정보 가져오기
            let exhibition = null;

            // 전시회 ID가 있고 유효한 경우 (0보다 큰 숫자)
            if (artwork.exhibitionId !== null && artwork.exhibitionId !== undefined && artwork.exhibitionId > 0) {
                try {
                    exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
                } catch (error) {
                    // 오류 무시
                }
            }

            // 작품 데이터 가공
            const processedArtwork = {
                ...artwork,
                artist: artist ? artist.name : '작가 미상',
                department: artwork.department || (artist ? artist.department : ''),
                exhibition: exhibition ? exhibition.title : '없음',
                exhibitionId: exhibition ? exhibition.id : null, // exhibitionId가 0인 경우 null로 변환
                year: artwork.year || (artwork.createdAt ? new Date(artwork.createdAt).getFullYear() : ''),
                medium: artwork.medium || '미표기',
                size: artwork.size || '미표기',
                description: artwork.description || '작품에 대한 설명이 없습니다.'
            };

            // 관련 작품 가져오기
            const relatedArtworks = await this.artworkRepository.findRelatedArtworks(id);

            // 관련 작품 데이터 가공
            let processedRelatedArtworksResult = [];
            if (relatedArtworks && relatedArtworks.items && Array.isArray(relatedArtworks.items)) {
                const processedRelatedArtworks = relatedArtworks.items.map(async (relatedArtwork) => {
                    let relatedArtist = null;
                    if (relatedArtwork.artistId) {
                        relatedArtist = await this.userRepository.findUserById(relatedArtwork.artistId);
                    }

                    return {
                        ...relatedArtwork,
                        artist: relatedArtist ? relatedArtist.name : '작가 미상',
                        department: relatedArtwork.department || (relatedArtist ? relatedArtist.department : '')
                    };
                });

                processedRelatedArtworksResult = await Promise.all(processedRelatedArtworks);
            }

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: processedArtwork.title,
                artwork: processedArtwork,
                relatedArtworks: processedRelatedArtworksResult,
                exhibitions: exhibition ? [exhibition] : []
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 등록 페이지를 렌더링합니다.
     */
    async getArtworkRegisterPage(req, res) {
        try {
            // 로그인 체크
            if (!req.session.user) {
                return res.redirect('/user/login?returnUrl=/artwork/registration');
            }

            const user = await this.userRepository.findUserById(req.session.user.id);
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const exhibitionId = req.query.exhibition;

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록',
                exhibitions: exhibitions.items || [],
                selectedExhibitionId: exhibitionId,
                user: user,
                error: req.flash('error')[0] || null,
                success: req.flash('success')[0] || null,
                formData: {}
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 등록합니다.
     */
    async createArtwork(req, res) {
        let uploadedImage = null;
        try {
            // 1. 세션 유효성 검사
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: '로그인이 필요합니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 2. 사용자 정보 가져오기
            const user = await this.userRepository.findUserById(req.session.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '사용자 정보를 찾을 수 없습니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 3. 요청 데이터 가져오기
            const { title, description, exhibitionId, medium, size, department } = req.body;
            uploadedImage = req.file;

            // 4. 필수 필드 검증
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: '작품 제목을 입력해주세요.'
                });
            }

            if (!uploadedImage) {
                return res.status(400).json({
                    success: false,
                    message: '작품 이미지를 업로드해주세요.'
                });
            }

            // 5. 새로운 ID 생성
            const newId = this.artworkRepository.artworks.length > 0
                ? Math.max(...this.artworkRepository.artworks.map(a => Number(a.id))) + 1
                : 1;

            // 6. 이미지 저장
            let filePath = null;
            let imageUrl = null;

            try {
                const result = await FileUploadUtil.saveImage({
                    file: uploadedImage,
                    artwork_id: newId,
                    title,
                    artist_name: user.name,
                    department: department || ''
                });
                filePath = result.filePath;
                imageUrl = result.imageUrl;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            // 7. 전시회 ID 처리
            let parsedExhibitionId = null;
            if (exhibitionId && exhibitionId !== '0') {
                parsedExhibitionId = Number(exhibitionId);
                // 0 또는 NaN인 경우 null로 설정
                if (parsedExhibitionId === 0 || isNaN(parsedExhibitionId)) {
                    parsedExhibitionId = null;
                }
            }

            // 8. 현재 시간 설정
            const now = new Date().toISOString();

            // 9. Artwork 모델 인스턴스 생성
            const artwork = new Artwork({
                id: newId,
                title,
                description: description || '',
                department: department || '',
                artistId: user.id,
                artistName: user.name,
                image: imageUrl,
                imagePath: filePath,
                exhibitionId: parsedExhibitionId,
                medium: medium || '',
                size: size || '',
                year: new Date().getFullYear().toString(),
                createdAt: now,
                updatedAt: now
            });

            // 10. 작품 저장
            const savedArtwork = await this.artworkRepository.createArtwork(artwork.toJSON());

            // 11. 응답 전송
            return res.json({
                success: true,
                message: '작품이 성공적으로 등록되었습니다.',
                artwork: savedArtwork
            });
        } catch (error) {
            // 임시 파일이 있다면 삭제
            if (uploadedImage && uploadedImage.path) {
                try {
                    await fs.promises.unlink(uploadedImage.path);
                } catch (unlinkError) {
                    // 임시 파일 삭제 실패
                }
            }

            return res.status(500).json({
                success: false,
                message: '작품 등록 중 오류가 발생했습니다: ' + error.message
            });
        }
    }

    /**
     * 작품 수정 페이지를 렌더링합니다.
     */
    async getArtworkEditPage(req, res) {
        try {
            const [artwork, exhibitions] = await Promise.all([
                this.artworkRepository.findArtworkById(req.params.id),
                this.exhibitionRepository.findExhibitions({ limit: 100 })
            ]);

            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ARTWORK.EDIT, {
                title: '작품 수정',
                artwork,
                exhibitions
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 수정합니다.
     */
    async updateArtwork(req, res) {
        try {
            const { title, description, exhibitionId, imageUrl, isFeatured } = req.body;
            await this.artworkRepository.updateArtwork(req.params.id, {
                title,
                description,
                exhibitionId,
                image: imageUrl,
                isFeatured: isFeatured === 'true'
            });

            res.redirect(`/artworks/${req.params.id}`);
        } catch (error) {
            ViewResolver.render(res, ViewPath.ARTWORK.EDIT, {
                title: '작품 수정',
                error: error.message
            });
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            await this.artworkRepository.deleteArtwork(req.params.id);
            res.redirect('/artworks');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkList(req, res) {
        try {
            const { page = 1, limit = 10, artistId, keyword } = req.query;
            const filters = { artistId, keyword };

            // 작품 데이터 조회
            const artworks = await this.artworkRepository.findArtworks({
                page: parseInt(page),
                limit: parseInt(limit),
                ...filters
            });

            // 각 작품에 대해 작가 정보 추가
            const processedArtworks = await Promise.all(
                artworks.items.map(async (artwork) => {
                    // 작가 정보 가져오기
                    let artist = null;
                    if (artwork.artistId) {
                        artist = await this.userRepository.findUserById(artwork.artistId);
                    }

                    return {
                        ...artwork,
                        artist: artist ? {
                            id: artist.id,
                            name: artist.name,
                            department: artist.department
                        } : null
                    };
                })
            );

            const artists = await this.artworkRepository.findArtists();
            const artistsList = artists?.items || artists || [];

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks: processedArtworks || [],
                artists: artistsList,
                result: {
                    total: artworks.total,
                    totalPages: Math.ceil(artworks.total / limit)
                },
                page: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(artworks.total / limit),
                    hasPreviousPage: parseInt(page) > 1,
                    hasNextPage: parseInt(page) < Math.ceil(artworks.total / limit)
                },
                filters
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 상세 페이지를 렌더링합니다.
     */
    async getManagementArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const artwork = await this.artworkRepository.findArtworkById(id);

            if (!artwork) {
                return res.status(404).render('error', {
                    message: '작품을 찾을 수 없습니다.',
                    error: {}
                });
            }

            // 작가 정보 처리
            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            // 작품 데이터에 작가 정보 추가
            const processedArtwork = {
                ...artwork,
                artist: artist ? {
                    id: artist.id,
                    name: artist.name,
                    department: artist.department
                } : null
            };

            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const artists = await this.artworkRepository.findArtists();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                artwork: processedArtwork,
                exhibitions: exhibitions.items || [],
                artists: artists || [],
                user: req.user
            });
        } catch (error) {
            console.error('Error fetching artwork:', error);
            res.status(500).render('error', {
                message: '작품 정보를 불러오는 중 오류가 발생했습니다.',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    /**
     * 관리자용 작품 수정 페이지를 렌더링합니다.
     */
    async getManagementArtworkEditPage(req, res) {
        try {
            const { id } = req.params;
            const [artwork, exhibitions] = await Promise.all([
                this.artworkRepository.findArtworkById(id),
                this.exhibitionRepository.findExhibitions()
            ]);

            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            // 작가 정보 처리
            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            // 작품 데이터에 작가 정보 추가
            const processedArtwork = {
                ...artwork,
                artist: artist ? {
                    id: artist.id,
                    name: artist.name,
                    department: artist.department
                } : null
            };

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 수정',
                artwork: processedArtwork,
                exhibitions: exhibitions.items || [],
                isEdit: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 정보를 수정합니다.
     */
    async updateManagementArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;

            await this.artworkRepository.updateArtwork(id, artworkData);
            res.redirect('/admin/management/artwork');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품을 삭제합니다.
     */
    async deleteManagementArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkRepository.deleteArtwork(id);

            if (result) {
                res.json({
                    success: true,
                    message: '작품이 삭제되었습니다.'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '작품을 찾을 수 없습니다.'
                });
            }
        } catch (error) {
            console.error('Error deleting artwork:', error);
            res.status(500).json({
                success: false,
                message: '작품 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 작품 등록 페이지를 렌더링합니다.
     */
    async getManagementArtworkCreatePage(req, res) {
        try {
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const artists = await this.artworkRepository.findArtists();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 등록',
                artwork: null,
                exhibitions: exhibitions.items || [],
                artists: artists || [],
                user: req.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품을 등록합니다.
     */
    async createManagementArtwork(req, res) {
        try {
            const artworkData = req.body;
            const result = await this.artworkRepository.createArtwork(artworkData);

            if (result) {
                res.json({
                    success: true,
                    message: '작품이 등록되었습니다.',
                    redirectUrl: '/admin/management/artwork'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: '작품 등록에 실패했습니다.'
                });
            }
        } catch (error) {
            console.error('Error creating artwork:', error);
            res.status(500).json({
                success: false,
                message: '작품 등록 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 작품 상세 정보를 JSON 형식으로 반환합니다.
     */
    async getArtworkById(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        return artwork;
    }

    async getArtworkData(req, res) {
        try {
            const { id } = req.params;
            const { type = 'default' } = req.query;

            // 작품 정보 조회
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                return res.status(404).json({ message: '작품을 찾을 수 없습니다.' });
            }

            // 작가 정보 조회
            const artist = artwork.artistId ?
                await this.userRepository.findUserById(artwork.artistId) : null;

            // 전시회 정보 조회 (필요한 경우에만)
            let exhibition = null;
            if (type === 'modal' && artwork.exhibitionId) {
                exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
            }

            // 데이터 타입에 따라 응답 형식 변경
            let responseData = {};

            switch (type) {
            case 'modal':
                responseData = {
                    title: artwork.title,
                    imageUrl: artwork.image,
                    artist: artist ? artist.name : null,
                    department: artwork.department,
                    exhibition: exhibition ? exhibition.title : null
                };
                break;

            case 'card':
                responseData = {
                    id: artwork.id,
                    title: artwork.title,
                    artist: {
                        name: artist ? artist.name : null,
                        department: artwork.department
                    },
                    image: {
                        path: artwork.image,
                        alt: artwork.title
                    }
                };
                break;

            default:
                // 기본 응답 (모든 정보 포함)
                responseData = {
                    id: artwork.id,
                    title: artwork.title,
                    description: artwork.description,
                    image: artwork.image,
                    artist: artist ? {
                        id: artist.id,
                        name: artist.name,
                        department: artist.department
                    } : null,
                    department: artwork.department,
                    exhibition: exhibition ? {
                        id: exhibition.id,
                        title: exhibition.title
                    } : null,
                    medium: artwork.medium,
                    size: artwork.size,
                    year: artwork.year
                };
            }

            res.json(responseData);
        } catch (error) {
            console.error('작품 데이터 조회 중 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }

    /**
     * 주요 작품 목록을 반환합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     * @returns {Promise<Array>} 주요 작품 목록
     */
    async getFeaturedArtworks(_req, _res) {
        try {
            // 주요 작품 조회 (최대 6개)
            const featuredArtworks = await this.artworkRepository.findFeaturedArtworks(6);

            // 기본 정보만 포함된 배열로 변환
            const simplifiedArtworks = featuredArtworks.map(artwork => ({
                id: artwork.id,
                title: artwork.title
            }));

            return simplifiedArtworks;
        } catch (error) {
            console.error('주요 작품 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 목록 데이터를 API로 반환합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    async getArtworkListData(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword, exhibition } = req.query;

            // 쿼리 파라미터 준비
            const queryParams = {
                page: parseInt(page),
                limit: parseInt(limit),
                sortField,
                sortOrder,
                searchType,
                keyword
            };

            // 전시회 ID로 필터링하는 경우
            if (exhibition) {
                queryParams.exhibitionId = parseInt(exhibition);
            }

            // 작품 데이터 조회
            const artworks = await this.artworkRepository.findArtworks(queryParams);

            // 각 작품에 대해 작가 정보 등을 추가
            const processedArtworks = await Promise.all(
                artworks.items.map(async (artwork) => {
                    // 작가 정보 가져오기
                    let artist = null;
                    if (artwork.artistId) {
                        artist = await this.userRepository.findUserById(artwork.artistId);
                    }

                    // 전시회 정보 가져오기
                    let exhibition = null;
                    if (artwork.exhibitionId && artwork.exhibitionId > 0) {
                        try {
                            exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
                        } catch (err) {
                            // 오류 무시
                        }
                    }

                    // 작품 카드에 필요한 데이터 형식으로 반환
                    return {
                        id: artwork.id,
                        title: artwork.title,
                        artist: {
                            name: artist ? artist.name : '작가 미상',
                            department: artwork.department || (artist ? artist.department : '')
                        },
                        image: {
                            path: artwork.image || '/images/artwork-placeholder.svg',
                            alt: artwork.title
                        },
                        exhibition: exhibition ? exhibition.title : null,
                        exhibitionId: exhibition ? exhibition.id : null,
                        year: artwork.year || '',
                        medium: artwork.medium || '',
                        size: artwork.size || ''
                    };
                })
            );

            // 응답 데이터 구성
            res.json({
                items: processedArtworks,
                total: artworks.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(artworks.total / parseInt(limit))
            });
        } catch (error) {
            console.error('작품 목록 데이터 조회 중 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }
}
