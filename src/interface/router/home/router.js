import express from 'express';
import { getHome } from '../../../domain/home/controller/HomeController.js';

const router = express.Router();

router.get('/', getHome);

export default router;
