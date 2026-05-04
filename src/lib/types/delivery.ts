export type Coordinates = {
  lat: number;
  lng: number;
};

export type DeliveryRate = {
  id: string;
  maxDistanceKm: number;
  price: number;
};

export type DeliveryAddress = {
  label: string;
  coordinates: Coordinates;
};
