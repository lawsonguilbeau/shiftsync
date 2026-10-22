import { db } from "@/lib/db";

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
