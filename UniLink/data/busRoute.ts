import type { TransitRoute } from "../infra/transit";

export interface SelectedBusRoute {
  route: TransitRoute;
  origin: string;
  destination: string;
}

let current: SelectedBusRoute | null = null;

export function setSelectedBusRoute(data: SelectedBusRoute) {
  current = data;
}

export function getSelectedBusRoute(): SelectedBusRoute | null {
  return current;
}
