import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let manifestCache = null;
let manifestLastModified = null;

/**
 * Vite manifest 파일을 읽어서 실제 빌드된 파일명을 반환
 * @param {string} entryName - 엔트리 파일명 (예: 'main.js')
 * @returns {object} - { css: string[], js: string[], legacy?: string }
 */
export function getViteAssets(entryName = 'main.js') {
    try {
        // manifest 파일 경로
        const manifestPath = path.resolve(__dirname, '../../../dist/.vite/manifest.json');

        // 파일이 존재하지 않으면 빈 객체 반환
        if (!fs.existsSync(manifestPath)) {
            console.warn('Vite manifest 파일을 찾을 수 없습니다:', manifestPath);
            return { css: [], js: [] };
        }

        // 파일 수정 시간 확인
        const stats = fs.statSync(manifestPath);
        const currentModified = stats.mtime.getTime();

        // 캐시된 manifest가 없거나 파일이 변경되었으면 다시 읽기
        if (!manifestCache || manifestLastModified !== currentModified) {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            manifestCache = JSON.parse(manifestContent);
            manifestLastModified = currentModified;
            console.log('Vite manifest 파일을 새로 로드했습니다.');
        }

        // manifest에서 엔트리 찾기 (경로 정규화)
        const normalizedEntryName = entryName.startsWith('src/frontend/') ? entryName : `src/frontend/${entryName}`;
        let entry = manifestCache[entryName] || manifestCache[normalizedEntryName];

        // 직접 키로 찾지 못한 경우, 파일명으로 검색
        if (!entry) {
            const entries = Object.entries(manifestCache);
            const foundEntry = entries.find(([key, value]) =>
                key.endsWith(entryName) || value.src === entryName
            );
            entry = foundEntry ? foundEntry[1] : null;
        }

        if (!entry) {
            console.warn(`Manifest에서 ${entryName} 엔트리를 찾을 수 없습니다.`);
            console.log('사용 가능한 엔트리들:', Object.keys(manifestCache));
            return { css: [], js: [] };
        }

        // legacy 파일 찾기
        const legacyEntryName = entryName.replace('.js', '-legacy.js');
        const legacyEntry = manifestCache[legacyEntryName] ||
            Object.values(manifestCache).find(e => e.name === entry.name && e.src.includes('legacy'));

        // 폴리필 파일 찾기
        const polyfillEntry = Object.values(manifestCache).find(e =>
            e.src && e.src.includes('polyfills-legacy')
        );

        const result = {
            css: entry.css || [],
            js: [entry.file],
            legacy: legacyEntry?.file,
            polyfills: polyfillEntry?.file
        };

        console.log(`Vite assets for ${entryName}:`, result);
        return result;

    } catch (error) {
        console.error('Vite manifest 읽기 오류:', error);
        return { css: [], js: [] };
    }
}

/**
 * 개발/프로덕션 환경에 따라 적절한 assets 반환
 * @param {string} entryName - 엔트리 파일명
 * @returns {object} - { css: string[], js: string[], legacy?: string }
 */
export function getAssets(entryName = 'main.js') {
    // 모든 환경에서 Vite 빌드된 파일 사용
    return getViteAssets(entryName);
}

/**
 * manifest 캐시 초기화 (개발 시 유용)
 */
export function clearManifestCache() {
    manifestCache = null;
    manifestLastModified = null;
    console.log('Vite manifest 캐시가 초기화되었습니다.');
}

/**
 * 현재 로드된 manifest 정보 반환 (디버깅용)
 */
export function getManifestInfo() {
    return {
        cached: !!manifestCache,
        lastModified: manifestLastModified,
        entries: manifestCache ? Object.keys(manifestCache) : []
    };
}
