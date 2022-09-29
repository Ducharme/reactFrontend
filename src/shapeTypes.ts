export interface IShape {
  shapeId: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string;
  shapeVersion: string;
  schemaVersion: string;
  polygon: number[][];
  filter: any;
  shape: any;
}

export interface BaseShape {
  shapeId: string,
  name: string,
  status: string,
  type: string
}

export interface H3PolygonShape extends BaseShape {
  h3polygon: number[][]
}

export interface PolygonShape {
  shapeId: string,
  name: string,
  type: string,
  polygon: number[][]
}

export interface HexaShape {
  shapeId: string,
  name: string,
  type: string,
  shape: {[res: string]: string[]}
}



