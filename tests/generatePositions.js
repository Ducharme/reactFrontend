var minLat = 45.11295266136432;
var maxLat = 45.83566308933573;
var minLon = -72.8364003984309;
var maxLon = -74.25226331518755;


var rngLat = Math.abs(maxLat - minLat);
var rngLon = Math.abs(maxLon - minLon);
var southLat = Math.min(minLat, maxLat);
var northLat = Math.max(minLat, maxLat);
var westLon = Math.min(minLon, maxLon);
var eastLon = Math.max(minLon, maxLon);

console.log(`southLat:${southLat} northLat:${northLat}`);
console.log(`westLon:${westLon} eastLon:${eastLon}`);
console.log(`rngLat:${rngLat} rngLon:${rngLon}`);

var positions = [];
for (var i=0; i < 100; i++) {
  var randx = Math.random();
  var randy = Math.random();
  var x = randx * rngLon + westLon;
  var y = randy * rngLat + southLat;

  console.log(`randx:${randx} randy:${randy}`);
  console.log(`x:${x} y:${y}`);

  if (x < westLon)
    throw `x too small`;
  if (x > eastLon)
    throw `x too big`;
  if (y < southLat)
    throw `y too small`;
  if (y > northLat)
    throw `y too big`;

  positions.push([y,x]);
}

console.log(positions);
console.log("Done!");
