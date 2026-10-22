import { connection } from "next/server";
import { getOrCreateUser } from "@/app/actions";
import ScheduleGrid from "@/components/ScheduleGrid";
import { Status } from "@prisma/client";

export const instant = false;

export default async function Home() {
  await connection();

  const user = await getOrCreateUser(
    "demo-user",
    "Demo User",
    "America/New_York",
  );

  // Explicitly type initialBlocks as Record<string, Status>
  const initialBlocks: Record<string, Status> = {};
  user.availability.forEach(
    (b: { dayOfWeek: number; utcHour: number; status: Status }) => {
      initialBlocks[`${b.dayOfWeek}-${b.utcHour}`] = b.status;
    },
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          ShiftSync
        </h1>
      </header>

      <ScheduleGrid
        userId={user.id}
        timezone={user.timezone}
        initialBlocks={initialBlocks}
      />
    </main>
  );
}
