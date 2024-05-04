"use server";

import apn from "apn";
import { db } from "@/server/prisma";
import { auth } from "@clerk/nextjs/server";
import { handlePrismaError } from "@/server/error";
import type { SubTier } from "@prisma/client";

export async function getUserSettings(userId: string) {
  const { userId: myId } = auth();

  if (!myId || myId !== userId) {
    return {
      tier: "FREE" as SubTier,
      deviceToken: null,
      blockerUsers: [],
    };
  }

  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        deviceToken: true,
        blockerUsers: {
          select: {
            blockee: {
              select: { id: true, username: true, imageUrl: true },
            },
          },
        },
      },
    });
  } catch (e) {
    throw new Error(handlePrismaError(e));
  }
}

export async function updateUserDeviceToken(
  userId: string,
  deviceToken: string,
) {
  const { userId: myId } = auth();

  if (!myId || myId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    return await db.user.update({
      where: { id: userId },
      data: { deviceToken },
    });
  } catch (e) {
    throw new Error(handlePrismaError(e));
  }
}

export async function sendAPN({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) {
  const { userId: myId } = auth();

  if (!myId) {
    throw new Error("Unauthorized");
  }

  const apnProvider = new apn.Provider({
    token: {
      key: Buffer.from(process.env.APNS_KEY!, "base64").toString("ascii"),
      keyId: process.env.APNS_KEY_ID!,
      teamId: process.env.APNS_TEAM_ID!,
    },
    production: process.env.NODE_ENV === "production" ? true : false,
  });

  const notification = new apn.Notification({
    alert: {
      title: title,
      body: body,
    },
    sound: "default",
    badge: 1,
    topic: "com.mjorge.ipollist", // Your app bundle identifier
  });

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { deviceToken: true },
    });

    if (!user?.deviceToken) return;

    const response = await apnProvider.send(notification, user.deviceToken);
    console.log("Sent:", response.sent.length);
    console.log("Failed:", response.failed.length);
    console.log(response.failed);
  } catch (e) {
    console.error(e);
  }

  apnProvider.shutdown();
}
