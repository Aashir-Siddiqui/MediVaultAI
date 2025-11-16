import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies?.[process.env.COOKIE_NAME];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, Login Please" });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodeToken.userId) {
      req.userId = decodeToken.userId;
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, Login Please" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized, Login Please" });
  }
};

export default authenticateUser;
