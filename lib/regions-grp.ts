export interface RegionGrp {
  name: string;
  grp: number;
  coordinates: number[][][];
}

export const regionsGrp: RegionGrp[] = [
  {
    name: "Акмолинская область",
    grp: 2000,
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
    grp: 3500,
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
    grp: 14000,
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
    grp: 12000,
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
    grp: 3000,
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
    grp: 1500,
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
    grp: 1200,
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
    grp: 4500,
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
    grp: 2200,
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
    grp: 1800,
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
    grp: 4000,
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
    grp: 3200,
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
    grp: 1200,
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
    grp: 1800,
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
    grp: 2000,
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
    grp: 1000,
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
    grp: 700,
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

export const GRP_BREAKS = [
  { min: 0, max: 1500, color: "#deebf7", label: "< 1 500 млрд тг" },
  { min: 1500, max: 2500, color: "#9ecae1", label: "1 500–2 500 млрд тг" },
  { min: 2500, max: 4000, color: "#6baed6", label: "2 500–4 000 млрд тг" },
  { min: 4000, max: 6000, color: "#3182bd", label: "4 000–6 000 млрд тг" },
  { min: 6000, max: Infinity, color: "#08519c", label: "> 6 000 млрд тг" },
];

export function getGrpColor(grp: number): string {
  for (const b of GRP_BREAKS) {
    if (grp >= b.min && grp < b.max) return b.color;
  }
  return "#deebf7";
}

export function buildGrpGeoJsonFeatureCollection(
  regions: RegionGrp[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: regions.map((r) => ({
      type: "Feature",
      properties: {
        name: r.name,
        grp: r.grp,
      },
      geometry: {
        type: "Polygon",
        coordinates: r.coordinates,
      },
    })),
  };
}
