class SessionUtil {
    static async saveUserToSession(req, user) {
        req.session.user = user;
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static destroySession(req) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout error:', err);
                }
                resolve();
            });
        });
    }
}

export default SessionUtil;
