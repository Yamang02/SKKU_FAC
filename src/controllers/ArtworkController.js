import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import FileUploadUtil from '../utils/FileUploadUtil.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import Artwork from '../models/artwork/Artwork.js';
import Page from '../models/common/page/Page.js';
import path from 'path';
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
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const [artworks, exhibitionResult] = await Promise.all([
                this.artworkRepository.findArtworks({ page, limit, sortField, sortOrder, searchType, keyword }),
                this.exhibitionRepository.findExhibitions({ limit: 100 })
            ]);

            const pageOptions = {
                page,
                limit,
                baseUrl: '/artwork',
                sortField,
                sortOrder,
                filters: { searchType, keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(artworks.total || 0, pageOptions);

            // 전시회 데이터 가공
            const exhibitions = exhibitionResult && exhibitionResult.items ? exhibitionResult.items : [];
            const processedExhibitions = exhibitions.map(ex => ({
                id: ex.id || '',
                code: ex.id ? ex.id.toString() : '',
                title: ex.title || '',
                image: ex.imageUrl || '/images/exhibition-placeholder.jpg'
            }));

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                artworks: artworks && artworks.items ? artworks.items : [],
                exhibitions: processedExhibitions,
                page: pageData,
                searchType: searchType || '',
                keyword: keyword || '',
                sortField: sortField || 'createdAt',
                sortOrder: sortOrder || 'desc',
                total: artworks && artworks.total ? artworks.total : 0,
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

            const relatedArtworks = await this.artworkRepository.findRelatedArtworks(id);
            const exhibitions = await this.exhibitionRepository.findExhibitions();

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: artwork.title,
                artwork,
                relatedArtworks: relatedArtworks.items,
                exhibitions: exhibitions.items
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
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: '로그인이 필요합니다.'
                });
            }

            const { title, description, exhibitionId, medium, size, department } = req.body;
            uploadedImage = req.file;

            // 1. 필수 필드 검증
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

            // 1. 새로운 ID 생성
            const newId = this.artworkRepository.artworks.length > 0
                ? Math.max(...this.artworkRepository.artworks.map(a => Number(a.id))) + 1
                : 1;

            // 2. 이미지 저장
            let filePath = null;
            let imageUrl = null;

            try {
                const result = await FileUploadUtil.saveImage({
                    file: uploadedImage,
                    artwork_id: 'temp',  // 임시 ID 사용
                    title,
                    artist_name: req.session.user.name,
                    department: department || ''
                });
                filePath = result.filePath;
                imageUrl = result.imageUrl;
            } catch (error) {
                // 이미지 저장 중 발생한 에러 처리
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            // 3. Artwork 모델 인스턴스 생성 (임시 URL 포함)
            const artwork = new Artwork({
                id: newId,
                title,
                description: description || '',
                department: department || '',
                artist: req.session.user.name || '',
                image: imageUrl,  // image_url 대신 image 사용
                image_path: filePath,
                exhibition_id: exhibitionId || null,
                medium: medium || '',
                size: size || ''
            });

            // 4. 작품 저장 (임시 URL 포함)
            const savedArtwork = await this.artworkRepository.createArtwork(artwork.toJSON());

            // 5. 이미지 파일명 업데이트
            if (filePath && imageUrl) {
                const newFilePath = path.join(
                    path.dirname(filePath),
                    path.basename(filePath).replace('temp', savedArtwork.id)
                );
                const newImageUrl = FileUploadUtil.convertToWebUrl(newFilePath);

                try {
                    await fs.promises.rename(filePath, newFilePath);

                    // 6. 작품 정보 업데이트 (최종 URL 포함)
                    artwork.update({
                        image_path: newFilePath,
                        image: newImageUrl  // image_url 대신 image 사용
                    });
                    await this.artworkRepository.updateArtwork(savedArtwork.id, artwork.toJSON());
                } catch (error) {
                    console.error('이미지 파일명 변경 중 오류:', error);
                    // 이미지 파일명 변경 실패 시 임시 파일 삭제
                    await FileUploadUtil.deleteFile(filePath);
                    throw new Error('이미지 파일 처리 중 오류가 발생했습니다.');
                }
            }

            // 7. 성공 응답 (최종 URL 포함)
            return res.json({
                success: true,
                message: '작품이 성공적으로 등록되었습니다.',
                artwork: {
                    id: savedArtwork.id,
                    title: savedArtwork.title,
                    artist: savedArtwork.artist,
                    department: savedArtwork.department,
                    image: artwork.image,  // image_url 대신 image 사용
                    description: savedArtwork.description,
                    medium: savedArtwork.medium,
                    size: savedArtwork.size,
                    exhibition: savedArtwork.exhibition,
                    exhibitionId: savedArtwork.exhibitionId
                }
            });
        } catch (error) {
            console.error('작품 등록 중 오류:', error);

            // 임시 파일이 있다면 삭제
            if (uploadedImage && uploadedImage.path) {
                await FileUploadUtil.deleteFile(uploadedImage.path);
            }

            return res.status(500).json({
                success: false,
                message: error.message || '작품 등록 중 오류가 발생했습니다.'
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
                exhibition_id: exhibitionId,
                image_url: imageUrl,
                is_featured: isFeatured === 'true'
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

            const artworks = await this.artworkRepository.findArtworks({
                page: parseInt(page),
                limit: parseInt(limit),
                ...filters
            });

            const artists = await this.artworkRepository.findArtists();
            const artistsList = artists?.items || artists || [];

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks: artworks.items || [],
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

            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const artists = await this.artworkRepository.findArtists();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                artwork,
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

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 수정',
                artwork,
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
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        // 클라이언트에 필요한 데이터만 반환
        return {
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist,
            department: artwork.department,
            exhibition: artwork.exhibition ? artwork.exhibition.title : null,
            imageUrl: artwork.image_url || '/images/artwork-placeholder.jpg',
            description: artwork.description
        };
    }

    async getArtworkModalData(req, res) {
        try {
            const artwork = await this.artworkRepository.findArtworkById(req.params.id);
            if (!artwork) {
                return res.status(404).json({ message: '작품을 찾을 수 없습니다.' });
            }

            console.log('[API] 작품 정보:', artwork);
            console.log('[API] 작가 ID:', artwork.artistId);

            const artist = await this.userRepository.findUserById(artwork.artistId);
            console.log('[API] 작가 정보:', artist);

            const exhibition = artwork.exhibitionId ?
                await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId) : null;
            console.log('[API] 전시회 정보:', exhibition);

            const modalData = {
                title: artwork.title,
                imageUrl: artwork.image,
                artist: artist ? artist.name : null,
                department: artwork.department,
                exhibition: exhibition ? exhibition.title : null
            };

            res.json(modalData);
        } catch (error) {
            console.error('모달 데이터 조회 중 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }

    async getArtworkCardData(req, res) {
        try {
            const artwork = await this.artworkRepository.findArtworkById(req.params.id);
            if (!artwork) {
                return res.status(404).json({ message: '작품을 찾을 수 없습니다.' });
            }

            const artist = await this.userRepository.findUserById(artwork.artistId);

            const cardData = {
                id: artwork.id,
                title: artwork.title,
                artist: {
                    name: artist ? artist.name : null,
                    department: artist.department + artist.studentYear ? artist.studentYear : ''
                },
                image: {
                    path: artwork.image,
                    alt: artwork.title
                }
            };

            res.json(cardData);
        } catch (error) {
            console.error('카드 데이터 조회 중 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }
}
