"use client";

import {
  FullscreenControl,
  GeolocateControl,
  Layer,
  Map as MapLibre,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapProps as MapLibreProps,
  type ViewState,
} from "react-map-gl/maplibre";
import type { ReactNode } from "react";

const DEFAULT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export type Viewport = Pick<ViewState, "longitude" | "latitude" | "zoom">;

export function Map({
  children,
  initialViewState,
  viewport,
  onViewportChange,
  className,
}: {
  children?: ReactNode;
  initialViewState?: Viewport;
  viewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
  className?: string;
}) {
  const props: MapLibreProps = viewport
    ? {
        longitude: viewport.longitude,
        latitude: viewport.latitude,
        zoom: viewport.zoom,
        onMove: (event) =>
          onViewportChange?.({
            longitude: event.viewState.longitude,
            latitude: event.viewState.latitude,
            zoom: event.viewState.zoom,
          }),
      }
    : {
        initialViewState: initialViewState ?? {
          longitude: 106.8456,
          latitude: -6.2088,
          zoom: 10.8,
        },
      };

  return (
    <div className={className}>
      <MapLibre
        {...props}
        mapStyle={DEFAULT_STYLE}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </MapLibre>
    </div>
  );
}

export function MapControls({
  position = "top-right",
}: {
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  return (
    <>
      <NavigationControl position={position} showCompass showZoom />
      <GeolocateControl position={position} />
      <FullscreenControl position={position} />
    </>
  );
}

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
}: {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom" onClick={onClick}>
      {children}
    </Marker>
  );
}

export function MapPopup({
  longitude,
  latitude,
  children,
  onClose,
}: {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="top"
      closeButton={false}
      closeOnClick={false}
      onClose={onClose}
      maxWidth="320px"
    >
      {children}
    </Popup>
  );
}

export function MapRoute({
  coordinates,
  color = "#006b62",
}: {
  coordinates: [number, number][];
  color?: string;
}) {
  return (
    <Source
      id="community-route"
      type="geojson"
      data={{
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      }}
    >
      <Layer
        id="community-route-line"
        type="line"
        paint={{
          "line-color": color,
          "line-width": 4,
          "line-opacity": 0.82,
          "line-dasharray": [1.2, 1.2],
        }}
      />
    </Source>
  );
}
