import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { Referral } from "@prisma/client";
import { generateRandomString } from "../utils/randomString";
import { createUser } from "../functions/users";
import { RefDetails, UserDetails } from "../types/types";

async function getAllParents(nodeId: number | null) {
  const uplinks: Referral[] = [];
  async function fetchUplink(currentId: number | null) {
    if (currentId === null) {
      return;
    }
    const hierarchy = await prisma.referralw.findUnique({
      where: { id: currentId },
      include: { uplink: true },
    });

    if (hierarchy && hierarchy.uplink) {
      uplinks.push(hierarchy.uplink);
      await fetchUplink(hierarchy.uplink.id);
    }
  }
  await fetchUplink(nodeId);
  return uplinks;
}

async function getDownlines(address: string) {
  const firstLevel = await prisma.referralw.findMany({
    where: {
      uplink: {
        address: address,
      },
    },
    include: {
      children: true,
    },
  });

  const firstLevelAddresses = firstLevel.map((referral) => referral.address);

  const secondLevel = await prisma.referralw.findMany({
    where: {
      uplink: {
        address: {
          in: firstLevelAddresses,
        },
      },
    },
    include: {
      children: true,
    },
  });

  const secondLevelAddresses = secondLevel.map((referral) => referral.address);

  const thirdLevel = await prisma.referralw.findMany({
    where: {
      uplink: {
        address: {
          in: secondLevelAddresses,
        },
      },
    },
  });

  const thirdLevelAddresses = thirdLevel.map((referral) => referral.address);

  return {
    firstLevel: firstLevelAddresses,
    secondLevel: secondLevelAddresses,
    thirdLevel: thirdLevelAddresses,
  };
}

