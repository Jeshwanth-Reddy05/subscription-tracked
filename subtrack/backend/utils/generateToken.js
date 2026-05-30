import jwt from "jsonwebtoken";

const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // If Express response object is passed, also set it as an HTTP-only cookie
  if (res && res.cookie) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};

export default generateToken;
