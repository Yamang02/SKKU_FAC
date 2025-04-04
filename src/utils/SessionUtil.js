class SessionUtil {
    static async saveUserToSession(req, user) {
        return new Promise((resolve, reject) => {
            // 세션 데이터 설정
            req.session.user = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
                department: user.department || '',
                studentYear: user.studentYear || '',
                affiliation: user.affiliation || ''
            };

            // 세션 저장
            req.session.save((err) => {
                if (err) {
                    console.error('세션 저장 중 오류:', err);
                    reject(err);
                } else {
                    console.log('세션 저장 완료:', req.session.user);
                    resolve();
                }
            });
        });
    }

    static destroySession(req) {
        console.log('destroySession 호출됨');
        console.log('세션 초기 상태:', req.session);
        return new Promise((resolve) => {
            req.session.user = null;
            console.log('세션 user null로 설정');
            req.session.save((err) => {
                if (err) {
                    console.error('세션 저장 중 오류:', err);
                } else {
                    console.log('세션 저장 완료');
                    console.log('세션 최종 상태:', req.session);
                }
                resolve();
            });
        });
    }
}

export default SessionUtil;
