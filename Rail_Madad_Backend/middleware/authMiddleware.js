import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

    req.userId = decoded.id;  // अब userId request में attach हो जाएगा
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
};
