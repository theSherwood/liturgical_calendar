import { describe, expect, it } from "vitest";
import {
  sabbathDatesBetween,
  sabbathOnOrAfter,
  sabbathOnOrBefore,
  trackIndex,
  weeksSinceEpoch,
} from "../src/core/sabbath.js";

const SUNDAY = 0;
const EPOCH = "2024-01-07"; // a Sunday

describe("sabbathOnOrBefore", () => {
  it("returns the same date when it is already the Sabbath weekday", () => {
    expect(sabbathOnOrBefore("2026-07-19", SUNDAY)).toBe("2026-07-19"); // a Sunday
  });

  it("walks back to the week's opening Sabbath from any weekday", () => {
    // Jul 19 2026 is a Sunday; every day up to the next Sat maps back to it.
    expect(sabbathOnOrBefore("2026-07-22", SUNDAY)).toBe("2026-07-19"); // Wed
    expect(sabbathOnOrBefore("2026-07-25", SUNDAY)).toBe("2026-07-19"); // Sat
    expect(sabbathOnOrBefore("2026-07-26", SUNDAY)).toBe("2026-07-26"); // next Sun
  });

  it("respects a different Sabbath weekday", () => {
    // Saturday = 6. Jul 22 (Wed) maps back to Sat Jul 18.
    expect(sabbathOnOrBefore("2026-07-22", 6)).toBe("2026-07-18");
  });
});

describe("sabbathOnOrAfter", () => {
  it("returns the same date when it is already the Sabbath weekday", () => {
    expect(sabbathOnOrAfter("2026-07-26", SUNDAY)).toBe("2026-07-26"); // a Sunday
  });

  it("jumps forward to the upcoming Sabbath from any weekday", () => {
    // Jul 26 2026 is a Sunday; the days before it map forward to it.
    expect(sabbathOnOrAfter("2026-07-21", SUNDAY)).toBe("2026-07-26"); // Tue
    expect(sabbathOnOrAfter("2026-07-25", SUNDAY)).toBe("2026-07-26"); // Sat
    expect(sabbathOnOrAfter("2026-07-27", SUNDAY)).toBe("2026-08-02"); // Mon → next Sun
  });

  it("respects a different Sabbath weekday", () => {
    // Saturday = 6. Jul 22 (Wed) maps forward to Sat Jul 25.
    expect(sabbathOnOrAfter("2026-07-22", 6)).toBe("2026-07-25");
  });
});

describe("weeksSinceEpoch / trackIndex", () => {
  it("counts whole weeks from the epoch", () => {
    expect(weeksSinceEpoch("2024-01-07", EPOCH)).toBe(0);
    expect(weeksSinceEpoch("2024-01-14", EPOCH)).toBe(1);
    expect(weeksSinceEpoch("2023-12-31", EPOCH)).toBe(-1);
  });

  it("cycles through the track and is stable within a week", () => {
    const len = 4;
    // Four consecutive Sabbaths cycle 0,1,2,3 then wrap to 0.
    expect(trackIndex("2026-07-19", EPOCH, len)).toBe(0);
    expect(trackIndex("2026-07-26", EPOCH, len)).toBe(1);
    expect(trackIndex("2026-08-02", EPOCH, len)).toBe(2);
    expect(trackIndex("2026-08-09", EPOCH, len)).toBe(3);
    expect(trackIndex("2026-08-16", EPOCH, len)).toBe(0);
  });

  it("handles dates before the epoch without going negative", () => {
    expect(trackIndex("2023-12-31", EPOCH, 4)).toBe(3); // one week before → last rung
  });

  it("returns -1 for an empty track", () => {
    expect(trackIndex("2026-07-19", EPOCH, 0)).toBe(-1);
  });
});

describe("sabbathDatesBetween", () => {
  it("yields every Sabbath in range, all on the Sabbath weekday", () => {
    const dates = sabbathDatesBetween("2026-01-01", "2026-12-31", SUNDAY);
    expect(dates.length).toBe(52); // 2026 has 52 Sundays
    expect(dates[0]).toBe("2026-01-04"); // first Sunday of 2026
    expect(dates.at(-1)).toBe("2026-12-27");
    for (const d of dates) {
      const [y, m, day] = d.split("-").map(Number);
      expect(new Date(Date.UTC(y, m - 1, day)).getUTCDay()).toBe(SUNDAY);
    }
  });
});
