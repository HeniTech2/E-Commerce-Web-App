import prisma from "./prismaClient.js";

const products = [
    {
        name: "Wireless Noise-Cancelling Headphones",
        description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
        price: 199.99,
        image: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
        category: "Men",
        subCategory: "Topwear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: true,
    },
    {
        name: "Smartwatch Series 7",
        description: "Fitness tracking, heart-rate monitor, GPS, and 18-hour battery life.",
        price: 299.0,
        image: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
        category: "Men",
        subCategory: "Winterwear",
        sizes: ["S", "M", "L"],
        bestseller: false,
    },
    {
        name: "Classic Leather Jacket",
        description: "Genuine leather jacket with a timeless silhouette.",
        price: 159.99,
        image: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"],
        category: "Men",
        subCategory: "Winterwear",
        sizes: ["M", "L", "XL"],
        bestseller: true,
    },
    {
        name: "Minimalist Sneakers",
        description: "Comfortable everyday sneakers made from sustainable materials.",
        price: 89.0,
        image: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
        category: "Men",
        subCategory: "Bottomwear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: false,
    },
    {
        name: "Cotton Oversized Hoodie",
        description: "Soft, breathable hoodie for everyday comfort.",
        price: 49.99,
        image: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"],
        category: "Women",
        subCategory: "Topwear",
        sizes: ["S", "M", "L"],
        bestseller: true,
    },
    {
        name: "Linen Throw Blanket",
        description: "Soft woven linen blanket, perfect for cozy evenings.",
        price: 59.0,
        image: ["https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600"],
        category: "Women",
        subCategory: "Winterwear",
        sizes: ["M", "L"],
        bestseller: false,
    },
    {
        name: "Vitamin C Serum Tee",
        description: "Graphic t-shirt with bright print design.",
        price: 24.99,
        image: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"],
        category: "Women",
        subCategory: "Topwear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: false,
    },
    {
        name: "Kids Graphic T-Shirt",
        description: "Fun printed t-shirt for kids, soft cotton fabric.",
        price: 19.99,
        image: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"],
        category: "Kids",
        subCategory: "Topwear",
        sizes: ["S", "M"],
        bestseller: true,
    },
    {
        name: "Kids Denim Jeans",
        description: "Durable and comfortable denim jeans for everyday play.",
        price: 34.0,
        image: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600"],
        category: "Kids",
        subCategory: "Bottomwear",
        sizes: ["S", "M", "L"],
        bestseller: false,
    },
    {
        name: "Kids Winter Jacket",
        description: "Warm, insulated jacket for cold weather adventures.",
        price: 54.5,
        image: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"],
        category: "Kids",
        subCategory: "Winterwear",
        sizes: ["S", "M", "L"],
        bestseller: true,
    },
];

(async () => {
    try {
        const existing = await prisma.product.count();

        if (existing > 0) {
            console.log(`Products already exist (${existing}), skipping seed.`);
            return;
        }

        for (const p of products) {
            await prisma.product.create({
                data: {
                    ...p,
                    date: BigInt(Date.now()),
                },
            });
        }

        console.log(`Seeded ${products.length} products`);
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
})();