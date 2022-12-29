import { LatLng } from "leaflet";
import React, { useState } from "react";
import { MapContainer, TileLayer, useMapEvents, LayersControl, LayerGroup, Marker, Popup } from "react-leaflet";

const { BaseLayer } = LayersControl;

import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

function LocationMarker() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function Map() {
  return (
    <MapContainer id='mapId' center={{ lat: 51.505, lng: -0.09 }} zoom={13} scrollWheelZoom={true}>
      <LayersControl position='topright'>
        <BaseLayer checked name='OpenStreetMap'>
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </BaseLayer>
        <BaseLayer name='ESRI'>
          <TileLayer
            attribution='Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
            className='basemap'
            maxNativeZoom={17}
            maxZoom={17}
            subdomains={["clarity"]}
            url='https://{s}.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          />
        </BaseLayer>
      </LayersControl>

      <LocationMarker />
    </MapContainer>
  );
}
