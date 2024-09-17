import prisma from "../utils/prismaClient";

const createUser = async (walletId: string, referralCode?: string) => {
  const checkUser = await prisma.user.findFirst({
    where: { walletId },
  });
  if (checkUser) {
    return { id: checkUser.id };
  }
  try {
    const user = await prisma.user.create({
      data: {
        walletId,
        referralCode: String(referralCode),
      },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
};

export { createUser };
