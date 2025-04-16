import express from 'express';
import AuthApiController from './AuthApiController.js';

const AuthRouter = express.Router();
const authApiController = new AuthApiController();

AuthRouter.post('/verify-email', authApiController.verifyEmail);
AuthRouter.post('/request-password-reset', authApiController.requestPasswordReset);
AuthRouter.post('/reset-password', authApiController.resetPassword);

export default AuthRouter;
