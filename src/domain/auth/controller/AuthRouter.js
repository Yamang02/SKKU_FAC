import express from 'express';
import AuthApiController from './AuthApiController.js';

const AuthRouter = express.Router();
const authApiController = new AuthApiController();

AuthRouter.post('/verify-email', authApiController.processEmailVerification.bind(authApiController));
AuthRouter.post('/request-password-reset', authApiController.requestPasswordReset.bind(authApiController));
AuthRouter.post('/reset-password', authApiController.resetPassword.bind(authApiController));
AuthRouter.post('/resend-token', authApiController.resendToken.bind(authApiController));
AuthRouter.get('/validate-token', authApiController.validateToken.bind(authApiController));

export default AuthRouter;
