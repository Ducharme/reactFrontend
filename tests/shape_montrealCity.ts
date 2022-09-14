const h3 = require("h3-js");
import { Feature, MultiPolygon, Polygon, Position, polygon } from '@turf/turf';
import union from "@turf/union";
import intersect from "@turf/intersect";
import { PolygonShape, H3PolygonShape, HexaShape, HexaShapeResponse, IShape, PolygonShapeResponse } from "../src/shapeTypes";


const shapeMontreal : IShape = {
  "shapeId": "b54b8bbf-4cdb-4d44-8501-f9845b40c060",
  "name": "Montreal city",
  "type": "LIMIT",
  "status": "ACTIVE",
  "createdAt": "",
  "modifiedAt": "",
  "deletedAt": "",
  "shapeVersion": "0.0.1",
  "schemaVersion": "0.0.1",
  "polygon": [
    [45.70595006108803, -73.46978144968874],
    [45.439093636064456, -73.97380724968878],
    [45.415299946198104, -73.59183254027172],
    [45.70595006108803, -73.46978144968874 ]
  ],
  "filter": {
    "h3r0": ["802bfffffffffff"],
    "h3r1": ["812bbffffffffff"],
    "h3r2": ["822b87fffffffff","822baffffffffff"],
    "h3r3": ["832b81fffffffff","832baafffffffff"],
    "h3r4": ["842b81bffffffff","842baa5ffffffff", "842baa7ffffffff"],
    "h3r5": ["852b81b7fffffff","852baa43fffffff","852baa47fffffff","852baa4ffffffff","852baa57fffffff",
      "852baa73fffffff","852baa7bfffffff"],
    "h3r6": ["862b81b67ffffff","862b81b77ffffff","862baa40fffffff","862baa42fffffff","862baa44fffffff",
      "862baa467ffffff","862baa46fffffff","862baa4c7ffffff","862baa4dfffffff","862baa4e7ffffff",
      "862baa547ffffff","862baa717ffffff","862baa7a7ffffff","862baa7b7ffffff"],
    "h3r7": ["UNDEFINED"],
    "h3r8": ["UNDEFINED"],
    "h3r9": ["UNDEFINED"],
    "h3r10": ["UNDEFINED"],
    "h3r11": ["UNDEFINED"],
    "h3r12": ["UNDEFINED"],
    "h3r13": ["UNDEFINED"],
    "h3r14": ["UNDEFINED"],
    "h3r15": ["UNDEFINED"]
  },
  "shape": {
    "h3r0": ["UNDEFINED"],
    "h3r1": ["UNDEFINED"],
    "h3r2": ["UNDEFINED"],
    "h3r3": ["UNDEFINED"],
    "h3r4": ["UNDEFINED"],
    "h3r5": ["UNDEFINED"],
    "h3r6": ["862baa447ffffff","862baa457ffffff","862baa45fffffff","862baa477ffffff","862baa4cfffffff",
      "862baa4efffffff","862baa55fffffff"
    ],
    "h3r7": ["872b81b64ffffff","872b81b66ffffff","872b81b75ffffff","872baa409ffffff","872baa429ffffff",
      "872baa448ffffff","872baa44affffff","872baa44bffffff","872baa44cffffff","872baa44effffff",
      "872baa460ffffff","872baa462ffffff","872baa463ffffff","872baa464ffffff","872baa466ffffff",
      "872baa46affffff","872baa4c1ffffff","872baa4c3ffffff","872baa4c5ffffff","872baa4d9ffffff",
      "872baa4dbffffff","872baa4ddffffff","872baa4e1ffffff","872baa4e5ffffff","872baa540ffffff",
      "872baa542ffffff","872baa543ffffff","872baa544ffffff","872baa546ffffff","872baa716ffffff",
      "872baa7a0ffffff","872baa7a2ffffff","872baa7a4ffffff","872baa7a5ffffff","872baa7a6ffffff",
      "872baa7b0ffffff","872baa7b1ffffff","872baa7b2ffffff","872baa7b4ffffff","872baa7b5ffffff",
      "872baa7b6ffffff"],
    "h3r8": ["UNDEFINED"],
    "h3r9": ["UNDEFINED"],
    "h3r10": ["UNDEFINED"],
    "h3r11": ["UNDEFINED"],
    "h3r12": ["UNDEFINED"],
    "h3r13": ["UNDEFINED"],
    "h3r14": ["UNDEFINED"],
    "h3r15": ["UNDEFINED"]
  }
};

const shapeMontreal2 : IShape = {
  "shapeId": "47db1f7b-5c0f-4f85-88d7-2bc3f83eaaf4",
  "name": "Montreal City",
  "type": "LIMIT",
  "status": "ACTIVE",
  "createdAt": "2022-07-21T02:20:54.910Z",
  "modifiedAt": "",
  "deletedAt": "",
  "shapeVersion": "0.0.1",
  "schemaVersion": "0.0.1",
  "polygon": [
      [45.703090820337195, -73.47753036109698],
      [45.676649818375324, -73.48587994093192],
      [45.65622354456548, -73.4803135543754],
      [45.646010407660555, -73.48365338630907],
      [45.633072686492426, -73.48921977286517],
      [45.58907210478259, -73.49756935269951],
      [45.54230810885909, -73.52484464682614],
      [45.508379824879654, -73.54377036111725],
      [45.46154862266769, -73.53319422666051],
      [45.44143650646062, -73.55045002498467],
      [45.43304059608309, -73.57549876448803],
      [45.411161659565124, -73.61502010903804],
      [45.4318687251353, -73.71076195780708],
      [45.4353326674821, -73.79277166571167],
      [45.41911828490386, -73.85010544724189],
      [45.409056989462435, -73.88266880859592],
      [45.405248165458005, -73.91634544726153],
      [45.401730748783166, -73.95419687584489],
      [45.438848037508365, -73.98982174980526],
      [45.45290371840625, -73.98147216997059],
      [45.4659844965942, -73.96421637164602],
      [45.46969532731862, -73.94584729600994],
      [45.47555051037122, -73.9263649430631],
      [45.463058717824026, -73.90855250608291],
      [45.49389281154069, -73.85622847245382],
      [45.516519759495424, -73.8495488085861],
      [45.51261921041174, -73.75547687578405],
      [45.5364046994987, -73.71929536316793],
      [45.55317170635087, -73.67754746399557],
      [45.61744980559982, -73.63691284213468],
      [45.65442496011991, -73.58570208581588],
      [45.67737629716697, -73.5372745227764],
      [45.69954062605095, -73.51834880848533],
      [45.703090820337195, -73.47753036109698]
  ],
  "filter": {
      "h3r0": ["802bfffffffffff"],
      "h3r1": ["812bbffffffffff"],
      "h3r2": ["822b87fffffffff","822baffffffffff"],
      "h3r3": ["832b81fffffffff","832baafffffffff"],
      "h3r4": ["842b81bffffffff","842baa5ffffffff","842baa7ffffffff"],
      "h3r5": ["852b81b7fffffff","852baa43fffffff","852baa47fffffff","852baa4ffffffff","852baa57fffffff",
        "852baa73fffffff","852baa7bfffffff"],
      "h3r6": ["862b81b47ffffff","862b81b67ffffff","862b81b77ffffff","862baa42fffffff","862baa457ffffff",
        "862baa467ffffff","862baa46fffffff","862baa477ffffff","862baa4c7ffffff","862baa4dfffffff",
        "862baa4efffffff","862baa547ffffff","862baa54fffffff","862baa557ffffff","862baa577ffffff",
        "862baa717ffffff","862baa737ffffff","862baa797ffffff","862baa7a7ffffff","862baa7b7ffffff"],
      "h3r7": ["872b81b44ffffff","872b81b63ffffff","872b81b65ffffff","872b81b76ffffff","872baa429ffffff",
        "872baa42dffffff","872baa450ffffff","872baa452ffffff","872baa454ffffff","872baa461ffffff",
        "872baa465ffffff","872baa46bffffff","872baa46effffff","872baa472ffffff","872baa476ffffff",
        "872baa4c0ffffff","872baa4c3ffffff","872baa4c5ffffff","872baa4daffffff","872baa4ddffffff",
        "872baa4ecffffff","872baa4eeffffff","872baa541ffffff","872baa544ffffff","872baa54bffffff",
        "872baa54effffff","872baa551ffffff","872baa555ffffff","872baa571ffffff","872baa573ffffff",
        "872baa716ffffff","872baa732ffffff","872baa736ffffff","872baa796ffffff","872baa7a0ffffff",
        "872baa7a2ffffff","872baa7b2ffffff"],
    "h3r8": ["UNDEFINED"],
    "h3r9": ["UNDEFINED"],
    "h3r10": ["UNDEFINED"],
    "h3r11": ["UNDEFINED"],
    "h3r12": ["UNDEFINED"],
    "h3r13": ["UNDEFINED"],
    "h3r14": ["UNDEFINED"],
    "h3r15": ["UNDEFINED"]
  },
  "shape": {
    "h3r0": ["UNDEFINED"],
    "h3r1": ["UNDEFINED"],
    "h3r2": ["UNDEFINED"],
    "h3r3": ["UNDEFINED"],
    "h3r4": ["UNDEFINED"],
    "h3r5": ["UNDEFINED"],
    "h3r6": ["862baa447ffffff","862baa44fffffff","862baa45fffffff","862baa4cfffffff","862baa55fffffff"],
    "h3r7": ["872b81b60ffffff","872b81b62ffffff","872b81b64ffffff","872b81b66ffffff","872b81b70ffffff",
      "872b81b71ffffff","872b81b74ffffff","872b81b75ffffff","872baa451ffffff","872baa453ffffff",
      "872baa455ffffff","872baa460ffffff","872baa462ffffff","872baa463ffffff","872baa464ffffff",
      "872baa466ffffff","872baa46affffff","872baa470ffffff","872baa471ffffff","872baa473ffffff",
      "872baa474ffffff","872baa475ffffff","872baa4c1ffffff","872baa4d9ffffff","872baa4dbffffff",
      "872baa4e8ffffff","872baa4e9ffffff","872baa4eaffffff","872baa4ebffffff","872baa4edffffff",
      "872baa540ffffff","872baa542ffffff","872baa543ffffff","872baa546ffffff","872baa54affffff",
      "872baa7a4ffffff","872baa7a5ffffff","872baa7a6ffffff","872baa7b0ffffff","872baa7b4ffffff",
      "872baa7b5ffffff","872baa7b6ffffff"],
    "h3r8": ["882b81b449fffff","882b81b44dfffff","882b81b63dfffff","882b81b651fffff","882b81b655fffff",
      "882b81b659fffff","882b81b65dfffff","882b81b76bfffff","882baa4291fffff","882baa4293fffff",
      "882baa4297fffff","882baa4299fffff","882baa429bfffff","882baa42d3fffff","882baa42dbfffff",
      "882baa4501fffff","882baa4503fffff","882baa4507fffff","882baa4509fffff","882baa450bfffff",
      "882baa4523fffff","882baa452bfffff","882baa4543fffff","882baa4549fffff","882baa454bfffff",
      "882baa4611fffff","882baa4615fffff","882baa4617fffff","882baa461dfffff","882baa4655fffff",
      "882baa4657fffff","882baa465dfffff","882baa46b1fffff","882baa46b3fffff","882baa46b5fffff",
      "882baa46b7fffff","882baa46bdfffff","882baa46e1fffff","882baa46e5fffff","882baa46e7fffff",
      "882baa46e9fffff","882baa46edfffff","882baa4721fffff","882baa4723fffff","882baa4729fffff",
      "882baa472bfffff","882baa4761fffff","882baa4763fffff","882baa4769fffff","882baa476bfffff",
      "882baa4c03fffff","882baa4c07fffff","882baa4c0bfffff","882baa4c33fffff","882baa4c39fffff",
      "882baa4c3bfffff","882baa4c53fffff","882baa4c57fffff","882baa4da3fffff","882baa4dabfffff",
      "882baa4dd1fffff","882baa4dd3fffff","882baa4dd7fffff","882baa4dd9fffff","882baa4ddbfffff",
      "882baa4ec1fffff","882baa4ec3fffff","882baa4ec7fffff","882baa4ec9fffff","882baa4ecbfffff",
      "882baa4ee3fffff","882baa5415fffff","882baa5417fffff","882baa5445fffff","882baa5447fffff",
      "882baa544dfffff","882baa54b5fffff","882baa54e1fffff","882baa54e5fffff","882baa54e7fffff",
      "882baa54edfffff","882baa5511fffff","882baa5513fffff","882baa5517fffff","882baa5519fffff",
      "882baa551bfffff","882baa5553fffff","882baa555bfffff","882baa5711fffff","882baa5713fffff",
      "882baa5717fffff","882baa571bfffff","882baa573bfffff","882baa7161fffff","882baa7165fffff",
      "882baa7169fffff","882baa716dfffff","882baa7325fffff","882baa732dfffff","882baa7365fffff",
      "882baa796dfffff","882baa7a01fffff","882baa7a05fffff","882baa7a09fffff","882baa7a0bfffff",
      "882baa7a0dfffff","882baa7a29fffff","882baa7a2dfffff","882baa7b21fffff","882baa7b25fffff",
      "882baa7b27fffff","882baa7b29fffff","882baa7b2bfffff","882baa7b2dfffff"],
    "h3r9": ["UNDEFINED"],
    "h3r10": ["UNDEFINED"],
    "h3r11": ["UNDEFINED"],
    "h3r12": ["UNDEFINED"],
    "h3r13": ["UNDEFINED"],
    "h3r14": ["UNDEFINED"],
    "h3r15": ["UNDEFINED"]
  }
}

const shapesArr : IShape[] = [];
shapesArr.push(shapeMontreal);
//console.debug(shapeMontreal.shapeId);
//shapesArr.push(shapeMontreal2);
console.debug(shapeMontreal2.shapeId);

export const getShapeIds = (/*h3resolution: number,*/ h3indices: [String]) : string[] => {
  
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


export const getPolygonShapeSyncMock = (endpoint: string, h3resolution: number, h3indices: [String]) : PolygonShapeResponse => {
  console.debug(`Call to endpoint: ${endpoint} with h3resolution=${h3resolution}`);
  
  var shapeIds = getShapeIds(h3indices);
  console.log(`shapeIds are: ${shapeIds.join(',')}`);

  var shapes : PolygonShape[] = shapesArr.filter(s => shapeIds.includes(s.shapeId)).map(s => {
    var sr : PolygonShape = {shapeId: s.shapeId, name: s.name, type: s.type, polygon: s.polygon};
    console.log(`Shape ${s.shapeId} was added`);
    return sr;
  });

  var resp = {h3resolution: h3resolution, shapes: shapes};
  return resp;
}

export const getHexaShapeSyncMock = (endpoint: string, h3resolution: number, h3indices: [String]) : HexaShapeResponse => {
  console.debug(`Call to endpoint: ${endpoint} with h3resolution=${h3resolution}`);
  
  var shapeIds = getShapeIds(h3indices);
  console.log(`shapeIds are: ${shapeIds.join(',')}`);

  var shapes : HexaShape[] = shapesArr.filter(s => shapeIds.includes(s.shapeId)).map(s => {
    var hr : HexaShape = {shapeId: s.shapeId, name: s.name, type: s.type, shape: s.shape};
    console.log(`Shape ${s.shapeId} was added`);
    return hr;
  });

  var resp = {h3resolution: h3resolution, shapes: shapes};
  return resp;
}

export const getPolygonFromHexaShapeSyncMock = (endpoint: string, h3resolution: number, h3indices: [String]) : H3PolygonShape[] => {
  console.debug(`Call to endpoint: ${endpoint} with h3resolution=${h3resolution}`);
  
  var shapeIds = getShapeIds(h3indices);
  console.log(`AAA shapeIds are: ${shapeIds.join(',')}`);

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

      const isGeoJson = false;
      var mergedPolygons = h3.h3SetToMultiPolygon(h3indexList, isGeoJson); // returns [][][][]
      console.log("mergedPolygons");
      console.log(mergedPolygons);

      for (var c=0; c < mergedPolygons.length; c++) {
        console.log("mergedPolygons: " + c);
        var mp = mergedPolygons[c];

        for (var d=0; d < mp.length; d++) {
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

      while (turfPolygons.length > 0) {
        console.log("turfPolygons.length=" + turfPolygons.length);
        for (var e=0; e < turfPolygons.length; e++) {
          var p2 = turfPolygons[e];
          var isct = intersect(sp, p2);
          if (isct !== null) {
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
      console.log("singlePolygon = sp");
      console.log(sp);
    } else {
      console.log("singlePolygon = turf.polygon(unionPolygons);");
      console.log(unionPolygons);
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