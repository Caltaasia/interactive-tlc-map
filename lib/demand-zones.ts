export interface DemandPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "industrial" | "city" | "border";
}

export interface VoidZone {
  id: string;
  name: string;
  description: string;
  points: [number, number][];
}

export interface DuplicationZone {
  id: string;
  name: string;
  description: string;
  points: [number, number][];
}

export const industrialZones: DemandPoint[] = [
  {
    id: "ind-01",
    name: "Актюбинская промзона",
    lat: 50.3044,
    lng: 57.1667,
    type: "industrial",
  },
  {
    id: "ind-02",
    name: "Карагандинская промзона",
    lat: 49.8067,
    lng: 73.0855,
    type: "industrial",
  },
  {
    id: "ind-03",
    name: "Павлодарская промзона",
    lat: 52.2833,
    lng: 76.9667,
    type: "industrial",
  },
  {
    id: "ind-04",
    name: "Усть-Каменогорская промзона",
    lat: 49.9833,
    lng: 82.6167,
    type: "industrial",
  },
  {
    id: "ind-05",
    name: "Костанайская промзона",
    lat: 53.2167,
    lng: 63.6167,
    type: "industrial",
  },
  {
    id: "ind-06",
    name: "Жезказганская промзона",
    lat: 47.7833,
    lng: 67.7667,
    type: "industrial",
  },
  {
    id: "ind-07",
    name: "Атырауская нефтехимическая",
    lat: 47.1167,
    lng: 51.8833,
    type: "industrial",
  },
  {
    id: "ind-08",
    name: "Актауская промзона",
    lat: 43.6507,
    lng: 51.1556,
    type: "industrial",
  },
  {
    id: "ind-09",
    name: "Шымкентская промзона",
    lat: 42.3417,
    lng: 69.5901,
    type: "industrial",
  },
  {
    id: "ind-10",
    name: "Таразская промзона",
    lat: 42.9167,
    lng: 71.3667,
    type: "industrial",
  },
];

export const majorCities: DemandPoint[] = [
  { id: "city-01", name: "Астана", lat: 51.1605, lng: 71.4704, type: "city" },
  { id: "city-02", name: "Алматы", lat: 43.2565, lng: 76.9285, type: "city" },
  { id: "city-03", name: "Шымкент", lat: 42.3417, lng: 69.5901, type: "city" },
  { id: "city-04", name: "Актобе", lat: 50.3044, lng: 57.1667, type: "city" },
  {
    id: "city-05",
    name: "Караганда",
    lat: 49.8067,
    lng: 73.0855,
    type: "city",
  },
  {
    id: "city-06",
    name: "Павлодар",
    lat: 52.2833,
    lng: 76.9667,
    type: "city",
  },
  { id: "city-07", name: "Атырау", lat: 47.1167, lng: 51.8833, type: "city" },
  { id: "city-08", name: "Уральск", lat: 51.2333, lng: 51.3667, type: "city" },
  { id: "city-09", name: "Тараз", lat: 42.9167, lng: 71.3667, type: "city" },
  {
    id: "city-10",
    name: "Костанай",
    lat: 53.2167,
    lng: 63.6167,
    type: "city",
  },
  {
    id: "city-11",
    name: "Кызылорда",
    lat: 44.85,
    lng: 65.5167,
    type: "city",
  },
  { id: "city-12", name: "Актау", lat: 43.6507, lng: 51.1556, type: "city" },
  {
    id: "city-13",
    name: "Семей",
    lat: 50.4333,
    lng: 80.2667,
    type: "city",
  },
  {
    id: "city-14",
    name: "Усть-Каменогорск",
    lat: 49.9833,
    lng: 82.6167,
    type: "city",
  },
  {
    id: "city-15",
    name: "Петропавловск",
    lat: 54.8833,
    lng: 69.1667,
    type: "city",
  },
  {
    id: "city-16",
    name: "Кокшетау",
    lat: 53.2833,
    lng: 69.3833,
    type: "city",
  },
  {
    id: "city-17",
    name: "Туркестан",
    lat: 43.3,
    lng: 68.25,
    type: "city",
  },
  {
    id: "city-18",
    name: "Жезказган",
    lat: 47.7833,
    lng: 67.7667,
    type: "city",
  },
  {
    id: "city-19",
    name: "Талдыкорган",
    lat: 45.0167,
    lng: 78.3833,
    type: "city",
  },
  {
    id: "city-20",
    name: "Экибастуз",
    lat: 51.6667,
    lng: 75.3667,
    type: "city",
  },
];

export const voidZones: VoidZone[] = [
  {
    id: "void-01",
    name: "Внутренние районы Мангистау",
    description:
      "Зона спроса, не покрытая зонами доступности ТЛЦ (Мангистауская область)",
    points: [
      [43.5, 54.0],
      [43.5, 56.5],
      [44.5, 56.5],
      [44.5, 54.0],
    ],
  },
  {
    id: "void-02",
    name: "Внутренние районы Атырау",
    description:
      "Зона спроса, не покрытая зонами доступности ТЛЦ (Атырауская область)",
    points: [
      [46.0, 53.5],
      [46.0, 55.5],
      [47.5, 55.5],
      [47.5, 53.5],
    ],
  },
  {
    id: "void-03",
    name: "Павлодарское направление",
    description:
      "Зона спроса, не покрытая зонами доступности ТЛЦ (север Павлодарской области)",
    points: [
      [52.5, 75.5],
      [52.5, 77.5],
      [53.5, 77.5],
      [53.5, 75.5],
    ],
  },
  {
    id: "void-04",
    name: "Кызылординское направление",
    description:
      "Зона спроса, не покрытая зонами доступности ТЛЦ (юг Кызылординской области)",
    points: [
      [43.0, 63.5],
      [43.0, 65.5],
      [44.5, 65.5],
      [44.5, 63.5],
    ],
  },
];

export const duplicationZones: DuplicationZone[] = [
  {
    id: "dup-01",
    name: "Регион Алматы",
    description:
      "Зона дублирования — несколько однотипных ТЛЦ (Алматы, КДС Алматы, Каскелен, Алатау)",
    points: [
      [43.0, 76.4],
      [43.0, 77.2],
      [43.5, 77.2],
      [43.5, 76.4],
    ],
  },
];
