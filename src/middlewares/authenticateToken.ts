import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
  const AUTH_TOKEN = process.env.AUTH_TOKEN || "testtoken";
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, admin: any) => {
    if (err) return res.sendStatus(403);

    const initAuthHeader = req.headers.authorization;
    const authHeader = initAuthHeader?.split(" ");
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization provided" });
    }

    if (authHeader[1] !== AUTH_TOKEN) {
      return res.status(403).json({ error: "Invalid authorization provided" });
    }
    req.admin = admin;
    next();
  });
};

export default authenticateToken;
