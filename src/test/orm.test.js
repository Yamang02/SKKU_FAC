import { sequelize } from '../config/database.js';
import Test from './models/Test.js';

async function testORM() {
    try {
        // 테이블 생성
        await Test.sync({ force: true });
        console.log('테이블이 성공적으로 생성되었습니다.');

        // 데이터 생성
        const test1 = await Test.create({
            name: '테스트1',
            value: 100
        });
        console.log('생성된 데이터 ID:', test1.id);
        console.log('생성된 데이터:', test1.toJSON());

        // 데이터 조회
        const foundTest = await Test.findByPk(test1.id);
        console.log('조회된 데이터:', foundTest.toJSON());

        // 데이터 수정
        await Test.update(
            { value: 200 },
            { where: { id: test1.id } }
        );
        const updatedTest = await Test.findByPk(test1.id);
        console.log('수정된 데이터:', updatedTest.toJSON());

        // 데이터 삭제
        await Test.destroy({
            where: { id: test1.id }
        });
        console.log('데이터가 삭제되었습니다.');

        // 모든 데이터 조회
        const allTests = await Test.findAll();
        console.log('모든 데이터:', allTests.map(test => test.toJSON()));

    } catch (error) {
        console.error('ORM 테스트 중 오류 발생:', error);
    } finally {
        // 연결 종료
        await sequelize.close();
    }
}

// 테스트 실행
testORM();
