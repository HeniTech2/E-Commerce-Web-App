import prisma from "./prismaClient.js";

const products = [
    {
        name: "Habesha Kemis — Classic White",
        description: "Traditional hand-woven habesha kemis with tilet border detail. Pure cotton, handcrafted in Addis Ababa.",
        price: 1800,
        image: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4468?w=600"],
        category: "habesha",
        subCategory: "women",
        sizes: ["S", "M", "L", "XL"],
        bestseller: true,
        stock: 25,
    },
    {
        name: "Ethiopian Coffee Ceremony Set",
        description: "Complete jebena ceremony set: clay pot, 6 cini cups, and incense holder. Kiln-fired in Jimma.",
        price: 2400,
        image: ["https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600"],
        category: "coffee",
        subCategory: "ceremony",
        sizes: ["One Size"],
        bestseller: true,
        stock: 12,
    },
    {
        name: "Lalibela Cross Pendant",
        description: "Sterling silver replica of the Lalibela processional cross. Hand-engraved by artisans in Lalibela.",
        price: 950,
        image: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"],
        category: "jewelry",
        subCategory: "necklaces",
        sizes: ["One Size"],
        bestseller: true,
        stock: 40,
    },
    {
        name: "Hand-Tooled Leather Messenger Bag",
        description: "Full-grain Ethiopian leather bag with hand-stamped geometric pattern. Tanned in Addis Ababa's leather district.",
        price: 3200,
        image: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
        category: "leather",
        subCategory: "bags",
        sizes: ["One Size"],
        bestseller: false,
        stock: 8,
    },
    {
        name: "Injera Basket — Mesob",
        description: "Woven grass mesob serving basket with fitted lid. Traditional family heirloom design from Harari weavers.",
        price: 750,
        image: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600"],
        category: "home",
        subCategory: "kitchen",
        sizes: ["Small", "Large"],
        bestseller: false,
        stock: 30,
    },
    {
        name: "Gabi — Traditional Shawl",
        description: "Thick hand-loomed cotton gabi, warm enough for highland mornings. Natural off-white with coloured trim.",
        price: 1200,
        image: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        category: "habesha",
        subCategory: "shawls",
        sizes: ["One Size"],
        bestseller: false,
        stock: 18,
    },
    {
        name: "Silver Habesha Earrings",
        description: "Filigree silver drop earrings in the traditional Habesha style. Lightweight and hand-formed.",
        price: 680,
        image: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"],
        category: "jewelry",
        subCategory: "earrings",
        sizes: ["One Size"],
        bestseller: true,
        stock: 55,
    },
    {
        name: "Ethiopian Wall Art — Map Painting",
        description: "Acrylic-on-canvas map of Ethiopia with regional illustrations. Signed by local Addis Ababa artist.",
        price: 1600,
        image: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600"],
        category: "home",
        subCategory: "art",
        sizes: ["A3", "A2"],
        bestseller: false,
        stock: 6,
    },
    {
        name: "Yirgacheffe Single-Origin Coffee",
        description: "250g whole-bean coffee from Yirgacheffe cooperative. Washed process, floral and citrus notes.",
        price: 480,
        image: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"],
        category: "coffee",
        subCategory: "beans",
        sizes: ["250g", "500g", "1kg"],
        bestseller: true,
        stock: 100,
    },
    {
        name: "Leather Coin Purse",
        description: "Compact hand-stitched leather coin purse. Embossed with Ethiopian cross motif. Perfect gift.",
        price: 320,
        image: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"],
        category: "leather",
        subCategory: "accessories",
        sizes: ["One Size"],
        bestseller: false,
        stock: 3,
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
                data: { ...p, date: BigInt(Date.now()) },
            });
        }
        console.log(`Seeded ${products.length} Marqato products ✓`);
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
})();