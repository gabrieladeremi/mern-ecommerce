import express from 'express';

import { protectRoute } from '../middleware/auth.js';

import { login, logout, signup, getProfile, refreshToken } from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);

router.post('/signup', signup);

router.post('/logout', logout);

router.post('/refresh-token', refreshToken);

router.get('/profile', protectRoute, getProfile)

export default router;