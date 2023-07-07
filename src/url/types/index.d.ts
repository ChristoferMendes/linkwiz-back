export interface DayStats {
  day: string;
  count: number;
}

export interface WeekStats {
  week: number;
  count: number;
  days: DayStats[];
}

export interface Click {
  date: string;
  count: number;
}
