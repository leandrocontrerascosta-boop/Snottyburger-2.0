"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Coordinates } from "@/lib/types/delivery";

type DeliveryMapCanvasProps = {
  center: Coordinates;
  origin: Coordinates;
  destination: Coordinates | null;
  routeGeometry: Coordinates[];
  onSelectCoordinates: (coordinates: Coordinates) => void;
};

const storeIcon = L.divIcon({
  className: "snotty-store-pin-wrapper",
  html: '<div class="snotty-store-pin"><img src="/images/home/logosnotty.png" alt="Snottyburger" /></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 30],
});

const destinationIcon = L.divIcon({
  className: "snotty-destination-pin-wrapper",
  html: '<div class="snotty-destination-pin"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function DeliveryMapCanvas({ center, origin, destination, routeGeometry, onSelectCoordinates }: DeliveryMapCanvasProps) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full min-h-[320px] w-full rounded-[24px]">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origin.lat, origin.lng]} icon={storeIcon} />
      {routeGeometry.length > 1 ? (
        <Polyline positions={routeGeometry.map((point) => [point.lat, point.lng])} pathOptions={{ color: "#bf243f", weight: 5, opacity: 0.72 }} />
      ) : null}
      {destination ? (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
      ) : null}
      <MapPicker onSelectCoordinates={onSelectCoordinates} />
      <MapRecenter center={destination ?? center} />
    </MapContainer>
  );
}

type MapPickerProps = {
  onSelectCoordinates: (coordinates: Coordinates) => void;
};

function MapPicker({ onSelectCoordinates }: MapPickerProps) {
  useMapEvents({
    click(event) {
      onSelectCoordinates({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

type MapRecenterProps = {
  center: Coordinates;
};

function MapRecenter({ center }: MapRecenterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 14), {
      duration: 0.75,
    });
  }, [center, map]);

  return null;
}
