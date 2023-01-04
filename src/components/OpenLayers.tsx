import { useState, useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";
import { DragRotateAndZoom, defaults as defaultInteractions } from "ol/interaction";
import { FullScreen, defaults as defaultControls } from "ol/control";

const OpenLayers: React.FC = () => {
  const [map, setMap] = useState();
  const mapElement = useRef();

  useEffect(() => {
    const initialMap = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
        new TileLayer({
          visible: false,
          source: new OSM()
        }),
        new TileLayer({
          visible: false,
          source: new XYZ({
            attributions:
              'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          })
        }),
        new TileLayer({
          source: new XYZ({
            attributions:
              'Map © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ArcGIS</a>',
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          })
        }),
        new TileLayer({
          source: new XYZ({
            attributions: 'Flight Zones © <a href="https://www.openaip.net">Openaip</a>',
            url: "https://map.adsbexchange.com/mapproxy/tiles/1.0.0/openaip/ul_grid/{z}/{x}/{y}.png"
          })
        }),

        // new TileLayer({
        //   minZoom: 10,
        //   source: new TileWMS({
        //     url: "https://storitve.eprostor.gov.si/ows-elf-wms/oi/ows?SERVICE=WMS&",
        //     params: { LAYERS: "OI.OrthoimageCoverage", 'TILED': true },
        //     serverType: "geoserver"
        //   })
        // }),
        new Graticule({
          // the style to use for the lines, optional.
          strokeStyle: new Stroke({
            color: "rgba(253, 218, 13,0.9)",
            width: 2,
            lineDash: [0.5, 4]
          }),
          showLabels: true,
          wrapX: false
        })
      ],
      view: new View({
        center: localStorage
          .getItem("center")
          ?.split(",")
          .map((e) => Number(e)),
        zoom: Number(localStorage.getItem("zoomLevel"))
      })
    });

    initialMap.setTarget(mapElement.current);
    setMap(initialMap as any);

    initialMap.on("rendercomplete", function (e) {
      var zoomLevel = initialMap.getView().getZoom() || 0;
      var center = initialMap.getView().getCenter() || [0, 0];
      localStorage.setItem("zoomLevel", zoomLevel.toString());
      localStorage.setItem("center", center?.map((e) => e.toString()).join(","));
    });

    return () => initialMap.setTarget(undefined);
  }, []);

  return <div style={{ height: "100vh", width: "100%" }} ref={mapElement as any} className='map-container' />;
};

export default OpenLayers;
