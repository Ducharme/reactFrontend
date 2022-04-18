import { FC } from 'react';
import { Coordinates, loadingValue } from '../Coordinates';

function getValue(val: number, fixed: number) {
    if (val === undefined || val === loadingValue)
        return "N/A";
    return val.toFixed(fixed);
}

export const SideBar:FC<Coordinates> = (coordinates: Coordinates) => {

    return (
        <div className="sidebar">
            Zoom: {getValue(coordinates.zoom, 2)} | H3Resolution: {getValue(coordinates.h3res, 0)}
            <br />
            CTR Lng: {getValue(coordinates.ctrlng, 4)} | Lat: {getValue(coordinates.ctrlat, 4)}
            <br />
            N-W Lng: {getValue(coordinates.nwlng, 4)} | Lat: {getValue(coordinates.nwlat, 4)}
            <br />
            S-E Lng: {getValue(coordinates.selng, 4)} | Lat: {getValue(coordinates.selat, 4)}
        </div>
    )
}