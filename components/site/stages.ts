/** The school's five stages, in order, matching the `wing` on each class. */
export const STAGES = [
  { wing: "Pre-primary", range: "Pre-Nursery, Nursery, LKG, UKG", ages: "Ages 3 to 6" },
  { wing: "Primary", range: "Classes I to V", ages: "Ages 6 to 11" },
  { wing: "Middle", range: "Classes VI to VIII", ages: "Ages 11 to 14" },
  { wing: "Secondary", range: "Classes IX and X", ages: "Class X board exams" },
  { wing: "Senior Secondary", range: "Classes XI and XII", ages: "Class XII board exams" },
];

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
