import prisma from "../prismaClient.js";

// GET wishlist — returns full product objects
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.json({ success: false, message: "User not found" });

    const products = user.wishlist.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: user.wishlist } },
        })
      : [];

    const serialize = (p) => ({ ...p, date: Number(p.date) });
    res.json({ success: true, wishlist: user.wishlist, products: products.map(serialize) });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// TOGGLE — adds if not present, removes if present
const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!productId) return res.json({ success: false, message: "productId required" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.json({ success: false, message: "User not found" });

    const already = user.wishlist.includes(productId);
    const updated = already
      ? user.wishlist.filter((id) => id !== productId)
      : [...user.wishlist, productId];

    await prisma.user.update({
      where: { id: userId },
      data: { wishlist: updated },
    });

    res.json({
      success: true,
      added: !already,
      wishlist: updated,
      message: already ? "Removed from wishlist" : "Added to wishlist",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getWishlist, toggleWishlist };