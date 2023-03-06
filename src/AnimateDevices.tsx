import { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { featureCollection, LineString, Point } from "@turf/helpers";
import { Feature, GeoJsonProperties } from "geojson";

interface DeviceAnimations {
    [deviceId: string]: Animation[];
}

interface Animation {
    devDate: Date;
    prevDevDate: Date;
    totalTime: number;
    startDate: Date;
    endDate: Date;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    deltaLat: number;
    deltaLng: number;
    curLat: number;
    curLng: number;
    bearing: number;
    seq: number;
}

interface DevicePositions {
    [deviceId: string]: DevicePosition[];
}

interface DevicePosition {
    lng: number;
    lat: number;
    time: Date;
    seq: number;
}

// Converts from degrees to radians.
function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
};
   
// Converts from radians to degrees.
function toDegrees(radians: number) {
    return radians * 180 / Math.PI;
}

function getBearing(startLatInDeg: number, startLngInDeg: number, destLatInDeg: number, destLngInDeg: number){
    const startLatInRad = toRadians(startLatInDeg);
    const startLngInRad = toRadians(startLngInDeg);
    const destLatInRad = toRadians(destLatInDeg);
    const destLngInRad = toRadians(destLngInDeg);

    const y = Math.sin(destLngInRad - startLngInRad) * Math.cos(destLatInRad);
    const x = Math.cos(startLatInRad) * Math.sin(destLatInRad) -
            Math.sin(startLatInRad) * Math.cos(destLatInRad) * Math.cos(destLngInRad - startLngInRad);
    const brngInRad = Math.atan2(y, x);
    const brngInDeg = toDegrees(brngInRad);
    return (brngInDeg + 360) % 360;
}

export class AnimateDevices {

    constructor(m: MapboxMap) {
        this.map = m;
        this.timerAnimation = setInterval(() => { this.processAnimation(); }, 10*1000);
        this.ws = new WebSocket("ws://localhost:6262");

        console.log("Websocket subscribing to open event");
        this.ws.onopen = this.socketOpenedHandler;

        console.log("Websocket subscribing to message event");
        this.ws.onmessage = this.messageReceivedHandler;
    }

    readonly devicePositions: DevicePositions = {};
    readonly deviceAnimations : DeviceAnimations = {};
    readonly symbolFeatures: Feature<Point>[] = [];
    readonly symbolFeatureCollection = featureCollection<Point>(this.symbolFeatures);
    readonly traceFeatures: Feature<LineString>[] = [];
    readonly traceFeatureCollection = featureCollection<LineString>(this.traceFeatures);

    readonly ws : WebSocket;
    readonly timerAnimation : NodeJS.Timer;
    readonly map: MapboxMap;

    readonly arrowIcon = "up-arrow.png";
    readonly arrowName = "up-arrow";

    readonly symbolSourceName = "symbol-source";
    readonly traceSourceName = "trace-source";
    readonly symbolLayerName = "symbol-layer";
    readonly traceLayerName = "trace-layer";

    load() {
        //console.log("load begin");
        if (!this.map.hasImage(this.arrowName)) {
            this.map.loadImage(this.arrowIcon, (error: any, image: any) => {
                if (error)
                    throw error;
                
                if (this.map !== null && !this.map.hasImage(this.arrowName))
                    this.map.addImage(this.arrowName, image);

                this.addSymbolSourceAndLayer();
                this.addTraceSourceAndLayer();
                //console.log("load end");
            });
        }
    }

    private addSymbolSourceAndLayer() {
        var symbolSource = this.map.getSource(this.symbolSourceName);
        if (symbolSource === null || symbolSource === undefined) {
            this.map.addSource(this.symbolSourceName, {
                type: "geojson",
                data: this.symbolFeatureCollection
            });
        }
    
        var symbolLayer = this.map.getLayer(this.symbolLayerName);
        if (symbolLayer === null || symbolLayer === undefined) {
            this.map.addLayer({
                id: this.symbolLayerName,
                source: this.symbolSourceName,
                type: "symbol",
                layout: {
                    "icon-image": ["get", "icon"],
                    "icon-size": 0.2,
                    "icon-rotate": ["get", "rotation"],
                    "icon-allow-overlap" : true,
                    "text-allow-overlap": true
                }
            });
        }
    }

