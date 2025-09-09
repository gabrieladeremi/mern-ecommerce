import express from 'express';

import { protectRoute, adminRoute } from '../middleware/auth.js';
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getFeaturedProducts,
    getProductByCategory,
    getRecommendedProducts,
    toggleFeaturedProduct
} from '../controllers/product.js';

const router = express.Router();

router.get('/', protectRoute, adminRoute, getAllProducts);

router.get('/featured', getFeaturedProducts);

router.get('/recommendation', getRecommendedProducts);

router.get('/category/:category', getProductByCategory);

router.post('/', protectRoute, adminRoute, createProduct);  

router.patch('/:id', protectRoute, adminRoute, toggleFeaturedProduct);

router.delete('/:id', protectRoute, adminRoute, deleteProduct); 

export default router;