import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { uuidValidate } from "../utils/uuidUtils";

export const addStaker = async (req: Request, res: Response) => {
  const { uuid } = req.body;

  if (typeof uuid !== "string" || !uuidValidate(uuid)) {
    return res
      .status(400)
      .json({ error: "Invalid sticker value. Must be a valid UUID." });
  }

  try {
    // Create a new sticker entry in the database
    const sticker = await prisma.staker.create({
      data: { uuid },
    });

    res.status(201).json(sticker);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addNewRef = async (req: Request, res: Response) => {
  const { uuid, walletId, referralCode } = req.body;

  if (typeof uuid !== "string" || !uuidValidate(uuid)) {
    return res
      .status(400)
      .json({ error: "Invalid staker UUID value. Must be a valid UUID." });
  }

  const stakeWallet = await prisma.user.findUnique({
    where: { uuid },
  });

  if (stakeWallet?.walletId === walletId) {
    return res
      .status(400)
      .json({ error: "A user with the wallet already exists." });
  }

  if (stakeWallet?.referralCode === referralCode) {
    return res
      .status(400)
      .json({ error: "A user with the referralCode already exists." });
  }
  try {
    // Create a new sticker entry in the database
    const sticker = await prisma.user.create({
      data: { uuid, walletId, referralCode },
    });

    res.status(201).json(sticker);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRef = async (req: Request, res: Response) => {
  const { ref } = req.query;

  if (!ref) {
    return res.status(400).json({ error: "No refferal code passed" });
  }

  try {
    const getId = await prisma.referralw.findUnique({
      where: { code: String(ref) },
    });

    if (!getId) {
      return res
        .status(404)
        .json({ error: `No Referral with the code ${ref}` });
    }
    const { code } = getId;

    res.status(200).json({ code });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
