// Generator script for corridor coordinates
// Run: node scripts/generate-corridors.mjs > output.txt

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function generateSegment(startLat, startLng, endLat, endLng, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const ease = Math.sin(t * Math.PI * 0.5) * 0.3 + t * 0.7;
    const lat = lerp(startLat, endLat, ease);
    const lng = lerp(startLng, endLng, ease);
    const dev = Math.sin(t * Math.PI * 8) * 0.005 * (1 - Math.abs(t - 0.5) * 2);
    points.push({ lat: lat + dev, lng: lng - dev * 0.3 });
  }
  return points;
}

function corridorLine(name, color, segments) {
  const allPoints = [];
  for (let s = 0; s < segments.length; s++) {
    const [startLat, startLng, endLat, endLng, count] = segments[s];
    const segmentPoints = generateSegment(
      startLat,
      startLng,
      endLat,
      endLng,
      count
    );
    if (s > 0) segmentPoints.shift();
    allPoints.push(...segmentPoints);
  }
  return { name, color, points: allPoints };
}

const corridors = [];

// 1. ТМТМ
corridors.push(
  corridorLine("ТМТМ / Средний коридор", "#e85d26", [
    [44.083, 80.417, 43.25, 76.93, 14],
    [43.25, 76.93, 42.9, 71.37, 16],
    [42.9, 71.37, 42.3, 69.6, 10],
    [42.3, 69.6, 42.85, 68.3, 8],
    [42.85, 68.3, 44.85, 65.5, 14],
    [44.85, 65.5, 45.32, 55.19, 18],
    [45.32, 55.19, 43.65, 51.2, 12],
    [43.65, 51.2, 43.457, 51.2, 3],
  ])
);

// 2. Паромная линия: Курык → Баку (one-way, 60+ points across the Caspian)
corridors.push(
  corridorLine("Паромная линия (Каспий)", "#2563eb", [
    [43.457, 51.2, 43.0, 50.9, 12],
    [43.0, 50.9, 42.5, 50.6, 12],
    [42.5, 50.6, 42.0, 50.3, 12],
    [42.0, 50.3, 41.5, 50.0, 12],
    [41.5, 50.0, 41.0, 49.75, 12],
    [41.0, 49.75, 40.5, 49.8, 12],
    [40.5, 49.8, 40.367, 49.867, 6],
  ])
);

// 3. Северный / Транссиб
corridors.push(
  corridorLine("Северный / Транссиб", "#16a34a", [
    [51.233, 51.367, 50.283, 57.17, 16],
    [50.283, 57.17, 53.22, 63.63, 20],
    [53.22, 63.63, 49.8, 73.1, 22],
    [49.8, 73.1, 52.3, 76.95, 14],
    [52.3, 76.95, 50.433, 80.267, 14],
  ])
);

// 4. МТК Север-Юг
corridors.push(
  corridorLine("МТК Север-Юг", "#9333ea", [
    [46.35, 48.041, 47.12, 51.88, 12],
    [47.12, 51.88, 50.283, 57.17, 16],
    [50.283, 57.17, 44.85, 65.5, 22],
    [44.85, 65.5, 42.3, 69.6, 14],
    [42.3, 69.6, 41.47, 69.35, 6],
  ])
);

// 5. Западный коридор (now with more segments for 60+ points)
corridors.push(
  corridorLine("Западный коридор", "#d97706", [
    [51.233, 51.367, 50.283, 57.17, 16],
    [50.283, 57.17, 48.7, 54.5, 12],
    [48.7, 54.5, 47.12, 51.88, 10],
    [47.12, 51.88, 45.4, 51.6, 14],
    [45.4, 51.6, 43.65, 51.2, 12],
    [43.65, 51.2, 43.457, 51.2, 4],
  ])
);

// 6. Восточный коридор
corridors.push(
  corridorLine("Восточный коридор", "#0891b2", [
    [50.433, 80.267, 49.8, 73.1, 16],
    [49.8, 73.1, 46.5, 75.0, 12],
    [46.5, 75.0, 43.25, 76.93, 12],
    [43.25, 76.93, 44.083, 80.417, 16],
    [44.083, 80.417, 45.233, 82.467, 12],
  ])
);

const ids = ["tmtm", "ferry", "transsib", "north-south", "western", "eastern"];

console.error("Point counts:");
for (let i = 0; i < corridors.length; i++) {
  console.error(`  ${corridors[i].name}: ${corridors[i].points.length} points`);
}

// Output corridor TS data
for (let i = 0; i < corridors.length; i++) {
  console.log(
    `  {\n    id: "${ids[i]}",\n    name: "${corridors[i].name}",\n    color: "${corridors[i].color}",\n    points: [`
  );
  for (const p of corridors[i].points) {
    console.log(`      T(${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}),`);
  }
  console.log("    ],\n  },");
}
