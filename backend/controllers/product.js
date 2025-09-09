import Product from '../models/product.js';
import {redis} from '../lib/redis.js';
import cloudinary from '../lib/cloudinary.js';

const updatedFeaturedProduct = async () => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true });

        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.error(error.message);
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({ success: true, data: products });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");

        if (featuredProducts) {
            return res.status(200).json({ success: true, data: JSON.parse(featuredProducts) });
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ success: false, message: 'No featured products found' });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));

        return res.status(200).json({ success: true, data: featuredProducts });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const createProduct = async (req, res) => { 
    try {
        const { name, price, description, category, image } = req.body;

        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const newProduct = await Product.create({
            name,
            price,
            description,
            category,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : ""
        });

        res.status(201).json({ success: true, data: newProduct });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// for optimization purpose, product.findByIdAndDelete is best used, and failed product image deletion is handled with a catch 
// saved in redis and retried
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!deleteProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.image) {
            const publicId = product.image.split('/').pop().split('.')[0];

            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log(`Successfully deleted image: products/${publicId}`);
            } catch (error) {
                console.error(error.message);
            }
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 3 }
            },
            {
                $project: { _id: 1, name: 1, price: 1, image: 1, description: 1}
            }
        ]);

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getProductByCategory = async (req, res) => { 
    try {
        const { category } = req.params;

        const products = await Product.find({ category });

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const toggleFeaturedProduct = async (req, res) => { 
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isFeatured = !product.isFeatured;

        const updatedProduct = await product.save();

        await updatedFeaturedProduct();

        res.status(200).json({ success: true, data: updatedProduct });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}