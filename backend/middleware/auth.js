import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const protectRoute = async (req, res, next) => { 
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) { 
            return res.status(401).json({ success: false, message: 'Unauthorized, no access token provided' });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized, user not found' });
            }

            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Unauthorized, token expired' });
            }

            throw error;
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const adminRoute = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        return res.status(403).json({ success: false, message: 'Forbidden, admin access required' });
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}