/** SSR/Nitro stand-in so Leaflet never touches `window` on the server. */
export const MapContainer = () => null;
export const ImageOverlay = () => null;
export const CircleMarker = () => null;
export const Circle = () => null;
export const Popup = () => null;
export const Tooltip = () => null;
export const Marker = () => null;
export const ZoomControl = () => null;
export const useMap = () => ({ invalidateSize() {} });
export const useMapEvents = () => null;
export const DomUtil = {
  setPosition() {},
  getPosition() {
    return { x: 0, y: 0 };
  },
};
export class LatLngBounds {
  constructor(..._args: unknown[]) {}
}
export class Point {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
export function divIcon(_opts?: unknown) {
  return {};
}
export default {};