    private addTraceSourceAndLayer() {
        var traceSource = this.map.getSource(this.traceSourceName);
        if (!traceSource) {
            //console.log("Adding source " + this.traceSourceName);
            this.map.addSource(this.traceSourceName, {
                type: "geojson",
                data: this.traceFeatureCollection
            });
        };
    
        var traceLayer = this.map.getLayer(this.traceLayerName);
        if (!traceLayer) {
            //console.log("Adding layer " + this.traceLayerName);
            this.map.addLayer({
                id: this.traceLayerName,
                type: "line",
                source: this.traceSourceName,
                paint: {
                  "line-color": 'red',
                  "line-opacity": 0.75,
                  "line-width": 2
                }
            });
        }
    }

    private processAnimation() {
      const animationKeys = Object.keys(this.deviceAnimations);
      const now = new Date();
  
      for (const devId of animationKeys) {
        const animations = this.deviceAnimations[devId];
        if (animations.length > 0) {
          var removeIndices : number[] = [];
          for (let i=0; i < animations.length; i++) {
            const animation = animations[i];
            if (now >= animation.endDate) {
              removeIndices.push(i);
            } else if (now >= animation.startDate) {
              const elapsed = now.getTime() - animation.startDate.getTime();
              const progress = elapsed / animation.totalTime * 100;
              animation.curLng = animation.startLng + animation.deltaLng * progress / 100.0;
              animation.curLat = animation.startLat + animation.deltaLat * progress / 100.0;
              //console.log(`Device:${devId} progress:${Math.round((progress + Number.EPSILON) * 100) / 100} ON-GOING`);
              this.updateSymbolLocation(animation.curLng, animation.curLat, animation.bearing, devId);
            } else {
              console.log(`Device:${devId} animation out of scope`);
            }
          }
  
  
          if (removeIndices.length > 0) {
            // If no other next then update to 100%
            if (removeIndices.length >= animations.length) {
              const lastAnimation = animations[animations.length-1];
              this.updateSymbolLocation(lastAnimation.endLng, lastAnimation.endLat, lastAnimation.bearing, devId);
              //console.log(`Device:${devId} progress:100.00 FINISHED`);
            }
  
            while (removeIndices.length > 0 && animations.length > 0) {
              const animation = animations[0];
              if (now >= animation.endDate) {
                animations.shift();
                removeIndices.shift();
                //console.log(`animations.shift();`);
              }
            }
          }
        }
      }
  
      // In case no animation is ready yet but device position was updated
      const positionKeys = Object.keys(this.devicePositions);
      for (const devId of positionKeys) {
        if (!animationKeys.includes(devId)) {
          const arr = this.devicePositions[devId];
          if (arr.length > 0) {
            const firstPos = arr[0];
            const bearing = 0.0; //getBearing(state.lat, state.lng, firstPos.lat, firstPos.lng);
            this.updateSymbolLocation(firstPos.lng, firstPos.lat, bearing, devId);
          }
        }
      }
    }

    private createSymbolFeature(lng: number, lat: number, bearing: number, deviceId: string) : Feature<Point, GeoJsonProperties> {
        return {
            type: "Feature",
            properties: {
                deviceId: deviceId,
                icon: this.arrowName,
                rotation: bearing
            },
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            }
        }
    }

    private createTraceFeature(lng: number, lat: number, deviceId: string) : Feature<LineString, GeoJsonProperties> {
        return {
            type: "Feature",
            properties: {
                deviceId: deviceId
            },
            geometry: {
                type: "LineString",
                coordinates: [[lng, lat]]
            }
        }
    }
  
    private getSymbolFeature(devId : string) : Feature<Point, GeoJsonProperties> | undefined {
      var ret : Feature<Point, GeoJsonProperties> | undefined = undefined;
      for (let ft of this.symbolFeatureCollection.features) {
        let ls = ft as Feature<Point, GeoJsonProperties>;
        if (ls.properties?.deviceId == devId) {
          ret = ls;
          break;
        }
      }
      return ret;
    }
  
    private getTraceFeature(devId : string) : Feature<LineString, GeoJsonProperties> | undefined {
      var ret : Feature<LineString, GeoJsonProperties> | undefined = undefined;
      for (const ft of this.traceFeatureCollection.features) {
        const ls = ft as Feature<LineString, GeoJsonProperties>;
        if (ls.properties?.deviceId == devId) {
          ret = ls;
          break;
        }
      }
      return ret;
    }
  
    private updateSymbolLocation(lng: number, lat: number, bearing: number, devId: string) {
      var sf : Feature<Point, GeoJsonProperties> | undefined = this.getSymbolFeature(devId);
      if (sf === undefined) {
        const sf0 = this.createSymbolFeature(lng, lat, bearing, devId);
        this.symbolFeatureCollection.features.push(sf0);
        //console.log("symbolFeatureCollection.features added");
      } else {
        if (sf.properties) {
          sf.properties.rotation = bearing;
        }
        
        if (sf.geometry) {
          if (sf.geometry.coordinates) {
            sf.geometry.coordinates = [lng, lat];
          }
        }
      }
  
      if (this.map === null) {
        return;
      }
  
      var symbolSource = this.map.getSource(this.symbolSourceName) as GeoJSONSource;
      if (symbolSource !== undefined) {
        //console.log(`symbolSource.setData(symbolFeatureCollection);`);
        symbolSource.setData(this.symbolFeatureCollection);
      }
    }

    private socketOpenedHandler = (event: any) => {
        console.log("We are connected");
    
        if (event == null || event === undefined || event.target === null) {
            return;
        }
    
        const payload = {'type': 'subscriptionToAllRequest'};
        const str = JSON.stringify(payload);
        this.ws.send(str);
    }

    private messageReceivedHandler = (event: any) => {
        //console.log(event);
        if (event == null || event === undefined || event.data === null && event.data === undefined)
            return;
    
        console.log(event.data);
        // {"deviceId":"test-002","dts":1674363622286,"seq":22,"lng":-77.40573734683353,"lat":41.66481865316644,"alt":8.495930653166461,"h3r15":"8f2aa015411c4d8"}
        if (!event.data.startsWith("{") || !event.data.endsWith("}")) {
            return;
        }
    
        const json = JSON.parse(event.data);
        const deviceId = json.deviceId;
        const lng = json.lng as number;
        const lat = json.lat as number;
        const dts = new Date(json.dts);
        const seq = json.seq as number;
        const dp : DevicePosition = {lng: lng, lat: lat, time: dts, seq: seq};
    
        const positions = this.devicePositions[deviceId];
        if (positions === undefined) {
            this.devicePositions[deviceId] = [dp];
            //console.log("Added devicePosition");
        } else {
            const prevPos = positions[positions.length-1];
            //console.log("prevPos: " + JSON.stringify(prevPos));
            this.devicePositions[deviceId].push(dp);
    
            const lng0 = prevPos.lng;
            const lat0 = prevPos.lat;
            const dts0 = prevPos.time;
    
            const startTime = new Date();
            const totalTime = dts.getTime() - dts0.getTime();
            const endTime = new Date(startTime.getTime() + totalTime);
            var animation : Animation = {
            devDate: dts,
            prevDevDate: dts0,
            totalTime: totalTime,
            startDate: startTime,
            endDate: endTime,
            startLat: lat0,
            startLng: lng0,
            deltaLat: lat - lat0, // TODO: Fix wrap up
            deltaLng: lng - lng0, // TODO: Fix wrap up
            endLat: lat,
            endLng: lng,
            curLat: -1000, // For tracking
            curLng: -1000, // For tracking
            bearing: getBearing(lat0, lng0, lat, lng),
            seq: seq
            };
    
            if (this.deviceAnimations[deviceId] === null || this.deviceAnimations[deviceId] === undefined) {
                this.deviceAnimations[deviceId] = [animation];
            } else {
                this.deviceAnimations[deviceId].push(animation);
            }
            console.log(animation);
        }
    
        var ls = this.getTraceFeature(deviceId);
        if (ls === undefined) {
            const tf = this.createTraceFeature(lng, lat, deviceId);
            this.traceFeatureCollection.features.push(tf);
            //console.log("traceFeatureCollection.features added");
        } else {
            ls.geometry.coordinates.push([lng, lat]);
            //console.log("traceFeatureCollection.features.coordinates added");
        }
    
        if (this.map !== null) {
            var traceSource = this.map.getSource(this.traceSourceName) as GeoJSONSource;
            if (traceSource) { // TODO: Fix wrap up
              traceSource.setData(this.traceFeatureCollection);
            }
        }
    };

    unsubscribe = () => {
        console.log("Websocket unsubscribing to message event");
        this.ws.removeEventListener('message', this.messageReceivedHandler);

        console.log("Websocket unsubscribing to open event");
        this.ws.removeEventListener("open", this.socketOpenedHandler);

        clearInterval(this.timerAnimation);
    }
}