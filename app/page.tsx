import { tlcCenters } from "@/lib/mock-data";
import MapLoader from "@/components/map-loader";

export default function HomePage() {
  return <MapLoader centers={tlcCenters} />;
}
