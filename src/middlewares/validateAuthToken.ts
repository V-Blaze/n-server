import { Request, Response, NextFunction } from "express";

const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
  console.log("req", req.hostname);
  const AUTH_TOKEN =
    process.env.AUTH_TOKEN || "a2fff7be-2395-47c5-9e23-455992f36007";

  const initAuthHeader = req.headers.authorization;
  const authHeader = initAuthHeader?.split(" ");
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization provided" });
  }

  if (authHeader[1] !== AUTH_TOKEN) {
    return res.status(403).json({ error: "Invalid authorization provided" });
  }

  next();
};

export default validateAuthToken;
