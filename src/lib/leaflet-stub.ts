/** SSR/Nitro stand-in so Leaflet never touches `window` on the server. */
export const MapContainer = () => null;
export const ImageOverlay = () => null;
export const CircleMarker = () => null;
export const Circle = () => null;
export const Popup = () => null;
export const Tooltip = () => null;
export const Marker = () => null;
export const useMap = () => ({ invalidateSize() {} });
export const useMapEvents = () => null;
export const CRS = { Simple: {} };
export class LatLngBounds {
  constructor(..._args: unknown[]) {}
}
export function divIcon(_opts?: unknown) {
  return {};
}
export default {};
