#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🔄 기본 테스트 사용자들과 프로필을 3308 DB로 복사 중...');

const tempDir = os.tmpdir();
const tempFiles = {
    schema: path.join(tempDir, 'test_schema.sql'),
    users: path.join(tempDir, 'test_users.sql'),
    skkuProfiles: path.join(tempDir, 'test_skku_profiles.sql'),
    externalProfiles: path.join(tempDir, 'test_external_profiles.sql')
};

try {
    // 1. 먼저 스키마 생성 (테이블 구조만)
    console.log('🏗️ 테스트 DB 스키마 생성 중...');
    const schemaCmd = 'docker exec skku_gallery_mysql mysqldump -u root -pdevpassword skku_sfa_gallery --no-data --routines --triggers';

    try {
        const schemaData = execSync(schemaCmd, { encoding: 'utf8' });
        fs.writeFileSync(tempFiles.schema, schemaData);

        // 스키마를 테스트 DB에 적용
        const schemaImportCmd = 'docker exec -i skku_gallery_mysql_test mysql -u root -ptestpassword skku_sfa_gallery_test';
        execSync(schemaImportCmd, { input: schemaData, encoding: 'utf8' });
        console.log('✅ 테스트 DB 스키마 생성 완료');
    } catch (error) {
        console.error('❌ 스키마 생성 실패:', error.message);
        process.exit(1);
    }

    // 2. 기본 사용자 계정들 복사
    console.log('📋 사용자 계정 복사 중...');
    const usersCmd = 'docker exec skku_gallery_mysql mysqldump -u root -pdevpassword skku_sfa_gallery --no-create-info --where="username IN (\'skkfntclbdmnsttrt\', \'duplicate1749455784069\', \'external1749455846376\')" user_accounts';

    try {
        const usersData = execSync(usersCmd, { encoding: 'utf8' });
        fs.writeFileSync(tempFiles.users, usersData);
    } catch (error) {
        console.error('❌ 사용자 계정 복사 실패:', error.message);
        process.exit(1);
    }

    // 3. SKKU 사용자 프로필 복사 (단순한 방법으로 변경)
    console.log('🎓 SKKU 사용자 프로필 복사 중...');
    try {
        // 먼저 해당 사용자의 ID를 찾기
        const userIdCmd = 'docker exec skku_gallery_mysql mysql -u root -pdevpassword skku_sfa_gallery -se "SELECT id FROM user_accounts WHERE username = \'duplicate1749455784069\'"';
        const userId = execSync(userIdCmd, { encoding: 'utf8' }).trim();

        if (userId) {
            const skkuProfilesCmd = `docker exec skku_gallery_mysql mysqldump -u root -pdevpassword skku_sfa_gallery --no-create-info --where="user_id = '${userId}'" skku_user_profiles`;
            const skkuProfilesData = execSync(skkuProfilesCmd, { encoding: 'utf8' });
            fs.writeFileSync(tempFiles.skkuProfiles, skkuProfilesData);
        } else {
            console.log('⚠️ SKKU 사용자 ID를 찾을 수 없음');
            fs.writeFileSync(tempFiles.skkuProfiles, '');
        }
    } catch (error) {
        console.log('⚠️ SKKU 프로필 없음 (정상)');
        fs.writeFileSync(tempFiles.skkuProfiles, '');
    }

    // 4. 외부 사용자 프로필 복사
    console.log('🌍 외부 사용자 프로필 복사 중...');
    try {
        // 먼저 해당 사용자의 ID를 찾기
        const userIdCmd = 'docker exec skku_gallery_mysql mysql -u root -pdevpassword skku_sfa_gallery -se "SELECT id FROM user_accounts WHERE username = \'external1749455846376\'"';
        const userId = execSync(userIdCmd, { encoding: 'utf8' }).trim();

        if (userId) {
            const externalProfilesCmd = `docker exec skku_gallery_mysql mysqldump -u root -pdevpassword skku_sfa_gallery --no-create-info --where="user_id = '${userId}'" external_user_profiles`;
            const externalProfilesData = execSync(externalProfilesCmd, { encoding: 'utf8' });
            fs.writeFileSync(tempFiles.externalProfiles, externalProfilesData);
        } else {
            console.log('⚠️ 외부 사용자 ID를 찾을 수 없음');
            fs.writeFileSync(tempFiles.externalProfiles, '');
        }
    } catch (error) {
        console.log('⚠️ 외부 프로필 없음 (정상)');
        fs.writeFileSync(tempFiles.externalProfiles, '');
    }

    // 5. 3308 DB로 데이터 복사
    console.log('📤 테스트 DB로 데이터 주입 중...');

    // 사용자 계정 주입
    if (fs.existsSync(tempFiles.users) && fs.statSync(tempFiles.users).size > 0) {
        const usersImportCmd = 'docker exec -i skku_gallery_mysql_test mysql -u root -ptestpassword skku_sfa_gallery_test';
        const usersData = fs.readFileSync(tempFiles.users, 'utf8');

        try {
            execSync(usersImportCmd, { input: usersData, encoding: 'utf8' });
            console.log('✅ 사용자 계정 복사 완료');
        } catch (error) {
            console.error('❌ 사용자 계정 주입 실패:', error.message);
        }
    }

    // SKKU 프로필 주입
    if (fs.existsSync(tempFiles.skkuProfiles) && fs.statSync(tempFiles.skkuProfiles).size > 0) {
        const skkuImportCmd = 'docker exec -i skku_gallery_mysql_test mysql -u root -ptestpassword skku_sfa_gallery_test';
        const skkuData = fs.readFileSync(tempFiles.skkuProfiles, 'utf8');

        try {
            execSync(skkuImportCmd, { input: skkuData, encoding: 'utf8' });
            console.log('✅ SKKU 프로필 복사 완료');
        } catch (error) {
            console.log('⚠️ SKKU 프로필 주입 건너뜀');
        }
    }

    // 외부 프로필 주입
    if (fs.existsSync(tempFiles.externalProfiles) && fs.statSync(tempFiles.externalProfiles).size > 0) {
        const externalImportCmd = 'docker exec -i skku_gallery_mysql_test mysql -u root -ptestpassword skku_sfa_gallery_test';
        const externalData = fs.readFileSync(tempFiles.externalProfiles, 'utf8');

        try {
            execSync(externalImportCmd, { input: externalData, encoding: 'utf8' });
            console.log('✅ 외부 프로필 복사 완료');
        } catch (error) {
            console.log('⚠️ 외부 프로필 주입 건너뜀');
        }
    }

    console.log('');
    console.log('🎉 기본 테스트 데이터 복사 완료!');
    console.log('📋 복사된 사용자들:');
    console.log('   - skkfntclbdmnsttrt (ADMIN)');
    console.log('   - duplicate1749455784069 (SKKU_MEMBER + 프로필)');
    console.log('   - external1749455846376 (EXTERNAL_MEMBER + 프로필)');
    console.log('');

    // 6. 복사 결과 검증
    console.log('🔍 복사 결과 검증 중...');
    try {
        const verifyCmd = 'docker exec skku_gallery_mysql_test mysql -u root -ptestpassword skku_sfa_gallery_test -se "SELECT username, user_type FROM user_accounts ORDER BY username"';
        const verifyResult = execSync(verifyCmd, { encoding: 'utf8' });
        console.log('✅ 테스트 DB에 실제 저장된 사용자들:');
        if (verifyResult.trim()) {
            verifyResult.trim().split('\n').forEach(line => {
                const [username, userType] = line.split('\t');
                console.log(`   - ${username} (${userType})`);
            });
        } else {
            console.log('⚠️ 테스트 DB가 비어있습니다!');
        }
    } catch (error) {
        console.error('❌ 검증 실패:', error.message);
    }

    console.log('');
    console.log('🧪 이제 E2E 테스트를 실행할 수 있습니다!');

} catch (error) {
    console.error('❌ 스크립트 실행 중 오류 발생:', error.message);
    process.exit(1);
} finally {
    // 임시 파일 정리
    Object.values(tempFiles).forEach(file => {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        } catch (error) {
            // 정리 실패는 무시
        }
    });
}
