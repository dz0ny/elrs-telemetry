import { useState, useEffect, useRef, FC, useContext, createContext, PropsWithChildren } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";
import RasterSource from 'ol/source/Raster';
import { DragRotateAndZoom, defaults as defaultInteractions } from "ol/interaction";
import { FullScreen, defaults as defaultControls } from "ol/control";

const useValue = () => {
  const [map, setMap] = useState<Map | null>(null);

  return {
    map,
    setMap
  };
};

export const MapContext = createContext({} as ReturnType<typeof useValue>);

export const MapContextProvider: FC<PropsWithChildren> = (props) => {
  return <MapContext.Provider value={useValue()}>{props.children}</MapContext.Provider>;
};
// @ts-ignore
function flood(pixels, data) {
  const pixel = pixels[0];
  if (pixel[3]) {
    const height =
      -10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1;
    if (height <= data.level) {
      pixel[0] = 134;
      pixel[1] = 203;
      pixel[2] = 249;
      pixel[3] = 255;
    } else {
      pixel[3] = 0;
    }
  }
  return pixel;
}

const key = 'LsXkR8HuqoeDPbkSTaFj	';
const elevation = new XYZ({
  // The RGB values in the source collectively represent elevation.
  // Interpolation of individual colors would produce incorrect evelations and is disabled.
  url: 'https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=' + key,
  tileSize: 512,
  maxZoom: 12,
  crossOrigin: '',
  interpolate: false,
});

const voda = new RasterSource({
  sources: [elevation],
  operation: flood,
});

voda.on('beforeoperations', function (event) {
  event.data.level = localStorage.voda;
});


const OpenLayers: FC = () => {
  const mapContext = useContext(MapContext);
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
          visible: false,
          minZoom: 10,
          source: new TileWMS({
            url: "https://storitve.eprostor.gov.si/ows-elf-wms/oi/ows?SERVICE=WMS&",
            params: { LAYERS: "OI.OrthoimageCoverage", TILED: true },
            serverType: "geoserver"
          })
        }),
        new TileLayer({
          source: new XYZ({
            attributions: 'Flight Zones © <a href="https://www.openaip.net">Openaip</a>',
            url: "https://map.adsbexchange.com/mapproxy/tiles/1.0.0/openaip/ul_grid/{z}/{x}/{y}.png"
          })
        }),
        new ImageLayer({
          opacity: 0.6,
          source: voda,
        }),
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
          .map((e) => Number(e)) || [0, 0],
        zoom: Number(localStorage.getItem("zoomLevel") || 0)
      })
    });

    initialMap.setTarget(mapElement.current);
    mapContext.setMap(initialMap as any);

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
