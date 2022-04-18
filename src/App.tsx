import React, { useState, useEffect, useRef, SetStateAction, RefObject } from 'react';
import mapboxgl, { GeoJSONSourceRaw } from 'mapbox-gl'; 
import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from "geojson";
import { Coordinates, getResolution, initialCoordinates } from './Coordinates';
import { getCountPerHexaSync } from './httpRequests';
import { SideBar } from './components/SideBar';
const h3 = require("h3-js");


const endpoint = process.env.GET_CNT_FCN!;
mapboxgl.accessToken = process.env.MAPBOX_TOKEN!;


function getCoordinates(map: any) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cUL = map.unproject([0, 0]).toArray();
    const cUR = map.unproject([w, 0]).toArray();
    const cLR = map.unproject([w, h]).toArray();
    const cLL = map.unproject([0, h]).toArray();
    const coordinates = [cUL, cUR, cLR, cLL];
    return coordinates;
}

export interface State {
    center: [number, number];
    zoom: [number];
    coordinates: Coordinates;
}
  
export interface Props {
    onStyleLoad?: (map: any) => any;
    onResize?: (map: any) => any;
    onMoveEnd?: (map: any) => any;
    onDragEnd?: (map: any) => any;
    onZoomEnd?: (map: any) => any;
    onMouseMove?: (map: any) => any;
}


