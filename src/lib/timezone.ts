import { DateTime } from "luxon";

export interface HourSlot {
  utcHour: number;
  localHour: number;
  label: string;
}

/**
 * Converts local day & hour into UTC day & hour based on target timezone.
 */
export function localToUTC(
  dayOfWeek: number,
  localHour: number,
  timezone: string,
) {
  // Use a fixed reference week to perform stable hour math
  const refDate = DateTime.fromObject(
    { year: 2026, month: 1, day: 4 + dayOfWeek, hour: localHour },
    { zone: timezone },
  ).toUTC();

  return {
    utcDay: refDate.weekday % 7, // Convert Luxon 1-7 (Mon-Sun) to 0-6 (Sun-Sat)
    utcHour: refDate.hour,
  };
}

/**
 * Maps 24 UTC hours into the user's local hour slots for display.
 */
export function getLocalHoursForTimezone(timezone: string): HourSlot[] {
  const slots: HourSlot[] = [];
  const now = DateTime.now().setZone(timezone);

  for (let hour = 0; hour < 24; hour++) {
    const localDt = now.set({ hour, minute: 0 });
    const utcDt = localDt.toUTC();

    slots.push({
      utcHour: utcDt.hour,
      localHour: hour,
      label: localDt.toFormat("hh:a"),
    });
  }

  return slots;
}