export const addReferral = async (req: Request, res: Response) => {
  const { selfAddress, code } = req.body;
  console.log("here requested", selfAddress, code);

  let uplink = null;
  let vx;

  if (!selfAddress) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }
  if (code) {
    vx = await prisma.referralw.findUnique({
      where: { code },
    });
    if (vx) {
      const { id } = vx;
      uplink = id;
    }
  }

  if (uplink) {
    const checkAddressAndId = await prisma.referralw.findUnique({
      where: { address: selfAddress, id: uplink },
    });
    if (checkAddressAndId) {
      if (
        checkAddressAndId.address === selfAddress &&
        checkAddressAndId.id === uplink
      ) {
        return res.status(400).json({ error: "You can't referral yourself." });
      }
      if (
        checkAddressAndId?.uplinkId === null ||
        checkAddressAndId?.uplinkId > 0
      ) {
        return res.status(400).json({ error: "You can only have one Upline." });
      }
    }
  }

  const id = vx?.id;

  if (code && !id) {
    return res
      .status(400)
      .json({ error: `No registered referral with the uplink Code ${code}.` });
    // }
    //   const checkID = await prisma.referralw.findUnique({
    //     where: { id: Number(id) },
    //   });
    //   if (!checkID) {
  } else if (!id) {
    // return res.status(400).json({ error: `No uplink Code provided.` });
  }

  const checkAddress = await prisma.referralw.findUnique({
    where: { address: selfAddress },
  });

  if (checkAddress) {
    try {
      (async () => {
        const self = await prisma.referralw.findUnique({
          where: { id: checkAddress.id },
        });
        const parents = await getAllParents(checkAddress.id);
        const getUplineCode = await prisma.referralw.findFirst({
          where: { id: Number(self?.uplinkId) },
        });
        const result = {
          ...self,
          uplineCode: getUplineCode?.code || null,
          upline: parents.length,
          uplines: parents.slice(0, 3),
          userId: self?.id,
        };
        return res.status(200).json(result);
      })();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
    return 0;
  }

  // if (!id) {

  // }

  // if (uplink) {
  //   const checkID = await prisma.referralw.findUnique({
  //     where: { id: uplink },
  //   });
  //   if (!checkID) {
  //     return res
  //       .status(400)
  //       .json({ error: `No registered user with the uplink ID ${uplink}.` });
  //   }
  // }

  try {
    const code = await generateRandomString(8);
    if (!uplink) {
      const init = await prisma.referralw.create({
        data: {
          address: selfAddress,
          code,
        },
      });
      const user = await createUser(selfAddress, generateRandomString(10));
      // const getUplineCode = await prisma.referralw.findFirst({
      //   where: { id: Number(init.uplinkId) },
      // });
      const result = {
        ...init,
        uplineCode: null,
        upline: 0,
        uplines: [],
        userID: user?.id,
      };
      console.log("result", res);
      return res.status(201).json(result);
    } else {
      const init = await prisma.referralw.create({
        data: {
          address: selfAddress,
          code,
          // uplinkId: uplink,
          uplink: {
            connect: { id: uplink },
          },
        },
      });
      const getUplineCode = await prisma.referralw.findFirst({
        where: { id: Number(init.uplinkId) },
      });
      (async () => {
        const parents = await getAllParents(init.id);
        const user = await createUser(selfAddress, generateRandomString(10));
        const result = {
          ...init,
          uplineCode: getUplineCode?.code || null,
          upline: parents.length,
          uplines: parents.slice(0, 3),
          userId: user?.id,
        };
        return res.status(201).json(result);
      })();
      // const hierarchy = await prisma.referralw.findMany({
      //   where: { id: uplink },
      //   // where: { uplinkId: 1 },
      //   include: {
      //     children: {
      //       include: {
      //         children: true,
      //       },
      //     },
      //   },
      // });
    }
    // Initialize admin wallet
    // const result = await prisma.adminAddress.create({
    //   data: {
    //     adminId,
    //     type,
    //     address,
    //   },
    // });

    // res.status(201).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getReferral = async (req: Request, res: Response) => {
  const { code: codez } = req.query;
  const code = String(codez);

  if (!code) {
    return res.status(400).json({ error: `No uplink ID provided.` });
  }

  const checkID = await prisma.referralw.findUnique({
    where: { code },
  });
  if (!checkID) {
    return res
      .status(400)
      .json({ error: `No registered user with the uplink ID ${code}.` });
  }
  try {
    async function getAllParents(nodeId: number) {
      const uplinks: Referral[] = [];
      async function fetchUplink(currentId: number | null) {
        if (currentId === null) {
          return;
        }
        const hierarchy = await prisma.referralw.findUnique({
          where: { id: currentId },
          include: { uplink: true },
        });

        if (hierarchy && hierarchy.uplink) {
          uplinks.push(hierarchy.uplink);
          await fetchUplink(hierarchy.uplink.id);
        }
      }
      await fetchUplink(nodeId);
      return uplinks;
    }
    (async () => {
      const self = await prisma.referralw.findUnique({
        where: { code },
      });
      if (!self) return !!0;
      const getUplineCode = await prisma.referralw.findFirst({
        where: { id: Number(self.uplinkId) },
      });
      const parents = await getAllParents(self.id);
      const result = {
        ...self,
        uplineCode: getUplineCode?.code || null,
        upline: parents.length,
        uplines: parents.slice(0, 3),
      };
      return res.status(200).json(result);
    })();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getself = async (req: Request, res: Response) => {
  const { ref } = req.query;
  const address = String(ref);

  if (!address) {
    return res.status(400).json({ error: `No address provided.` });
  }

  const checkID = await prisma.referralw.findUnique({
    where: { address },
  });
  if (!checkID) {
    return res
      .status(400)
      .json({ error: `No registered user with the address ${address}.` });
  }
  try {
    (async () => {
      const self = (await prisma.referralw.findUnique({
        where: { address },
      })) || { id: 0, uplinkId: 0 };
      const getUplineCode = await prisma.referralw.findFirst({
        where: { id: Number(self?.uplinkId) },
      });
      const parents = await getAllParents(self?.id);
      const thirdLevelDownline = await getDownlines(address);
      const result = {
        ...self,
        uplineCode: getUplineCode?.code || null,
        upline: parents.length,
        uplines: parents.slice(0, 3),
        downlines: {
          firstLevel: thirdLevelDownline.firstLevel.length,
          secondLevel: thirdLevelDownline.secondLevel.length,
          thirdLevel: thirdLevelDownline.thirdLevel.length,
        },
      };
      return res.status(200).json(result);
    })();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllRefs = async (req: Request, res: Response) => {
  try {
    const getallrefs = (await prisma.referralw.findMany({
      where: { address: { not: "" } },
      include: {
        children: true,
      },
    })) as RefDetails[];

    const allrefs: RefDetails[] = await Promise.all(
      getallrefs.map(async (x) => {
        let code = null;
        if (x.uplinkId) {
          const getUplineCode = await prisma.referralw.findFirst({
            where: { id: x.uplinkId },
          });
          code = getUplineCode?.code;
        }

        const parents = await getAllParents(x.id);
        const getUserID = (await prisma.user.findUnique({
          where: { walletId: x.address },
        })) as UserDetails;
        const thirdLevelDownline = await getDownlines(x.address);

        const result: RefDetails = {
          ...x,
          userId: getUserID.id,
          uuid: getUserID.uuid,
          uplineCode: code || null,
          upline: parents.length,
          uplines: parents.slice(0, 3),
          downlines: {
            firstLevel: thirdLevelDownline.firstLevel.length,
            secondLevel: thirdLevelDownline.secondLevel.length,
            thirdLevel: thirdLevelDownline.thirdLevel.length,
          },
        };

        return result;
      })
    );

    return res.status(200).json(allrefs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReferral = async (req: Request, res: Response) => {
  const { id: codex } = req.params;
  const code = String(codex);

  if (!code) {
    return res.status(400).json({ error: `No uplink code provided.` });
  }

  const checkID = await prisma.referralw.findUnique({
    where: { code },
  });
  if (!checkID) {
    return res
      .status(400)
      .json({ error: `No registered user with the uplink ID ${code}.` });
  }

  try {
    async function deleteNodeAndHandleChildren(nodeId: number) {
      await prisma.$transaction(async (prisma) => {
        await prisma.referralw.updateMany({
          where: { uplinkId: nodeId },
          data: { uplinkId: null },
        });

        await prisma.referralw.delete({
          where: { id: nodeId },
        });
      });
    }

    (async () => {
      const nodeId = checkID.id;
      await deleteNodeAndHandleChildren(nodeId);
      return res.sendStatus(200);
    })();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAdminAddress = async (req: Request, res: Response) => {
  const { address, currentAddress, type, adminId } = req.body;

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
    where: { address: currentAddress, active: !!1 },
  });

  if (!getCurrentAddress) {
    return res
      .status(400)
      .json({ error: "Invalid Current Address Address passed." });
  }

  try {
    const updateAdmin = await prisma.adminAddress.update({
      where: { id: adminId, address: currentAddress },
      data: { address },
    });

    res.status(200).json(updateAdmin);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const payReferral = async (req: Request, res: Response) => {
  const { address, amount } = req.body;

  if (!address && !amount) {
    return res.status(400).json({ error: "Address and amount is required." });
  }

  if (!address) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }
  if (!amount) {
    return res.status(400).json({ error: "No amount passed." });
  }

  const getUserAddress = await prisma.user.findUnique({
    where: { walletId: address },
  });

  if (!getUserAddress) {
    return res
      .status(400)
      .json({ error: `No user with the address ${address} passed.` });
  }

  try {
    const i = await prisma.referralPayout.create({
      data: {
        address,
        amount,
      },
    });

    res.status(200).send("ok");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayReferral = async (req: Request, res: Response) => {
  const { address } = req.query;
  const walletId = String(address);

  if (!walletId) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }

  const getUserAddress = await prisma.user.findFirst({
    where: { walletId },
  });

  if (!getUserAddress) {
    return res
      .status(400)
      .json({ error: `No user with the address ${address} passed.` });
  }

  try {
    let amt: number = 0;

    const data = await prisma.referralPayout.findMany({
      where: { address: walletId },
    });

    if (data) {
      data.map((x) => (amt += Number(x.amount)));
      const result = { address, total: amt };

      res.status(200).json(result);
    } else {
      res.status(200).json({ address: walletId, total: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUserP = async (req: Request, res: Response) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }

  try {
    const data = await createUser(address, generateRandomString(10));

    res.status(200).json({ id: data?.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUserG = async (req: Request, res: Response) => {
  const { address: addr } = req.query;

  const address = String(addr);

  if (!address) {
    return res.status(400).json({ error: "No Wallet Address passed." });
  }

  try {
    const data = await createUser(address, generateRandomString(10));

    res.status(200).json({ id: data?.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
