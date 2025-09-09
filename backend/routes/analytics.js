import express from 'express';

import { protectRoute, adminRoute } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analytics.js';

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAnalytics);

export default router;