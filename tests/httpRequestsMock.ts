import { BaseShape, H3PolygonShape } from "../src/shapeTypes";
import { getPolygonFromHexaShapeSyncMock, searchShapesSyncMock } from './shape_montrealCity';
import { getCountPerHexaSyncMock } from "./count_montrealCity";

export interface ResponseIndice { [key: string]: number };
export interface Response {
    h3resolution: number;
    h3indices: ResponseIndice;
}

export const getCountPerHexaSync = (endpoint: string, h3resolution: number, h3indices: [String]) : Response => {
    var results = getCountPerHexaSyncMock(endpoint, h3resolution, h3indices);
    return results;
}

export const searchShapesSync = (endpoint: string, status: string, h3indices: string[]) : BaseShape[] => {
    var shapes = searchShapesSyncMock(endpoint, status, h3indices) as BaseShape[];
    return shapes;
}

export const getPolygonFromHexaShapeSync = (endpoint: string, shapeIds: string[]) : H3PolygonShape[] => {
    var response = getPolygonFromHexaShapeSyncMock(endpoint, shapeIds) as H3PolygonShape[];
    return response;
}
