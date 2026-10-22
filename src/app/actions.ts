"use server";

import { db } from "@/lib/db";
import { Status } from "@prisma/client";

export async function getOrCreateUser(
  username: string,
  name: string,
  timezone: string,
) {
  let user = await db.user.findUnique({
    where: { username },
    include: { availability: true },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        username,
        name,
        timezone,
      },
      include: { availability: true },
    });
  }

  return user;
}

export async function updateAvailabilityBlock(
  userId: string,
  dayOfWeek: number,
  utcHour: number,
  status: Status,
) {
  return await db.availabilityBlock.upsert({
    where: {
      userId_dayOfWeek_utcHour: {
        userId,
        dayOfWeek,
        utcHour,
      },
    },
    update: {
      status,
    },
    create: {
      userId,
      dayOfWeek,
      utcHour,
      status,
    },
  });
}
