/**
 * CommonJS에서 ES 모듈로 변환하는 스크립트
 * 
 * 이 스크립트는 프로젝트의 모든 JavaScript 파일을 CommonJS에서 ES 모듈로 변환합니다.
 * 
 * 사용법:
 * 1. node convert-to-esm.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 변환할 디렉토리 설정
const srcDir = path.join(__dirname, 'src');

// 변환 제외 디렉토리
const excludeDirs = [
  'node_modules',
  '.git',
  '.vscode',
  '.cursor'
];

// 파일 확장자 추가 여부 확인
function shouldAddExtension(importPath) {
  // 상대 경로인 경우에만 확장자 추가
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    // 이미 확장자가 있는 경우 제외
    if (path.extname(importPath) !== '') {
      return false;
    }
    return true;
  }
  return false;
}

// CommonJS를 ES 모듈로 변환
function convertToESM(content) {
  // require -> import 변환
  let newContent = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, (match, varName, importPath) => {
    const newPath = shouldAddExtension(importPath) ? `${importPath}.js` : importPath;
    return `import ${varName} from '${newPath}';`;
  });

  // 객체 구조 분해 require 변환
  newContent = newContent.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, (match, imports, importPath) => {
    const newPath = shouldAddExtension(importPath) ? `${importPath}.js` : importPath;
    return `import { ${imports} } from '${newPath}';`;
  });

  // module.exports = 변환
  newContent = newContent.replace(/module\.exports\s*=\s*([^;]+);?/g, 'export default $1;');

  // exports.xxx = 변환
  newContent = newContent.replace(/exports\.(\w+)\s*=\s*([^;]+);?/g, 'export const $1 = $2;');

  // 클래스 내보내기 변환
  newContent = newContent.replace(/module\.exports\s*=\s*{\s*([^}]+)\s*};?/g, (match, exports) => {
    const exportLines = exports.split(',').map(exp => exp.trim());
    return exportLines.map(exp => `export ${exp};`).join('\n');
  });

  return newContent;
}

// 파일 처리
function processFile(filePath) {
  if (!filePath.endsWith('.js')) {
    return;
  }

  console.log(`처리 중: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = convertToESM(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`변환 완료: ${filePath}`);
    } else {
      console.log(`변경 없음: ${filePath}`);
    }
  } catch (error) {
    console.error(`파일 처리 중 오류 발생: ${filePath}`, error);
  }
}

// 디렉토리 순회
function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // 제외 디렉토리 건너뛰기
    if (excludeDirs.includes(file)) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  }
}

// 변환 시작
console.log('CommonJS에서 ES 모듈로 변환을 시작합니다...');
traverseDirectory(srcDir);
console.log('변환이 완료되었습니다.'); 