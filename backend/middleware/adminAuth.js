import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please log in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Your session expired. Please log in again.",
    });
  }
};

export default adminAuth;