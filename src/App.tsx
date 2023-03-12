import React, { useState, useEffect, useRef } from 'react';
import { GeoJSONSource, GeoJSONSourceRaw, Map as MapboxMap, Popup, LngLat, NavigationControl } from 'mapbox-gl'; 
import { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { centroid, Point, Polygon, polygon } from '@turf/turf';
import { Coordinates, getResolution, initialCoordinates } from './Coordinates';
import { getCountPerHexaSync, getPolygonFromHexaShapeSync, searchShapesSync } from './httpRequests';
//import { getCountPerHexaSync, getPolygonFromHexaShapeSync, searchShapesSync } from '../tests/httpRequestsMock';
import { BaseShape, H3PolygonShape} from '../src/shapeTypes';
import { AnimateDevices } from "./AnimateDevices"; // -ori
import { SideBar } from './components/SideBar';
const h3 = require("h3-js");


const ReactCdn = process.env.REACT_CDN!;
const getCountPerHexaEndpoint = ReactCdn + "/h3/aggregate/devices/count";
const fetchShapedH3Endpoint = ReactCdn + "/h3/fetch/shapes/h3polygon";
const searchShapesListEndpoint = ReactCdn + "/h3/search/shapes/list";
//const ShapesCdn = process.env.SHAPES_CDN!;
const MapboxToken : string = process.env.MAPBOX_TOKEN!;

function getMapUnprojectedCoordinates(map: any) {
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

    const latitudeMax = 90;
    const latitudeMin = -latitudeMax;
    const longitudeMax = 180;
    const longitudeMin = -longitudeMax;

    const initialState : State = {
        center: [initialCoordinates.ctrlng, initialCoordinates.ctrlat],
        zoom: [initialCoordinates.zoom],
        coordinates: initialCoordinates
    };

    function getInitialState() : State { return initialState };
  
    const [state, setState] = useState<State>(() => getInitialState());

    const mapContainer = useRef<string | HTMLElement>(null);
    var map = useRef<MapboxMap | null>(null);
    var ani = useRef<AnimateDevices | null>();

    function getCoordinates(map2: MapboxMap) {
        const extraFillArea = 0.5;
        const cc = getMapUnprojectedCoordinates(map2);
        let coordinates = [];
        const cUL = cc[0];
        const cLR = cc[2];
        const x1 = Math.min(cUL[0], cLR[0]);
        const x2 = Math.max(cUL[0], cLR[0]);
        const y1 = Math.min(cUL[1], cLR[1]);
        const y2 = Math.max(cUL[1], cLR[1]);
        const dh = x2 - x1;
        const dv = y2 - y1;
      
        let x1withBuffer = x1 - dh * extraFillArea;
        let x2withBuffer = x2 + dh * extraFillArea;
        let y1withBuffer = y1 - dv * extraFillArea;
        let y2withBuffer = y2 + dv * extraFillArea;
        let fullX = x1withBuffer < longitudeMin || x2withBuffer > longitudeMax;
      
        x1withBuffer = Math.max(x1withBuffer, longitudeMin);
        x2withBuffer = Math.min(x2withBuffer, longitudeMax);
        y1withBuffer = Math.max(y1withBuffer, latitudeMin);
        y2withBuffer = Math.min(y2withBuffer, latitudeMax);
      
        if (fullX) {
          coordinates.push([
            [latitudeMin, longitudeMin],
            [latitudeMin, 0],
            [latitudeMax, 0],
            [latitudeMax, longitudeMin]
          ]);
      
          coordinates.push([
            [latitudeMin, 0],
            [latitudeMin, longitudeMax],
            [latitudeMax, longitudeMax],
            [latitudeMax, 0]
          ]);
        } else {
          const xIncrement = 180;
          let lowerX = x1withBuffer;
          while (lowerX < longitudeMax && lowerX < x2withBuffer) {
            let upperX = Math.min(lowerX + xIncrement, x2withBuffer, 180);
            coordinates.push([[
              [y2withBuffer, lowerX],
              [y2withBuffer, upperX],
              [y1withBuffer, upperX],
              [y1withBuffer, lowerX]
            ]]);
            lowerX += xIncrement;
          }
        }
        return coordinates;
    }

    const renderHexes = React.useCallback(() => { 
        if (map === null || map.current === null)
            return;

        const borderLayerName = 'hex-layer-border';
        const countLayerName = 'hex-layer-count';
        const hexSourceName = 'hex-source';
        
        var stateZoom = state.zoom;
        var currentZoom = map.current.getZoom();
        var h3res = getResolution(currentZoom);
        var coordinates = getCoordinates(map.current);
        
        // Get hexagon indices on the map with the vertical and horizontal buffer
        var polyfill : any = [].concat(...coordinates.map(e => { return h3.polyfill(e, h3res); }));
        console.log(`currentZoom: ${currentZoom}, stateZoom ${stateZoom}, resolution: ${h3res}, hexagons: ${polyfill.length}`);

        const color = 'blue';
        var featureCollection : FeatureCollection = {
            "type": "FeatureCollection",
            "features": []
        };

        var results = getCountPerHexaSync(getCountPerHexaEndpoint, h3res, polyfill);
        for (let index in results.h3indices) {
          var cnt = results.h3indices[index];
          if (cnt > 0) {

            var hexBoundaries = [];
            let h = h3.h3ToGeoBoundary(index, true);
            if (h.find((e: any) => e[0] < -128) !== undefined) {
              h = h.map((e: any) => e[0]>0 ? [e[0]-360,e[1]] : e);
            }
            
            hexBoundaries.push(h);
            const hexaFeature : Feature<Polygon, GeoJsonProperties> = {
                'type': 'Feature',
                'properties': {'color': color},
                'geometry': {
                  'type': 'Polygon',
                  'coordinates': hexBoundaries
                }
            };
            featureCollection.features.push(hexaFeature);

            var hcc = h3.h3ToGeo(index);
            const markerFeature : Feature<Point, GeoJsonProperties> = {
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
        
        const hexSource = map.current.getSource(hexSourceName);
        if (hexSource !== undefined) {
            var gjs = hexSource as GeoJSONSource;
            if (gjs !== undefined)
                gjs.setData(featureCollection);
            else
                (hexSource as any).setData(featureCollection);
        } else {
            var hexGeoJson : GeoJSONSourceRaw = {
                type: 'geojson',
                data: featureCollection,
            };
            map.current.addSource(hexSourceName, hexGeoJson);
            map.current.addLayer({
                'id': borderLayerName,
                'source': hexSourceName,
                'type': 'line',
                'layout': {},
                'paint': {
                    'line-color': ['get', 'color'],
                    'line-width': 2,
                    'line-opacity': 0.3
                }
            });

            map.current.addLayer({
                'id': countLayerName,
                'source': hexSourceName,
                'type': 'symbol',
                'layout': {
                    'text-field': ['get', 'description'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 0.5,
                    'text-justify': 'auto',
                    'icon-image': ['get', 'icon'],
                    'text-font': ['Open Sans Regular'],
                    'text-size': 12,
                    "icon-allow-overlap" : true,
                    "text-allow-overlap": true
                    },
                "paint": {
                    'text-color': color
                }
            });
        }
    }, [map, state.zoom]);

    const renderPolyfill = React.useCallback(() => { 
        if (map === null || map.current === null)
            return;

        const borderLayerName = 'pf-layer-border';
        const fillLayerName = 'pf-layer-fill';
        const pfSourceName = 'pf-source';
        const pointLayerName = 'lb-layer-point';
        const lbSourceName = 'lb-source';
      
        var currentZoom = map.current.getZoom();
        var h3res = getResolution(currentZoom);
        var coordinates = getCoordinates(map.current);

        var polyfill : any = [].concat(...coordinates.map(e => { return h3.polyfill(e, h3res); }));
        var shapes = searchShapesSync(searchShapesListEndpoint, "ACTIVE", polyfill) as BaseShape[];
        var shapeIds = shapes.map(s => s.shapeId);

        // TODO: Add h3resolution: number
        var response = getPolygonFromHexaShapeSync(fetchShapedH3Endpoint, shapeIds) as H3PolygonShape[];

        const colors = { 'LIMIT': 'lime', 'NOGO': 'red', 'PARKING': 'aqua', 'NOPARKING': 'purple'};
        //const icons = { 'LIMIT': 'circle-stroked', 'NOGO': 'police-JP', 'PARKING': 'parking', 'NOPARKING': 'roadblock'};

        var hexaFeatureCollection : FeatureCollection = {
            "type": "FeatureCollection",
            "features": []
        };
        var labelFeatureCollection : FeatureCollection = {
            "type": "FeatureCollection",
            "features": []
        };

        for (var i=0; i < response.length; i++) {
            var hexBoundaries : number[][][] = [];
            const shape = response[i];

            const color = colors[shape.type];
            //const icon = icons[shape.type];
            
            hexBoundaries.push(shape.h3polygon);
            const hexaFeature : Feature<Polygon, GeoJsonProperties> = {
                'type': 'Feature',
                'properties': {
                    'color': color,
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': hexBoundaries
                }
            };
            hexaFeatureCollection.features.push(hexaFeature);

            const tp = polygon(hexBoundaries, { name: 'poly' });
            const tc = centroid(tp);
            const lon = tc.geometry.coordinates[0];
            const lat = tc.geometry.coordinates[1];

            var pointFeature : Feature<Point, GeoJsonProperties> = {
                'type': 'Feature',
                'properties': {
                    'description': `<strong>${shape.type}</strong><br/>${shape.name}`,
                    'color': color
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                }
            }
            labelFeatureCollection.features.push(pointFeature);
        }
        
        const hexSource = map.current.getSource(pfSourceName);
        if (hexSource !== undefined) {
            var gjs = hexSource as GeoJSONSource;
            if (gjs !== undefined)
                gjs.setData(hexaFeatureCollection);
            else
                (hexSource as any).setData(hexaFeatureCollection);
        } else {
            var hexGeoJson : GeoJSONSourceRaw = {
                type: 'geojson',
                data: hexaFeatureCollection,
            };
            map.current.addSource(pfSourceName, hexGeoJson);
            map.current.addLayer({
                'id': borderLayerName,
                'source': pfSourceName,
                'type': 'line',
                'layout': {},
                'paint': {
                    'line-color': ['get', 'color'],
                    'line-width': 2
                }
            });
            map.current.addLayer({
                'id': fillLayerName,
                'source': pfSourceName,
                'type': 'fill',
                'layout': {},
                'paint': {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.05
                }
            });
        }


        const lbSource = map.current.getSource(lbSourceName);
        if (lbSource !== undefined) {
            var gjs = lbSource as GeoJSONSource;
            if (gjs !== undefined)
                gjs.setData(labelFeatureCollection);
            else
                (lbSource as any).setData(labelFeatureCollection);
        } else {
            var lbGeoJson : GeoJSONSourceRaw = {
                type: 'geojson',
                data: labelFeatureCollection,
            };
            map.current.addSource(lbSourceName, lbGeoJson);

            // Add a layer showing the places.
            map.current.addLayer({
                'id': pointLayerName,
                'type': 'circle',
                'source': lbSourceName,
                'paint': {
                    'circle-color': ['get', 'color'],
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': ['get', 'color']
                }
            });
                
            // Create a popup, but don't add it to the map yet.
            const popup = new Popup({
                closeButton: false,
                closeOnClick: false
            });
                
            map.current.on('mouseenter', pointLayerName, (e) => {
                if (map === null || map.current === null || e == undefined || e.features == undefined)
                    return;
                
                console.log(e);
                // Change the cursor style as a UI indicator.
                map.current.getCanvas().style.cursor = 'pointer';
                
                var ef0 = e.features[0] as Feature<Point, GeoJsonProperties>;
                if (ef0 == undefined || ef0.properties == null)
                    return;

                // Copy coordinates array.
                const coordinates = ef0.geometry.coordinates.slice();
                const description = ef0.properties.description;
                
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                // Populate the popup and set its coordinates based on the feature found.
                const ll = new LngLat(coordinates[0], coordinates[1]);
                popup.setLngLat(ll).setHTML(description).addTo(map.current);
            });
                
            map.current.on('mouseleave', pointLayerName, () => {
                if (map === null || map.current === null)
                    return;

                map.current.getCanvas().style.cursor = '';
                popup.remove();
            });
            
        }
      }, [map, state.zoom]);
    
    const updateState = React.useCallback((me: any) => { 
        const map2 = me.target;
    
        console.log('updateState');
        // [cUL, cUR, cLR, cLL]
        var cc = getMapUnprojectedCoordinates(map2);
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
        if (map.current) {
            console.log("Map is already initialized");
            return; // initialize map only once
        }
        if (mapContainer.current === undefined || mapContainer.current === null) {
            console.log("mapContainer is null or undefined");
            return;
        }

        map.current = new MapboxMap({
            accessToken: MapboxToken,
            container: mapContainer.current!,
            style: process.env.MAPBOX_STYLE_LIGHT,
            center: state.center,
            zoom: state.zoom[0]
        });

        // disable map rotation using right click + drag
        map.current.dragRotate.disable();
        // disable map rotation using touch rotation gesture
        map.current.touchZoomRotate.disableRotation();
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

        if (map === null || map.current === null) {
            return;
        }

        map.current.on('load', (map2: any) => {
            renderHexes();
            renderPolyfill();
            updateState(map2);

            const m = map2.target as MapboxMap;
            if (m) {
                const ad = new AnimateDevices(m);
                ani.current = ad;
                ad.load();
              }
        });
        map.current.addControl(new NavigationControl());

        return () => {
            console.log('cleaning useEffect load');
        };
    }, [map, props, updateState, renderHexes, renderPolyfill]);

    useEffect(() => {
        console.log('entering useEffect zoomend');

        if (map === null || map.current === null) {
            return;
        }

        map.current.on('zoomend', (map2: any) => {
            const { onZoomEnd } = props;
            console.log("onZoomEnd");
            renderHexes();
            renderPolyfill();
            updateState(map2);
            return onZoomEnd && onZoomEnd(map2);
        });

        return () => {
            console.log('cleaning useEffect zoomend');
        };
    }, [map, props, updateState, renderHexes, renderPolyfill]);

    useEffect(() => {
        console.log('entering useEffect dragend');

        if (map === null || map.current === null) {
            return;
        }

        map.current.on('dragend', (map2: any) => {
            const { onDragEnd } = props;
            console.log("onDragEnd");
            renderHexes();
            renderPolyfill();
            updateState(map2);
            return onDragEnd && onDragEnd(map2);
        });

        return () => {
            console.log('cleaning useEffect dragend');
        };
    }, [map, props, updateState, renderHexes, renderPolyfill]);

    useEffect(() => {
        console.log('entering useEffect resize');

        if (map === null || map.current === null) {
            return;
        }

        window.onresize = () => {
            let canvas = document.getElementsByClassName('map-container mapboxgl-map')[0] as any;
            if (canvas === undefined || canvas === null) {
                console.log("canvas is null or undefined");
            } else {
                canvas.style.width = window.innerWidth + "px";
                canvas.style.height = window.innerHeight + "px";
            }

            if (map !== null && map.current !== null) {
                map.current.getCanvas().style.width = window.innerWidth + "px";
                map.current.getCanvas().style.height = window.innerHeight + "px";
                map.current.resize();
            }
        };

        window.onresize(new UIEvent(''));
        map.current.on('resize', (map2: any) => {
            const { onResize } = props;
            console.log("onResize");
            renderHexes();
            renderPolyfill();
            updateState(map2);
            return onResize && onResize(map2);
        });

        return () => {
            console.log('cleaning useEffect resize');
        };
    }, [map, props, updateState, renderHexes, renderPolyfill]);

    return (
      <div>
        <div ref={mapContainer as React.RefObject<HTMLDivElement>} className="map-container" />
        <SideBar {...state.coordinates} />
      </div>
    );
}
