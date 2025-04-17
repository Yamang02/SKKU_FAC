import express from 'express';
import AuthApiController from './AuthApiController.js';

const AuthRouter = express.Router();
const authApiController = new AuthApiController();

AuthRouter.post('/verify-email', authApiController.verifyEmail.bind(authApiController));
AuthRouter.post('/request-password-reset', authApiController.requestPasswordReset.bind(authApiController));
AuthRouter.post('/reset-password', authApiController.resetPassword.bind(authApiController));

export default AuthRouter;
