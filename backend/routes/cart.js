import express from 'express';

import { protectRoute } from '../middleware/auth.js';
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from '../controllers/cart.js';

const router = express.Router();

router.get("/products", protectRoute, getCartProducts);

router.post("/", protectRoute, addToCart);

router.delete("/", protectRoute, removeAllFromCart);

router.patch("/:id", protectRoute, updateQuantity);

export default router;
