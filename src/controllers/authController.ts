import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prismaClient";
import { validationResult } from "../utils/validationUtils";

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json(admin);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Username already exists" });
  }
};

export const login = async (req: Request, res: Response) => {
  const JWT_SECRET = process.env.JWT_SECRET || "textkey";
  const MODE = process.env.MODE;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (
    admin &&
    admin.password &&
    (await bcrypt.compare(password, admin.password))
  ) {
    const timer = MODE === "dev" ? "30m" : "2h";
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: timer }
    );

    // Update last login time
    const log = await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const { password: _, ...rest } = log;

    const result = { ...rest, message: "Logged in successfully" };

    const maxAge =
      MODE === "prod" ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000;

    const origin = req.get("origin");
    let domain;

    if (MODE === "dev") {
      domain = "localhost:3000";
    } else{
      domain = ".nestage.io";
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: MODE === "prod",
      sameSite: "none",
      maxAge,
      domain: `${domain}`,
    });
    // username and id should be passed also
    res.json(result);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  res.status(200).json({ message: "ok" });
};

export const changePassword = async (req: Request, res: Response) => {
  const { newPassword, currentPassword } = req.body;

  const username = req.admin?.username;

  if (!newPassword) {
    return res.status(400).json({ error: "No New Password passed." });
  }
  if (!currentPassword) {
    return res.status(400).json({ error: "No Current Password passed." });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (
      admin &&
      admin.password &&
      (await bcrypt.compare(currentPassword, admin.password))
    ) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { username },
        data: { password: hashedPassword },
      });
      res.status(200).json("updated");
    } else {
      res.status(401).json({ error: "Invalid current password." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
