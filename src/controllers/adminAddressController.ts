import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { createUser } from "../functions/users";
import { generateRandomString } from "../utils/randomString";

export const addAdminAddress = async (req: Request, res: Response) => {
  const { address, type, adminId } = req.body;

  if (!address) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }
  if (!type) {
    return res.status(400).json({ error: "No Wallet Address type passed." });
  }

  try {
    // Initialize admin wallet
    createUser(address, generateRandomString(10));
    const result = await prisma.adminAddress.create({
      data: {
        adminId,
        type,
        address,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAdminAddress = async (req: Request, res: Response) => {
  try {
    const getAdmin =
      (await prisma.adminAddress.findFirst({
        where: { type: "admin", active: !!1 },
      })) || {};
    const getRefAdmin =
      (await prisma.adminAddress.findFirst({
        where: { type: "refAdmin", active: !!1 },
      })) || {};

    // if (!getAdmin && !getRefAdmin) {
    //   return res
    //     .status(404)
    //     .json({ error: `No Admin nor Ref Admin Address found` });
    // } else if (!getRefAdmin) {
    //   return res.status(404).json({ error: `No Ref Admin Address found` });
    // } else if (!getAdmin) {
    //   return res.status(404).json({ error: `No Admin Address found` });
    // }

    const result = { admin: getAdmin, refAdmin: getRefAdmin };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAdminAddress = async (req: Request, res: Response) => {
  const { address, currentAddress, type } = req.body;

  const adminId = req.admin?.id

  if (!address) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }
  if (!type) {
    return res.status(400).json({ error: "No Wallet Address type passed." });
  }

  if (!currentAddress) {
    return res.status(400).json({ error: "No Current Address passed." });
  }

  const getCurrentAddress = await prisma.adminAddress.findUnique({
    where: { address: currentAddress, type },
  });

  if (!getCurrentAddress) {
    return res
      .status(400)
      .json({ error: "Invalid Current Address Address passed." });
  }

  try {
    const updateAdmin = await prisma.adminAddress.update({
      where: { adminId: 1, address: currentAddress },
      data: { address },
    });

    res.status(200).json(updateAdmin);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
};