export interface RegionWarehouse {
  name: string;
  warehouseShare: number;
  coordinates: number[][][];
}

export const regionsWarehouse: RegionWarehouse[] = [
  {
    name: "Алматинская область",
    warehouseShare: 63,
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
    name: "Акмолинская область",
    warehouseShare: 18,
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
    warehouseShare: 7,
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
    name: "Атырауская область",
    warehouseShare: 2.5,
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
    warehouseShare: 1.5,
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
    warehouseShare: 1.5,
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
    warehouseShare: 2,
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
    warehouseShare: 1.5,
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
    warehouseShare: 1,
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
    warehouseShare: 0.5,
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
    warehouseShare: 0.8,
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
    warehouseShare: 1,
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
    warehouseShare: 0.5,
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
    warehouseShare: 0.7,
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
    warehouseShare: 0.5,
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
    warehouseShare: 0.5,
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
    warehouseShare: 0.3,
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

export const WAREHOUSE_BREAKS = [
  { min: 0, max: 0.5, color: "#fef0d9", label: "< 0.5%" },
  { min: 0.5, max: 1.5, color: "#fdd49e", label: "0.5–1.5%" },
  { min: 1.5, max: 3, color: "#fdbb84", label: "1.5–3%" },
  { min: 3, max: 10, color: "#fc8d59", label: "3–10%" },
  { min: 10, max: 25, color: "#e34a33", label: "10–25%" },
  { min: 25, max: Infinity, color: "#b30000", label: "> 25%" },
];

export function getWarehouseColor(share: number): string {
  for (const b of WAREHOUSE_BREAKS) {
    if (share >= b.min && share < b.max) return b.color;
  }
  return "#fef0d9";
}

export function buildWarehouseGeoJsonFeatureCollection(
  regions: RegionWarehouse[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: regions.map((r) => ({
      type: "Feature",
      properties: {
        name: r.name,
        warehouseShare: r.warehouseShare,
      },
      geometry: {
        type: "Polygon",
        coordinates: r.coordinates,
      },
    })),
  };
}