export default function App(props: Props) {

    const initialState : State = {
        center: [initialCoordinates.ctrlng, initialCoordinates.ctrlat],
        zoom: [initialCoordinates.zoom],
        coordinates: initialCoordinates
    };

    function getInitialState() : State { return initialState };
  
    const [state, setState] = useState<State>(() => getInitialState());

    const mapContainerRef = useRef<HTMLDivElement>(null);
    let [map, setMap] = useState<mapboxgl.Map | null>(null);


    const regenerateSourceAndLayer = React.useCallback(() => { 
        if (map === null)
            return;

        const extraFillArea = 0.5;
        const blueColor = '#0080ff';
        const borderLayerName = 'hex-layer-border';
        const countLayerName = 'hex-layer-count';
        const sourceName = 'hex-source';
        
        if (map === null)
            return;

        const polygon = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [ getCoordinates(map) ]
            }
        };

        var stateZoom = state.zoom;
        var currentZoom = map.getZoom();
        var h3res = getResolution(currentZoom);

        let c = polygon.geometry.coordinates[0], coordinates=[];
        let [x1,y2] = c[0];
        let [x2,y1] = c[2];
        let dh = x2 - x1;
        let dv = y2 - y1;

        let prevX = x1 -= dh * extraFillArea;
        x2 += dh * extraFillArea;
        y1 = Math.max(y1 - dv * extraFillArea, -90);
        y2 = Math.min(y2 + dv * extraFillArea, 90);
        
        x1 = (x1 = (x1 + 180) % 360) < 0 ? x1 + 180 : x1 - 180;
        x2 = Math.min(x2 + x1 - prevX, x1 + 360);
        
        while (x1 < x2) {
            prevX = x1;
            x1 = Math.min(x1 + 180, x2, 180);
            coordinates.push([[
                [prevX,y2],
                [x1,y2],
                [x1,y1],
                [prevX,y1]
            ]]);
            if (x1 == 180) {
                x2 -= 180;
                x1 = -180;
            }
        }
        
        var hexagons: any = [].concat(...coordinates.map(e=> h3.polyfill(e, h3res, true)));
        var hexBoundaries:any = []
        for (var i=0; i < hexagons.length; i++) {
            let h = h3.h3ToGeoBoundary(hexagons[i], true);
            if (h.find((e:Number[])=>e[0]<-128)!==undefined) h = h.map((e:any)=> e[0]>0 ? [e[0]-360,e[1]] : e);
            if (hexBoundaries.find((e:any)=> {
                if (e.length!==h.length)
                    return false; 
                for (let i=0; i < e.length; i++) {
                    if ((h[i][0] !== e[i][0]) || (h[i][1] !== e[i][1])) {
                        return false;
                    }
                }
                return true;
            })===undefined) hexBoundaries.push(h);
        }
        console.log(`currentZoom: ${currentZoom}, stateZoom ${stateZoom}, resolution: ${h3res}, hexagons: ${hexBoundaries.length}`);

        var featureCollection : FeatureCollection = {
          "type": "FeatureCollection",
          "features": [{
              "type": "Feature",
              "properties": {},
              "geometry": {
                  "type": "Polygon",
                  "coordinates": hexBoundaries
              }
          }]
        };

        var results = getCountPerHexaSync(endpoint, h3res, hexagons);
        for (let index in results.h3indices)
        {
          var cnt = results.h3indices[index];
          if (cnt > 0) {
            var hcc = h3.h3ToGeo(index);
            const markerFeature : Feature<Geometry, GeoJsonProperties> = {
              'type': 'Feature',
              'properties': {
                'description': cnt,
                'icon': 'marker-11'
              },
              'geometry': {
                'type': 'Point',
                'coordinates': hcc.reverse()
              }
            };
            featureCollection.features.push(markerFeature);
          }
        }
        
        const source = map.getSource(sourceName);
        if (source !== undefined) {
            (source as any).setData(featureCollection);
        } else {
            var s : GeoJSONSourceRaw = {
                type: 'geojson',
                data: featureCollection,
            };
            map.addSource(sourceName, s);
            map.addLayer({
                'id': borderLayerName,
                'source': sourceName,
                'type': 'line',
                'layout': {},
                'paint': {
                    'line-color': blueColor,
                    'line-width': 2
                }
            });
            map.addLayer({
                'id': countLayerName,
                'source': sourceName,
                'type': 'symbol',
                'layout': {
                    'text-field': ['get', 'description'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 0.5,
                    'text-justify': 'auto',
                    'icon-image': ['get', 'icon'],
                    'text-font': ['Open Sans Regular'],
                    'text-size': 12
                    },
                "paint": {
                    'text-color': blueColor
                }
            });
        }
    }, [map, state.zoom]);
    
    const updateState = React.useCallback((me: any) => { 
        const map2 = me.target;
    
        console.log('updateState');
        // [cUL, cUR, cLR, cLL]
        var cc = getCoordinates(map2);
        var c = {
          ctrlng: map2.getCenter().lng,
          ctrlat: map2.getCenter().lat,
          zoom: map2.getZoom(),
          h3res: getResolution(map2.getZoom()),
    
          nwlng: cc[0][0],
          nwlat: cc[0][1],
          selng: cc[2][0],
          selat: cc[2][1]
        };
    
        setState(prev => ({...prev, coordinates: c }));
    }, []);

    useEffect(() => {
        console.log('entering useEffect attachMap');
    
        const attachMap = (setMap: React.Dispatch<SetStateAction<any>>, mapContainerRef: RefObject<HTMLDivElement>) => {
            if (!mapContainerRef.current) {
                return;
            }
        
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: process.env.MAPBOX_STYLE_LIGHT,
                center: state.center,
                zoom: state.zoom[0]
            });
            console.log('map created');
            
            setMap(map);
        }
    
        !map && attachMap(setMap, mapContainerRef);
        return () => {
            console.log("cleaning useEffect attachMap");
        };
    }, [map, state.center, state.zoom]);

    useEffect(() => {
        console.log('entering useEffect updateState');

        if (map === null) {
            return;
        }

        return () => {
            console.log('cleaning useEffect updateState');
        };
    }, [map, props, updateState]);

    useEffect(() => {
        console.log('entering useEffect load');

        if (map === null) {
            return;
        }

        map.on('load', (map2: any) => {
            regenerateSourceAndLayer();
            updateState(map2);
        });
        map.addControl(new mapboxgl.NavigationControl());

        return () => {
            console.log('cleaning useEffect load');
        };
    }, [map, props, updateState, regenerateSourceAndLayer]);

    useEffect(() => {
        console.log('entering useEffect zoomend');

        if (map === null) {
            return;
        }

        map.on('zoomend', (map2: any) => {
            const { onZoomEnd } = props;
            console.log("onZoomEnd");
            regenerateSourceAndLayer();
            updateState(map2);
            return onZoomEnd && onZoomEnd(map2);
        });

        return () => {
            console.log('cleaning useEffect zoomend');
        };
    }, [map, props, updateState, regenerateSourceAndLayer]);

    useEffect(() => {
        console.log('entering useEffect dragend');

        if (map === null) {
            return;
        }

        map.on('dragend', (map2: any) => {
            const { onDragEnd } = props;
            console.log("onDragEnd");
            regenerateSourceAndLayer();
            updateState(map2);
            return onDragEnd && onDragEnd(map2);
        });

        return () => {
            console.log('cleaning useEffect dragend');
        };
    }, [map, props, updateState, regenerateSourceAndLayer]);

    useEffect(() => {
        console.log('entering useEffect resize');

        if (map === null) {
            return;
        }

        window.onresize = () => {
            let canvas = document.getElementsByClassName('map-container mapboxgl-map')[0] as any;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            if (map !== null) {
                map.getCanvas().style.width = window.innerWidth + "px";
                map.getCanvas().style.height = window.innerHeight + "px";
                map.resize();
            }
        };

        window.onresize(new UIEvent(''));
        map.on('resize', (map2: any) => {
            const { onResize } = props;
            console.log("onResize");
            regenerateSourceAndLayer();
            updateState(map2);
            return onResize && onResize(map2);
        });

        return () => {
            console.log('cleaning useEffect resize');
        };
    }, [map, props, updateState, regenerateSourceAndLayer]);

    return (
      <div>
        <div ref={mapContainerRef} className="map-container" />
        <SideBar {...state.coordinates} />
      </div>
    );
}
