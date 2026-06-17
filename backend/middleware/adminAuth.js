import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({
                success: false,
                message: "Not Authorized. Please login again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded?.role !== "admin") {
            return res.json({
                success: false,
                message: "Not Authorized. Please login again.",
            });
        }

        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth;