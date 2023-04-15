const h3 = require("h3-js");
import { Feature, MultiPolygon, Polygon, Position, polygon } from '@turf/turf';
import union from "@turf/union";
import intersect from "@turf/intersect";
//import { montrealIsland } from "./shapes/limit/montrealIsland-simple";
import { montrealIsland } from "./shapes/limit/montrealIsland-complex";
import { montrealAirport } from "./shapes/nogo/montreal-airport";
import { montrealOldCity } from "./shapes/parking/montreal-oldCity";
import { montrealMontRoyal } from "./shapes/noparking/montreal-montRoyal";
import { PolygonShape, H3PolygonShape, HexaShape, IShape, BaseShape } from "../src/shapeTypes";

export const shapeMontrealIsland : IShape = montrealIsland;
export const shapeMontrealAirport : IShape = montrealAirport;
export const shapeMontrealOldCity : IShape = montrealOldCity;
export const shapeMontrealMontRoyal : IShape = montrealMontRoyal;

const shapesArr : IShape[] = [];
shapesArr.push(montrealIsland);
shapesArr.push(shapeMontrealAirport);
shapesArr.push(shapeMontrealOldCity);
shapesArr.push(shapeMontrealMontRoyal);
const verbose = false;

export const getShapeIds = (/*h3resolution: number,*/ h3indices: string[]) : string[] => {
  
  var shapeIds : string[] = [];
  for (var i=0; i < h3indices.length; i++) {
    var index = h3indices[i];
    var h3res = h3.h3GetResolution(index);

    for (var j=0; j < shapesArr.length; j++) {
      var shape = shapesArr[j];
      if (shapeIds.includes(shape.shapeId)) {
        continue;
      }

      var filters = shape.filter['h3r' + h3res];
      if (filters === undefined) {
        continue;
      }
      
      if (filters.length == 1 && filters[0] == "UNDEFINED") {
        continue;
      }

      if (!filters.includes(index)) {
        continue;
      }
      
      shapeIds.push(shape.shapeId);
    }
  }

  return shapeIds;
}

export const searchShapesSyncMock = (endpoint: string, status: string, h3indices: string[]) : BaseShape[] => {
  console.debug(`Call to endpoint (searchShapesSyncMock): ${endpoint} with status=${status} h3indices=${h3indices}`);

  var bss = shapesArr.map(s => {
    var bs : BaseShape = {
      shapeId: s.shapeId,
      name: s.name,
      status: s.status,
      type: s.type
    };
    return bs;
  });
  return bss;
}

export const getPolygonShapeSyncMock = (endpoint: string, h3resolution: number, h3indices: string[]) : PolygonShape[] => {
  console.debug(`Call to endpoint (getPolygonShapeSyncMock): ${endpoint} with h3resolution=${h3resolution}`);
  
  var shapeIds = getShapeIds(h3indices);
  console.log(`shapeIds are: ${shapeIds.join(',')}`);

  var shapes : PolygonShape[] = shapesArr.filter(s => shapeIds.includes(s.shapeId)).map(s => {
    var sr : PolygonShape = {shapeId: s.shapeId, name: s.name, type: s.type, polygon: s.polygon};
    console.log(`Shape ${s.shapeId} was added`);
    return sr;
  });

  return shapes;
}

export const getHexaShapeSyncMock = (endpoint: string, shapeIds: string[]) : HexaShape[] => {
  console.log(`Call to endpoint (getHexaShapeSyncMock): ${endpoint} with shapeIds ${shapeIds.join(',')}`);

  var shapes : HexaShape[] = shapesArr.filter(s => shapeIds.includes(s.shapeId)).map(s => {
    var hr : HexaShape = {shapeId: s.shapeId, name: s.name, type: s.type, shape: s.shape};
    console.log(`Shape ${s.shapeId} was added`);
    return hr;
  });

  return shapes;
}

export const getPolygonFromHexaShapeSyncMock = (endpoint: string, shapeIds: string[]) : H3PolygonShape[] => {
  console.log(`Call to endpoint (getPolygonFromHexaShapeSyncMock): ${endpoint} with shapeIds ${shapeIds.join(',')}`);

  var shapes : H3PolygonShape[] = [];
  for (var a=0; a < shapesArr.length; a++) { // For all shapes
    var s = shapesArr[a];
    if (!shapeIds.includes(s.shapeId))
      continue;

    var unionPolygons : number[][][] = [];
    for (var b=0; b <= 15; b++) { // For all h3 resolutions
      var h3indexList = s.shape['h3r' + b];
      if (h3indexList === undefined || h3indexList.length == 0)
        continue;

      if (h3indexList.length == 1 && h3indexList[0] == "UNDEFINED")
        continue;

      const isGeoJson = false; //BUG forcing to set false: https://github.com/Turfjs/turf/issues/2048
      var mergedPolygons = h3.h3SetToMultiPolygon(h3indexList, isGeoJson); // returns [][][][]
      if (verbose) {
        console.log("mergedPolygons");
        console.log(mergedPolygons);
      }

      for (var c=0; c < mergedPolygons.length; c++) {
        if (verbose)
          console.log("mergedPolygons: " + c);
        var mp = mergedPolygons[c];

        for (var d=0; d < mp.length; d++) {
          if (verbose)
            console.log("mergedPolygons: " + c + " level: " + d);

          var mpl = mp[d];
          if (!isGeoJson) {
            // Need to close the polygon
            var latB = mpl[0][0];
            var lonB = mpl[0][1];
            var latE = mpl[mpl.length-1][0];
            var lonE = mpl[mpl.length-1][1];
            if (latB != latE || lonB != lonE) {
              mpl.push([latB,lonB]);
            }
          }
        }

        unionPolygons.push(mp);
      }
    }

    var singlePolygon : Feature<Polygon | MultiPolygon> | null = null;
    if (unionPolygons.length > 1) {
      var turfPolygons : Feature<Polygon>[] = [];
      for (var h=0; h < unionPolygons.length; h++) {
        var tp = polygon(unionPolygons[h] as any, { name: 'poly' + h });
        turfPolygons.push(tp);
      }

      var sp : any = turfPolygons[0];
      turfPolygons.shift();

      var counter = 0;
      while (turfPolygons.length > 0) {
        counter = counter + 1;
        if (verbose)
          console.log("turfPolygons.length=" + turfPolygons.length);

        for (var e=0; e < turfPolygons.length; e++) {
          var p2 = turfPolygons[e];
          var isct = intersect(sp, p2);
          if (isct !== null) {
            if (verbose && isct.geometry.type == "MultiPolygon") {
              console.log("MultiPolygon isct" );
              console.log(isct);
            }

            var u = union(sp, p2);
            if (u === undefined || u === null || u.geometry === undefined || u.geometry === null)
              continue;
            
            sp = u.geometry;
            turfPolygons.splice(e, 1);
            break;
          }
        }
      }
      singlePolygon = polygon(sp.coordinates, { name: 'singlePolygon' });
      if (verbose) {
        console.log(`counter=${counter}`);
        console.log("singlePolygon = sp");
        console.log(sp);
      }
    } else {
      if (verbose) {
        console.log("singlePolygon = turf.polygon(unionPolygons);");
        console.log(unionPolygons);
      }
      singlePolygon = polygon(unionPolygons[0] as any); // as Position[][]
    }

    if (singlePolygon !== undefined && singlePolygon !== null) {
      var coordinates : Position[][] | Position[][][] | undefined = singlePolygon.geometry.coordinates;

      if (coordinates !== undefined && coordinates !== null) {
        if (singlePolygon.geometry.type == "Polygon") {
          var ee : number[][] = []; 
          for (var c=0; c < coordinates.length; c++) {
            singlePolygon[c] = [];
            for (var f=0; f < coordinates[c].length; f++) {
              var lng1 = coordinates[c][f][0].valueOf() as number;
              var lat1 = coordinates[c][f][1].valueOf() as number;
              singlePolygon[c][f] = [lat1, lng1];
            }
          }
          var hr : H3PolygonShape = {shapeId: s.shapeId, name: s.name, type: s.type,
            status: s.status, h3polygon: singlePolygon[0] as any};
          if (verbose)
            console.log(`Shape ${s.shapeId} was added`);
          shapes.push(hr);
      } else { // MultiPolygon
          for (var d=0; d < coordinates.length; d++) {
            for (var c=0; c < coordinates[d].length; c++) {
              var ee : number[][] = [];
              for (var f=0; f < coordinates[d][c].length; f++) {
                var lng1 = coordinates[d][c][f][0].valueOf() as number;
                var lat1 = coordinates[d][c][f][1].valueOf() as number;
                ee.push([lat1, lng1]);
              }
              var hr : H3PolygonShape = {shapeId: s.shapeId, name: s.name, type: s.type,
                status: s.status, h3polygon: ee};
                if (verbose)
                  console.log(`Shape ${s.shapeId} was added`);
              shapes.push(hr);
            }
          }
        }
      }
    }
  }

  return shapes;
}