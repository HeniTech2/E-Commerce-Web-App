import prisma from "../prismaClient.js";

// add product to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        let cartData = user.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await prisma.user.update({ where: { id: userId }, data: { cartData } });

        res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// update user cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        let cartData = user.cartData || {};

        if (!cartData[itemId]) cartData[itemId] = {};
        cartData[itemId][size] = quantity;

        await prisma.user.update({ where: { id: userId }, data: { cartData } });

        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        res.json({ success: true, cartData: user.cartData || {} });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart };
