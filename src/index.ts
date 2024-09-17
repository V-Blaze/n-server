// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import prisma from "./utils/prismaClient";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import stakersRoutes from "./routes/stakersRoutes";
import adminAddressRoutes from "./routes/adminAddressRoutes";
import referralRoutes from "./routes/referralRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MODE = process.env.MODE;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || origin === "http://localhost:7229") {
//         console.log("brower");
//         // Allow requests from this specific origin (your frontend)
//         callback(null, true);
//       } else if (!origin || origin === "http://192.168.43.123:7229") {
//         console.log("mobile");
//         // Allow requests from this specific origin (your frontend)
//         callback(null, true);
//       } else {
//         console.log("not allowed");
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Authorization", "Content-Type"],
//     credentials: true, // Enable credentials (cookies, HTTP auth, etc.)
//   })
// );

MODE !== "dev"
  ? app.use(
      cors({
        origin: (origin, callback) => {
          if (origin && ALLOWED_ORIGIN.split(",").includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
      })
    )
  : app.use(
      cors({
        origin: ALLOWED_ORIGIN.split(","),
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: !!1,
      })
    );

app.disable("x-powered-by");

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Server-Name", "Nestage Server");
  res.setHeader("X-Powered-By", "Nestage.io");
  next();
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", protectedRoutes);
app.use("/api/v1", stakersRoutes);
app.use("/api/v1", adminAddressRoutes);
app.use("/api/v1", referralRoutes);

app.get("/api/v1/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
});

app.get("/api/v1/ping", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Pong" });
});

prisma
  .$connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    res
      .status(403)
      .json({ message: "Access denied by Nestage Request Policy" });
  } else {
    next(err);
  }
});
