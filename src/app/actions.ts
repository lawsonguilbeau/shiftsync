"use server";

import { connection } from "next/server";
import { db } from "@/lib/db";
import { localToUTC } from "@/lib/timezone";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getOrCreateUser(
  username: string,
  name: string,
  timezone: string,
) {
  await connection();

  let user = await db.user.findUnique({
    where: { username },
    include: { availability: true },
  });

  if (!user) {
    user = await db.user.create({
      data: { username, name, timezone },
      include: { availability: true },
    });
  }

  return user;
}

export async function updateAvailabilityBlock(
  userId: string,
  userTimezone: string,
  dayOfWeek: number,
  localHour: number,
  status: Status,
) {
  const { utcDay, utcHour } = localToUTC(dayOfWeek, localHour, userTimezone);

  await db.availabilityBlock.upsert({
    where: {
      userId_dayOfWeek_utcHour: {
        userId,
        dayOfWeek: utcDay,
        utcHour,
      },
    },
    update: { status },
    create: {
      userId,
      dayOfWeek: utcDay,
      utcHour,
      status,
    },
  });

  revalidatePath("/");
}
