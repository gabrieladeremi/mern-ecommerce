import Coupon from '../models/coupon.js';

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });

        res.status(200).json({ success: true, data: coupon || null });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code, userId: req.user._id, isActive: true });

        if (!code) {
            return res.code(404).json({ success: false, message: "Coupon not found" });
        }

        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.code(400).json({ success: false, message: "Coupon expired" });
        }
        
        res.status(200).json({
            success: true,
            message: "Coupon is valid",
            data: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage
            }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}