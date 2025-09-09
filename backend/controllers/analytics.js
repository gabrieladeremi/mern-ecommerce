import User from '../models/user.js';
import Product from '../models/product.js';
import Order from '../models/order.js';

export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({
            success: true,
            data: { analyticsData, dailySalesData }
        });

    } catch (error) {
        console.error("Error in analytics route", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            },
        },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }
};

const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map(date => {
            const data = dailySalesData.find(item => item._id === date);

            return {
                date,
                sales: data?.sales || 0,
                revenue: data?.revenue || 0
            }
        });
    } catch (error) {
        throw error;
    }
}

const getDatesInRange = (startDate, endDate) => {
    const dates = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates
}