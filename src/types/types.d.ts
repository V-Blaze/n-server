import { Admin } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    admin?: Admin;
  }
}

export interface UserDetails {
  id: number;
  uuid: string;
  walletId: string;
  referralCode: string;
}

export interface Res {
  id: number;
  address: string;
  code: string;
  uplinkId: number | null;
}

export interface RefDetails extends Res {
  userId: number;
  uuid: string;
  uplineCode: string | null;
  upline: number;
  uplines: Array<Res>;
  downlines: {
    firstLevel: number;
    secondLevel: number;
    thirdLevel: number;
  };
  children?: Array<Res>;
}
