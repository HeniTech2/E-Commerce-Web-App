import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please log in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin tokens have no "id" — they are not customer accounts
    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Please sign in with a customer account.",
      });
    }

    // Always trust the token, never a userId sent by the browser
    req.userId = decoded.id;
    if (req.body && typeof req.body === "object") {
      req.body.userId = decoded.id;
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Your session expired. Please log in again.",
    });
  }
};

export default authUser;