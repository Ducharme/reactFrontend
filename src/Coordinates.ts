import * as data from './data';

export const getResolution = (zoom: number) : number => {

  if (zoom <= 3.0)
    return 0;
  if (zoom <= 4.4) // 1.1
    return 1;
  if (zoom <= 5.7) // 1.3
    return 2;
  if (zoom <= 7.1) // 1.4
    return 3;
  if (zoom <= 8.4) // 1.3
    return 4;
  if (zoom <= 9.8) // 1.4
    return 5;
  if (zoom <= 11.4) // 1.6
    return 6;
  if (zoom <= 12.7) // 1.3
    return 7;
  if (zoom <= 14.1) // 1.4
    return 8;
  if (zoom <= 15.5) // 1.4
    return 9;
  if (zoom <= 16.8) // 1.3
    return 10;
  if (zoom <= 18.2) // 1.6
    return 11;
  if (zoom <= 19.5) // 1.3
    return 12;
  if (zoom <= 21.1) // 1.6
    return 13;
  if (zoom <= 21.9) // 0.8
    return 14;
  return 15;
}

export const loadingValue: number = 1000;

export interface Coordinates {
  ctrlng: number;
  ctrlat: number;
  zoom: number;
  h3res: number;

  nwlng: number;
  nwlat: number;

  selng: number;
  selat: number;
}

export const initialCoordinates: Coordinates = {
  ctrlng: data.initialCenter[0],
  ctrlat: data.initialCenter[1],
  zoom: data.initialZoom,
  h3res: getResolution(data.initialZoom),

  nwlng: loadingValue,
  nwlat: loadingValue,
  selng: loadingValue,
  selat: loadingValue
};