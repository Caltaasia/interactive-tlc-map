export interface RegionDensity {
  name: string;
  density: number;
  coordinates: number[][][];
}

export const regionsDensity: RegionDensity[] = [
  {
    name: "Акмолинская область",
    density: 4.5,
    coordinates: [
      [
        [65, 53],
        [74, 53],
        [74, 50],
        [65, 50],
      ],
    ],
  },
  {
    name: "Актюбинская область",
    density: 2.5,
    coordinates: [
      [
        [54, 52],
        [62, 52],
        [62, 47],
        [54, 47],
      ],
    ],
  },
  {
    name: "Алматинская область",
    density: 8,
    coordinates: [
      [
        [75, 47],
        [81, 47],
        [81, 43.2],
        [75, 43.2],
      ],
    ],
  },
  {
    name: "Атырауская область",
    density: 4,
    coordinates: [
      [
        [47, 49],
        [55, 49],
        [55, 46],
        [47, 46],
      ],
    ],
  },
  {
    name: "Западно-Казахстанская область",
    density: 3.5,
    coordinates: [
      [
        [46, 52],
        [54, 52],
        [54, 48],
        [46, 48],
      ],
    ],
  },
  {
    name: "Жамбылская область",
    density: 9,
    coordinates: [
      [
        [70, 45],
        [74, 45],
        [74, 42],
        [70, 42],
      ],
    ],
  },
  {
    name: "Область Жетісу",
    density: 5,
    coordinates: [
      [
        [78, 47],
        [83, 47],
        [83, 44],
        [78, 44],
      ],
    ],
  },
  {
    name: "Карагандинская область",
    density: 2.5,
    coordinates: [
      [
        [64, 50.5],
        [76, 50.5],
        [76, 46],
        [64, 46],
      ],
    ],
  },
  {
    name: "Костанайская область",
    density: 4,
    coordinates: [
      [
        [60, 54],
        [67, 54],
        [67, 49],
        [60, 49],
      ],
    ],
  },
  {
    name: "Кызылординская область",
    density: 2.5,
    coordinates: [
      [
        [61, 47],
        [68, 47],
        [68, 43],
        [61, 43],
      ],
    ],
  },
  {
    name: "Мангистауская область",
    density: 3,
    coordinates: [
      [
        [50, 46],
        [57, 46],
        [57, 41],
        [50, 41],
      ],
    ],
  },
  {
    name: "Павлодарская область",
    density: 5.5,
    coordinates: [
      [
        [74, 54],
        [79, 54],
        [79, 50],
        [74, 50],
      ],
    ],
  },
  {
    name: "Северо-Казахстанская область",
    density: 6.5,
    coordinates: [
      [
        [65, 55],
        [72, 55],
        [72, 52],
        [65, 52],
      ],
    ],
  },
  {
    name: "Туркестанская область",
    density: 22,
    coordinates: [
      [
        [66, 44],
        [72, 44],
        [72, 40],
        [66, 40],
      ],
    ],
  },
  {
    name: "Восточно-Казахстанская область",
    density: 3.5,
    coordinates: [
      [
        [80, 51],
        [87, 51],
        [87, 47],
        [80, 47],
      ],
    ],
  },
  {
    name: "область Абай",
    density: 2.5,
    coordinates: [
      [
        [76, 51],
        [80, 51],
        [80, 47],
        [76, 47],
      ],
    ],
  },
  {
    name: "область Ұлытау",
    density: 2,
    coordinates: [
      [
        [62, 50.5],
        [69, 50.5],
        [69, 45],
        [62, 45],
      ],
    ],
  },
];

export const DENSITY_BREAKS = [
  { min: 0, max: 2, color: "#ffffcc", label: "< 2 чел/км²" },
  { min: 2, max: 4, color: "#c2e699", label: "2–4 чел/км²" },
  { min: 4, max: 7, color: "#78c679", label: "4–7 чел/км²" },
  { min: 7, max: 15, color: "#238443", label: "7–15 чел/км²" },
  { min: 15, max: Infinity, color: "#005a32", label: "> 15 чел/км²" },
];

export function getDensityColor(density: number): string {
  for (const b of DENSITY_BREAKS) {
    if (density >= b.min && density < b.max) return b.color;
  }
  return "#ffffcc";
}

export function buildGeoJsonFeatureCollection(
  regions: RegionDensity[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: regions.map((r) => ({
      type: "Feature",
      properties: {
        name: r.name,
        density: r.density,
      },
      geometry: {
        type: "Polygon",
        coordinates: r.coordinates,
      },
    })),
  };
}
