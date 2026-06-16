import fs from "fs";
import path from "path";
import prisma from "../prismaClient.js";

// helper to convert BigInt date fields to Number for JSON responses
const serializeProduct = (product) => ({
    ...product,
    date: Number(product.date),
});

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter(
            (item) => item !== undefined
        );

        const imagesUrl = images.map(
            (item) => `${process.env.BASE_URL}/uploads/${item.filename}`
        );

        const product = await prisma.product.create({
            data: {
                name,
                description,
                category,
                price: Number(price),
                subCategory,
                bestseller: bestseller === "true" || bestseller === true,
                sizes: JSON.parse(sizes),
                image: imagesUrl,
                date: BigInt(Date.now()),
            },
        });

        res.json({ success: true, message: "Product Added", product: serializeProduct(product) });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { date: "desc" },
        });
        res.json({ success: true, products: products.map(serializeProduct) });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for removing product
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        const product = await prisma.product.findUnique({ where: { id } });

        if (product) {
            // remove local image files
            product.image.forEach((url) => {
                const filename = url.split("/uploads/")[1];
                if (filename) {
                    const filePath = path.join(process.cwd(), "uploads", filename);
                    fs.unlink(filePath, (err) => {
                        if (err) console.log("Failed to delete file:", filePath);
                    });
                }
            });
        }

        await prisma.product.delete({ where: { id } });

        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await prisma.product.findUnique({ where: { id: productId } });
        res.json({ success: true, product: product ? serializeProduct(product) : null });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct };
