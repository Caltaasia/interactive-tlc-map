"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TlcCenter } from "@/lib/mock-data";
import { transportCorridors, borderCrossings, highways } from "@/lib/corridors";
import {
  industrialZones,
  majorCities,
  voidZones,
  duplicationZones,
} from "@/lib/demand-zones";
import StatsPanel from "@/components/stats-panel";
import { Badge } from "@/components/ui/badge";
import {
  regionsDensity,
  getDensityColor,
  DENSITY_BREAKS,
  buildGeoJsonFeatureCollection,
} from "@/lib/regions";
import {
  regionsGrp,
  getGrpColor,
  GRP_BREAKS,
  buildGrpGeoJsonFeatureCollection,
} from "@/lib/regions-grp";
import {
  regionsWarehouse,
  getWarehouseColor,
  WAREHOUSE_BREAKS,
  buildWarehouseGeoJsonFeatureCollection,
} from "@/lib/regions-warehouse";
import {
  Layers,
  Globe,
  Filter,
  Route,
  Activity,
  BarChart3,
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  Warehouse,
  MapIcon,
  GitBranch,
  PieChart,
} from "lucide-react";

type MapMode = "overview" | "corridor" | "cartogram";

const MAP_MODES: { id: MapMode; label: string; icon: typeof MapIcon }[] = [
  { id: "overview", label: "Обзорная", icon: MapIcon },
  { id: "corridor", label: "Коридоры", icon: GitBranch },
  { id: "cartogram", label: "Картограмма", icon: PieChart },
];

const TYPE_INFO = [
  { code: "П1", label: "Пограничные хабы", color: "#ef4444" },
  { code: "П2", label: "Крупные внутренние хабы", color: "#3b82f6" },
  { code: "П3", label: "Морские порты (Каспий)", color: "#22c55e" },
  { code: "П4", label: "КДС городские терминалы", color: "#f59e0b" },
  { code: "П5", label: "Сеть КДС региональная", color: "#a855f7" },
  { code: "П6", label: "Новые объекты 2025-2026", color: "#ec4899" },
] as const;

const BASE_MAPS = [
  {
    id: "light",
    label: "Светлая CARTO",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    id: "dark",
    label: "Тёмная CARTO",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
] as const;

const AGGLOMERATIONS = [
  { name: "Астана", lat: 51.7, lng: 71.5 },
  { name: "Алматы", lat: 43.5, lng: 77.3 },
  { name: "Шымкент", lat: 42.6, lng: 69.9 },
  { name: "Актобе", lat: 50.6, lng: 57.5 },
  { name: "Караганда", lat: 50.1, lng: 73.4 },
  { name: "Павлодар", lat: 52.6, lng: 77.3 },
  { name: "Атырау", lat: 47.4, lng: 52.2 },
  { name: "Уральск", lat: 51.5, lng: 51.7 },
  { name: "Тараз", lat: 43.2, lng: 71.7 },
  { name: "Усть-Каменогорск", lat: 50.3, lng: 82.9 },
  { name: "Костанай", lat: 53.5, lng: 63.9 },
  { name: "Кызылорда", lat: 45.1, lng: 65.8 },
  { name: "Актау", lat: 43.9, lng: 51.5 },
  { name: "Семей", lat: 50.7, lng: 80.6 },
  { name: "Петропавловск", lat: 55.1, lng: 69.4 },
  { name: "Кокшетау", lat: 53.6, lng: 69.7 },
];

function createIcon(
  color: string,
  status: string,
  capacity?: number,
  small = false
) {
  const baseSize = small
    ? 10
    : capacity != null
      ? capacity >= 200000
        ? 28
        : capacity >= 100000
          ? 24
          : capacity >= 60000
            ? 20
            : capacity >= 30000
              ? 17
              : 14
      : 16;

  let borderRadius = "50%";
  let borderStyle = "solid";
  let opacity = 1;

  if (status === "Строится") {
    borderStyle = "dashed";
  } else if (status === "Проект") {
    borderRadius = "3px";
    opacity = 0.7;
  }

  return new L.DivIcon({
    className: "tlc-marker",
    html: `<div style="
      width: ${baseSize}px;
      height: ${baseSize}px;
      border-radius: ${borderRadius};
      background: ${color};
      border: 3px ${borderStyle} white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      opacity: ${opacity};
      transition: transform 0.2s;
    "></div>`,
    iconSize: [baseSize, baseSize],
    iconAnchor: [baseSize / 2, baseSize / 2],
    tooltipAnchor: [0, -(baseSize / 2 + 4)],
  });
}

function createCorridorNodeIcon(color: string) {
  return new L.DivIcon({
    className: "corridor-node-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: white;
      border: 3px solid ${color};
      box-shadow: 0 0 0 2px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    tooltipAnchor: [0, -10],
  });
}

function createBorderIcon() {
  return new L.DivIcon({
    className: "border-crossing-marker",
    html: `<div style="
      width: 22px;
      height: 22px;
      background: #fbbf24;
      border: 2.5px solid #d97706;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      color: #78350f;
      line-height: 1;
      transform: rotate(45deg);
    ">✦</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    tooltipAnchor: [0, -16],
  });
}

function createLabelIcon(name: string, color: string) {
  return new L.DivIcon({
    className: "corridor-label",
    html: `<div style="
      padding: 2px 10px;
      background: ${color}e0;
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 1px 6px rgba(0,0,0,0.3);
      border: 1.5px solid rgba(255,255,255,0.9);
      letter-spacing: 0.02em;
    ">${name}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createHighwayLabelIcon(name: string) {
  return new L.DivIcon({
    className: "highway-label",
    html: `<div style="
      padding: 1px 8px;
      background: rgba(100,100,110,0.85);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: 3px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.6);
      letter-spacing: 0.01em;
    ">${name}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createAgglomerationIcon(name: string) {
  return new L.DivIcon({
    className: "agglomeration-label",
    html: `<div style="
      padding: 3px 12px;
      background: rgba(30,41,59,0.75);
      backdrop-filter: blur(4px);
      color: white;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.2);
      letter-spacing: 0.03em;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    ">${name}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function getMidpoint(points: { lat: number; lng: number }[]): [number, number] {
  const mid = Math.floor(points.length / 2);
  return [points[mid].lat, points[mid].lng];
}

const typeColors: Record<string, string> = {
  П1: "#ef4444",
  П2: "#3b82f6",
  П3: "#22c55e",
  П4: "#f59e0b",
  П5: "#a855f7",
  П6: "#ec4899",
};

interface MapClientProps {
  centers: TlcCenter[];
}

function BaseMapLayer({ baseMap }: { baseMap: string }) {
  const map = BASE_MAPS.find((m) => m.id === baseMap) || BASE_MAPS[0];
  return (
    <TileLayer key={baseMap} url={map.url} attribution={map.attribution} />
  );
}

function DensityLayer({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const geoJson = buildGeoJsonFeatureCollection(regionsDensity);
    const layer = L.geoJSON(geoJson, {
      style: (feature) => {
        const density = feature?.properties?.density ?? 0;
        return {
          fillColor: getDensityColor(density),
          weight: 1,
          opacity: 0.6,
          color: "#333",
          fillOpacity: 0.55,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name ?? "";
        const density = feature.properties?.density ?? 0;
        layer.bindTooltip(`${name}: ${density} чел/км²`, {
          direction: "top",
          className:
            "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
        });
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, visible]);

  return null;
}

function GdpLayer({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const geoJson = buildGrpGeoJsonFeatureCollection(regionsGrp);
    const layer = L.geoJSON(geoJson, {
      style: (feature) => {
        const grp = feature?.properties?.grp ?? 0;
        return {
          fillColor: getGrpColor(grp),
          weight: 1,
          opacity: 0.6,
          color: "#333",
          fillOpacity: 0.55,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name ?? "";
        const grp = feature.properties?.grp ?? 0;
        layer.bindTooltip(`${name}: ${grp.toLocaleString("ru-RU")} млрд тг`, {
          direction: "top",
          className:
            "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
        });
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, visible]);

  return null;
}

function WarehouseLayer({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const geoJson = buildWarehouseGeoJsonFeatureCollection(regionsWarehouse);
    const layer = L.geoJSON(geoJson, {
      style: (feature) => {
        const share = feature?.properties?.warehouseShare ?? 0;
        return {
          fillColor: getWarehouseColor(share),
          weight: 1.5,
          opacity: 0.7,
          color: "#555",
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name ?? "";
        const share = feature.properties?.warehouseShare ?? 0;
        layer.bindTooltip(`${name}: ${share}%`, {
          direction: "top",
          className:
            "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
        });
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, visible]);

  return null;
}

function AgglomerationLabels({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const markers = AGGLOMERATIONS.map((city) => {
      const marker = L.marker([city.lat, city.lng], {
        icon: createAgglomerationIcon(city.name),
        interactive: false,
      });
      marker.addTo(map);
      return marker;
    });

    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [map, visible]);

  return null;
}

function getCorridorNodes(
  centers: TlcCenter[],
  _corridors: { id: string; points: { lat: number; lng: number }[] }[]
): Map<string, TlcCenter[]> {
  const result = new Map<string, TlcCenter[]>();
  for (const c of _corridors) {
    result.set(c.id, []);
  }
  for (const center of centers) {
    for (const corridor of _corridors) {
      for (const point of corridor.points) {
        const dist = Math.sqrt(
          (center.lat - point.lat) ** 2 + (center.lng - point.lng) ** 2
        );
        if (dist < 0.5) {
          result.get(corridor.id)?.push(center);
          break;
        }
      }
    }
  }
  return result;
}

function CorridorNodes({
  corridorNodes,
  corridorColors,
}: {
  corridorNodes: Map<string, TlcCenter[]>;
  corridorColors: Map<string, string>;
}) {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];
    corridorNodes.forEach((centers, corridorId) => {
      const color = corridorColors.get(corridorId) ?? "#6366f1";
      for (const center of centers) {
        const marker = L.marker([center.lat, center.lng], {
          icon: createCorridorNodeIcon(color),
        });
        marker.bindTooltip(
          `<strong>${center.name}</strong><br/>${center.type} · ${center.status}`,
          {
            direction: "top",
            className:
              "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
          }
        );
        marker.addTo(map);
        markers.push(marker);
      }
    });
    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [map, corridorNodes, corridorColors]);

  return null;
}

function HighwayLayer({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const polylines: L.Polyline[] = [];
    const labels: L.Marker[] = [];

    for (const highway of highways) {
      const positions = highway.points.map(
        (p) => [p.lat, p.lng] as [number, number]
      );
      const polyline = L.polyline(positions, {
        color: "#888",
        weight: 2.5,
        opacity: 0.7,
        dashArray: "8, 6",
      });
      polyline.addTo(map);
      polylines.push(polyline);

      const mid = Math.floor(highway.points.length / 2);
      const label = L.marker(
        [highway.points[mid].lat, highway.points[mid].lng],
        {
          icon: createHighwayLabelIcon(highway.name),
          interactive: false,
        }
      );
      label.addTo(map);
      labels.push(label);
    }

    return () => {
      polylines.forEach((p) => map.removeLayer(p));
      labels.forEach((l) => map.removeLayer(l));
    };
  }, [map, visible]);

  return null;
}

function CoverageAnalysisLayer({
  centers,
  visible,
}: {
  centers: TlcCenter[];
  visible: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const layers: L.Layer[] = [];

    const radiusMeters = 250_000;

    const circleColors: Record<string, string> = {
      П1: "#ef4444",
      П2: "#3b82f6",
      П3: "#22c55e",
      П4: "#f59e0b",
      П5: "#a855f7",
      П6: "#ec4899",
    };

    for (const center of centers) {
      const color = circleColors[center.type] || "#6366f1";
      const circle = L.circle([center.lat, center.lng], {
        radius: radiusMeters,
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        opacity: 0.5,
        interactive: false,
      });
      circle.bindTooltip(`<strong>${center.name}</strong><br/>Радиус: 250 км`, {
        direction: "top",
        className:
          "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
      });
      circle.addTo(map);
      layers.push(circle);
    }

    for (const zone of industrialZones) {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: 8,
        color: "#f97316",
        fillColor: "#fb923c",
        fillOpacity: 0.8,
        weight: 2,
      });
      marker.bindTooltip(
        `<strong>${zone.name}</strong><br/>Промышленная зона`,
        {
          direction: "top",
          className:
            "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
        }
      );
      marker.addTo(map);
      layers.push(marker);
    }

    for (const city of majorCities) {
      const marker = L.circleMarker([city.lat, city.lng], {
        radius: 6,
        color: "#06b6d4",
        fillColor: "#22d3ee",
        fillOpacity: 0.9,
        weight: 2,
      });
      marker.bindTooltip(`<strong>${city.name}</strong><br/>Крупный город`, {
        direction: "top",
        className:
          "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
      });
      marker.addTo(map);
      layers.push(marker);
    }

    for (const vz of voidZones) {
      const polygon = L.polygon(vz.points, {
        color: "#d97706",
        fillColor: "#f59e0b",
        fillOpacity: 0.08,
        weight: 2.5,
        dashArray: "8, 8",
        interactive: false,
      });
      polygon.bindTooltip(`<strong>${vz.name}</strong><br/>${vz.description}`, {
        direction: "top",
        className:
          "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
      });
      polygon.addTo(map);
      layers.push(polygon);

      const lats = vz.points.map((p) => p[0]);
      const lngs = vz.points.map((p) => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const step = 0.12;
      const diagLen = Math.max(maxLat - minLat, maxLng - minLng);
      const offset = -diagLen;

      for (
        let start = offset;
        start <= maxLng - minLng + diagLen;
        start += step
      ) {
        const p1: [number, number] = [minLat, minLng + start];
        const p2: [number, number] = [maxLat, minLng + start + diagLen];
        const hatchLine = L.polyline([p1, p2], {
          color: "#d97706",
          weight: 1,
          opacity: 0.35,
          interactive: false,
        });
        hatchLine.addTo(map);
        layers.push(hatchLine);

        const p3: [number, number] = [minLat, minLng + start + diagLen];
        const p4: [number, number] = [maxLat, minLng + start];
        const hatchCross = L.polyline([p3, p4], {
          color: "#d97706",
          weight: 1,
          opacity: 0.25,
          interactive: false,
        });
        hatchCross.addTo(map);
        layers.push(hatchCross);
      }

      const label = L.marker([(minLat + maxLat) / 2, (minLng + maxLng) / 2], {
        icon: L.divIcon({
          className: "void-label",
          html: `<div style="
              padding: 2px 8px;
              background: rgba(217,119,6,0.85);
              color: white;
              font-size: 10px;
              font-weight: 700;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0 1px 6px rgba(0,0,0,0.3);
              border: 1.5px solid rgba(255,255,255,0.9);
            ">${vz.name}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
      });
      label.addTo(map);
      layers.push(label);
    }

    for (const dz of duplicationZones) {
      const polygon = L.polygon(dz.points, {
        color: "#a855f7",
        fillColor: "#a855f7",
        fillOpacity: 0.15,
        weight: 2.5,
        interactive: false,
      });
      polygon.bindTooltip(`<strong>${dz.name}</strong><br/>${dz.description}`, {
        direction: "top",
        className:
          "rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium",
      });
      polygon.addTo(map);
      layers.push(polygon);

      const lats = dz.points.map((p) => p[0]);
      const lngs = dz.points.map((p) => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const label = L.marker([(minLat + maxLat) / 2, (minLng + maxLng) / 2], {
        icon: L.divIcon({
          className: "duplication-label",
          html: `<div style="
              padding: 2px 8px;
              background: rgba(168,85,247,0.85);
              color: white;
              font-size: 10px;
              font-weight: 700;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0 1px 6px rgba(0,0,0,0.3);
              border: 1.5px solid rgba(255,255,255,0.9);
            ">${dz.name}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
      });
      label.addTo(map);
      layers.push(label);
    }

    return () => {
      for (const layer of layers) {
        map.removeLayer(layer);
      }
    };
  }, [map, visible, centers]);

  return null;
}

export default function MapClient({ centers }: MapClientProps) {
  const [mapMode, setMapMode] = useState<MapMode>("overview");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(TYPE_INFO.map((t) => t.code))
  );
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["Действующий", "Строится", "Проект"])
  );
  const [showCorridors, setShowCorridors] = useState(true);
  const [showHighways, setShowHighways] = useState(true);
  const [baseMap, setBaseMap] = useState("light");
  const [showDensity, setShowDensity] = useState(false);
  const [showGdp, setShowGdp] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    startPanelX: 0,
    startPanelY: 0,
    dragThresholdMet: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
      ._getIconUrl;
  }, []);

  const showTLCsInOverview = mapMode === "overview" || mapMode === "corridor";
  const showTLCsInCartogram = mapMode === "cartogram";
  const showCorridorsEffective =
    mapMode === "corridor" ? true : mapMode === "overview" && showCorridors;
  const showHighwaysEffective = mapMode === "overview" && showHighways;
  const showAgglomerations = mapMode === "overview";
  const showBorderCrossings =
    (mapMode === "overview" && showCorridors) || mapMode === "corridor";
  const showWarehouseChoropleth = mapMode === "cartogram";
  const showDensityEffective = mapMode === "overview" && showDensity;
  const showGdpEffective = mapMode === "overview" && showGdp;

  const visibleCenters = centers.filter(
    (c) => selectedTypes.has(c.type) && selectedStatuses.has(c.status)
  );

  const toggleType = (code: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const currentX = panelPos?.x ?? rect.left;
      const currentY = panelPos?.y ?? rect.top;

      dragRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPanelX: currentX,
        startPanelY: currentY,
        dragThresholdMet: false,
      };

      if (!panelPos) {
        setPanelPos({ x: currentX, y: currentY });
      }

      setIsDragging(true);
    },
    [panelPos]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startMouseX;
      const dy = e.clientY - dragRef.current.startMouseY;

      if (!dragRef.current.dragThresholdMet) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) return;
        dragRef.current.dragThresholdMet = true;
      }

      let newX = dragRef.current.startPanelX + dx;
      let newY = dragRef.current.startPanelY + dy;

      const panelEl = panelRef.current;
      if (panelEl) {
        newX = Math.max(
          0,
          Math.min(newX, window.innerWidth - panelEl.offsetWidth)
        );
        newY = Math.max(
          0,
          Math.min(newY, window.innerHeight - panelEl.offsetHeight)
        );
      }

      setPanelPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const corridorNodes = useMemo(
    () => getCorridorNodes(visibleCenters, transportCorridors),
    [visibleCenters]
  );

  const corridorColorMap = useMemo(
    () => new Map(transportCorridors.map((c) => [c.id, c.color])),
    []
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full relative">
      <MapContainer
        center={[48.0, 68.0]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ background: "#f0f4f8" }}
      >
        <BaseMapLayer baseMap={baseMap} />
        <DensityLayer visible={showDensityEffective} />
        <GdpLayer visible={showGdpEffective} />
        <WarehouseLayer visible={showWarehouseChoropleth} />
        <AgglomerationLabels visible={showAgglomerations} />
        <HighwayLayer visible={showHighwaysEffective} />
        {showTLCsInCartogram &&
          centers.map((center) => (
            <Marker
              key={center.id}
              position={[center.lat, center.lng]}
              icon={createIcon("#6b7280", center.status, undefined, true)}
            >
              <Tooltip
                direction="top"
                offset={[0, -4]}
                className="rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium"
                permanent={false}
              >
                {center.name}
              </Tooltip>
              <Popup className="tlc-popup" maxWidth={320} minWidth={280}>
                <div className="space-y-2">
                  <h3 className="font-bold text-base leading-tight">
                    {center.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      className="text-[11px] px-2 py-0.5"
                      style={{
                        backgroundColor: typeColors[center.type] || "#3b82f6",
                      }}
                    >
                      {center.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {center.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>
                      <span className="font-medium text-foreground/70">
                        Регион:
                      </span>{" "}
                      {center.region}
                    </p>
                    {center.capacity != null && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Мощность:
                        </span>{" "}
                        {center.capacity.toLocaleString("ru-RU")} TEU/год
                      </p>
                    )}
                    {center.warehouseArea != null && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Складской фонд:
                        </span>{" "}
                        {center.warehouseArea.toLocaleString("ru-RU")} м²
                      </p>
                    )}
                    {center.address && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Адрес:
                        </span>{" "}
                        {center.address}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        {showTLCsInOverview &&
          visibleCenters.map((center) => (
            <Marker
              key={center.id}
              position={[center.lat, center.lng]}
              icon={createIcon(
                typeColors[center.type] || "#3b82f6",
                center.status,
                center.capacity
              )}
            >
              <Tooltip
                direction="top"
                offset={[0, -4]}
                className="rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium"
                permanent={false}
              >
                {center.name}
              </Tooltip>
              <Popup className="tlc-popup" maxWidth={320} minWidth={280}>
                <div className="space-y-2">
                  <h3 className="font-bold text-base leading-tight">
                    {center.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      className="text-[11px] px-2 py-0.5"
                      style={{
                        backgroundColor: typeColors[center.type] || "#3b82f6",
                      }}
                    >
                      {center.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {center.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>
                      <span className="font-medium text-foreground/70">
                        Регион:
                      </span>{" "}
                      {center.region}
                    </p>
                    {center.capacity != null && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Мощность:
                        </span>{" "}
                        {center.capacity.toLocaleString("ru-RU")} TEU/год
                      </p>
                    )}
                    {center.warehouseArea != null && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Складской фонд:
                        </span>{" "}
                        {center.warehouseArea.toLocaleString("ru-RU")} м²
                      </p>
                    )}
                    {center.address && (
                      <p>
                        <span className="font-medium text-foreground/70">
                          Адрес:
                        </span>{" "}
                        {center.address}
                      </p>
                    )}
                    {center.services && center.services.length > 0 && (
                      <div>
                        <span className="font-medium text-foreground/70">
                          Услуги:
                        </span>{" "}
                        <span>{center.services.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        {showCorridorsEffective && (
          <>
            {transportCorridors.map((corridor) => (
              <Fragment key={corridor.id}>
                <Polyline
                  positions={corridor.points.map((p) => [p.lat, p.lng])}
                  pathOptions={{
                    color: corridor.color,
                    weight: mapMode === "corridor" ? 5 : 3.5,
                    opacity: mapMode === "corridor" ? 0.95 : 0.85,
                  }}
                >
                  <Tooltip
                    direction="top"
                    className="rounded-lg border shadow-lg px-3 py-1.5 text-sm font-semibold"
                    permanent={false}
                  >
                    {corridor.name}
                  </Tooltip>
                </Polyline>
                <Marker
                  position={getMidpoint(corridor.points)}
                  icon={createLabelIcon(corridor.name, corridor.color)}
                  interactive={false}
                />
              </Fragment>
            ))}
            {showBorderCrossings &&
              borderCrossings.map((bc) => (
                <Marker
                  key={bc.id}
                  position={[bc.lat, bc.lng]}
                  icon={createBorderIcon()}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -4]}
                    className="rounded-lg border shadow-lg px-3 py-1.5 text-sm font-medium"
                    permanent={false}
                  >
                    {bc.name} → {bc.direction}
                  </Tooltip>
                </Marker>
              ))}
          </>
        )}
        {mapMode === "corridor" && (
          <CorridorNodes
            corridorNodes={corridorNodes}
            corridorColors={corridorColorMap}
          />
        )}
        <CoverageAnalysisLayer
          centers={visibleCenters}
          visible={showCoverage && mapMode === "overview"}
        />
      </MapContainer>

      <div
        ref={panelRef}
        className={`gradient-panel rounded-2xl panel-shadow border border-indigo-100/50 w-72 z-[1000] ${
          panelPos ? "fixed" : "absolute top-4 right-4"
        } ${isDragging ? "select-none" : ""}`}
        style={panelPos ? { left: panelPos.x, top: panelPos.y } : undefined}
      >
        <div className="gradient-panel-header w-full px-5 py-3 rounded-t-2xl flex items-center justify-between">
          <span className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {!layersCollapsed && "Панель слоёв"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={handleMouseDown}
              className="text-white/80 hover:text-white transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setLayersCollapsed((v) => !v)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {layersCollapsed ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            layersCollapsed ? "max-h-0" : "max-h-[3500px]"
          }`}
        >
          <div className="p-5">
            <h3 className="font-semibold text-xs mb-3 text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapIcon className="h-3.5 w-3.5" />
              Режим карты
            </h3>
            <div className="flex gap-1.5 mb-4">
              {MAP_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = mapMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setMapMode(mode.id)}
                    className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-300"
                        : "text-muted-foreground hover:bg-indigo-50/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <hr className="my-4 border-t border-indigo-100/30" />

            <h3 className="font-semibold text-xs mb-3 text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Базовые карты
            </h3>
            <div className="space-y-1.5 mb-3">
              {BASE_MAPS.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2.5 cursor-pointer select-none group"
                >
                  <input
                    type="radio"
                    name="baseMap"
                    checked={baseMap === m.id}
                    onChange={() => setBaseMap(m.id)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      baseMap === m.id
                        ? "border-sky-500"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {baseMap === m.id && (
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                    )}
                  </span>
                  <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {m.label}
                  </span>
                </label>
              ))}
            </div>

            {(mapMode === "overview" || mapMode === "corridor") && (
              <>
                <hr className="my-4 border-t border-indigo-100/30" />

                <h3 className="font-semibold text-xs mb-3 text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  Типы объектов
                </h3>
                <div className="space-y-2">
                  {TYPE_INFO.map((type) => {
                    const isActive = selectedTypes.has(type.code);
                    return (
                      <label
                        key={type.code}
                        className="flex items-center gap-2.5 cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleType(type.code)}
                          className="accent-current sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
                            isActive
                              ? "border-transparent"
                              : "border-muted-foreground/30"
                          }`}
                          style={{
                            backgroundColor: isActive
                              ? type.color
                              : "transparent",
                          }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                          {type.code} — {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <hr className="my-4 border-t border-indigo-100/30" />

                <h3 className="font-semibold text-xs mb-3 text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Статус
                </h3>
                <div className="space-y-2 mb-3">
                  {["Действующий", "Строится", "Проект"].map((status) => {
                    const isActive = selectedStatuses.has(status);
                    const statusColor =
                      status === "Действующий"
                        ? "#22c55e"
                        : status === "Строится"
                          ? "#f59e0b"
                          : "#94a3b8";
                    return (
                      <label
                        key={status}
                        className="flex items-center gap-2.5 cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleStatus(status)}
                          className="sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
                            isActive
                              ? "border-transparent"
                              : "border-muted-foreground/30"
                          }`}
                          style={{
                            backgroundColor: isActive
                              ? statusColor
                              : "transparent",
                          }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColor }}
                        />
                        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                          {status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            {mapMode === "overview" && (
              <>
                <hr className="my-4 border-t border-indigo-100/30" />

                <label className="flex items-center gap-2.5 cursor-pointer select-none group mb-1 px-1 py-1 rounded-lg hover:bg-indigo-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showCorridors}
                    onChange={(e) => setShowCorridors(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                      showCorridors
                        ? "border-transparent scale-110"
                        : "border-muted-foreground/30"
                    }`}
                    style={{
                      backgroundColor: showCorridors
                        ? "#6366f1"
                        : "transparent",
                      boxShadow: showCorridors
                        ? "0 0 8px rgba(99,102,241,0.4)"
                        : "none",
                    }}
                  />
                  <Route className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    Транспортные коридоры
                  </span>
                </label>

                {showCorridors && (
                  <div className="space-y-1.5 pl-6 mb-2">
                    {transportCorridors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span
                          className="w-4 h-0.5 rounded flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>{c.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <span
                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[10px] font-bold rounded-sm"
                        style={{
                          backgroundColor: "#fbbf24",
                          color: "#78350f",
                          border: "1.5px solid #d97706",
                        }}
                      >
                        ✦
                      </span>
                      <span>Пограничные переходы</span>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer select-none group mb-1 px-1 py-1 rounded-lg hover:bg-indigo-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showHighways}
                    onChange={(e) => setShowHighways(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                      showHighways
                        ? "border-transparent scale-110"
                        : "border-muted-foreground/30"
                    }`}
                    style={{
                      backgroundColor: showHighways ? "#6b7280" : "transparent",
                      boxShadow: showHighways
                        ? "0 0 8px rgba(107,114,128,0.4)"
                        : "none",
                    }}
                  />
                  <Route className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    Автомагистрали
                  </span>
                </label>

                <hr className="my-4 border-t border-indigo-100/30" />

                <label className="flex items-center gap-2.5 cursor-pointer select-none group mb-1 px-1 py-1 rounded-lg hover:bg-emerald-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showDensity}
                    onChange={(e) => setShowDensity(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                      showDensity
                        ? "border-transparent scale-110"
                        : "border-muted-foreground/30"
                    }`}
                    style={{
                      backgroundColor: showDensity ? "#15803d" : "transparent",
                      boxShadow: showDensity
                        ? "0 0 8px rgba(22,128,61,0.4)"
                        : "none",
                    }}
                  />
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    Плотность населения
                  </span>
                </label>

                {showDensity && (
                  <div className="space-y-1 pl-6 mb-2">
                    {DENSITY_BREAKS.map((b) => (
                      <div
                        key={b.label}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span
                          className="w-5 h-3 rounded flex-shrink-0 border border-gray-400/30"
                          style={{ backgroundColor: b.color }}
                        />
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="my-4 border-t border-indigo-100/30" />

                <label className="flex items-center gap-2.5 cursor-pointer select-none group mb-1 px-1 py-1 rounded-lg hover:bg-blue-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showGdp}
                    onChange={(e) => setShowGdp(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                      showGdp
                        ? "border-transparent scale-110"
                        : "border-muted-foreground/30"
                    }`}
                    style={{
                      backgroundColor: showGdp ? "#08519c" : "transparent",
                      boxShadow: showGdp
                        ? "0 0 8px rgba(8,81,156,0.4)"
                        : "none",
                    }}
                  />
                  <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    ВРП (региональный продукт)
                  </span>
                </label>

                {showGdp && (
                  <div className="space-y-1 pl-6 mb-2">
                    {GRP_BREAKS.map((b) => (
                      <div
                        key={b.label}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span
                          className="w-5 h-3 rounded flex-shrink-0 border border-gray-400/30"
                          style={{ backgroundColor: b.color }}
                        />
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="my-4 border-t border-indigo-100/30" />

                <label className="flex items-center gap-2.5 cursor-pointer select-none group mb-1 px-1 py-1 rounded-lg hover:bg-amber-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showCoverage}
                    onChange={(e) => setShowCoverage(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                      showCoverage
                        ? "border-transparent scale-110"
                        : "border-muted-foreground/30"
                    }`}
                    style={{
                      backgroundColor: showCoverage ? "#d97706" : "transparent",
                      boxShadow: showCoverage
                        ? "0 0 8px rgba(217,119,6,0.4)"
                        : "none",
                    }}
                  />
                  <MapIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    Зоны спроса
                  </span>
                </label>

                {showCoverage && (
                  <div className="space-y-1.5 pl-6 mb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-5 h-3 rounded flex-shrink-0 border border-gray-400/30 bg-blue-400/30" />
                      <span>Круги 250 км (зоны доступности)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-400 border border-orange-600" />
                      <span>Промышленные зоны</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 bg-cyan-400 border border-cyan-600" />
                      <span>Крупные города</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="w-5 h-3 rounded flex-shrink-0 border"
                        style={{
                          backgroundColor: "rgba(245,158,11,0.1)",
                          borderColor: "#d97706",
                          borderStyle: "dashed",
                        }}
                      />
                      <span>«Пустоты» — штриховка</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="w-5 h-3 rounded flex-shrink-0 border"
                        style={{
                          backgroundColor: "rgba(168,85,247,0.2)",
                          borderColor: "#a855f7",
                        }}
                      />
                      <span>«Дублирование» — цвет</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {mapMode === "corridor" && (
              <>
                <hr className="my-4 border-t border-indigo-100/30" />
                <div className="space-y-1.5 pl-1">
                  <p className="text-xs font-semibold text-foreground/70 mb-2">
                    Транспортные оси
                  </p>
                  {transportCorridors.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className="w-4 h-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name}</span>
                    </div>
                  ))}
                  {showBorderCrossings && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <span
                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[10px] font-bold rounded-sm"
                        style={{
                          backgroundColor: "#fbbf24",
                          color: "#78350f",
                          border: "1.5px solid #d97706",
                        }}
                      >
                        ✦
                      </span>
                      <span>Пограничные переходы</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {mapMode === "cartogram" && (
              <>
                <hr className="my-4 border-t border-indigo-100/30" />
                <h3 className="font-semibold text-xs mb-3 text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5" />
                  Доля складских площадей
                </h3>
                <div className="space-y-1 pl-1 mb-2">
                  {WAREHOUSE_BREAKS.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className="w-5 h-3 rounded flex-shrink-0 border border-gray-400/30"
                        style={{ backgroundColor: b.color }}
                      />
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground/70 pl-1 leading-relaxed">
                  <p className="font-medium text-foreground/80 mb-1">
                    Ключевые регионы:
                  </p>
                  <p>• Алматы + Алм. обл. — 63%</p>
                  <p>• Астана + Акм. обл. — 18%</p>
                  <p>• Актобе + Акт. обл. — 7%</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <StatsPanel centers={mapMode === "cartogram" ? [] : visibleCenters} />
    </div>
  );
}
