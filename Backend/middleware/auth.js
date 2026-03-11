const jwt = require("jsonwebtoken");

const auth = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length > 0 && !roles.includes(payload.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;
