import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// הגדרת קואורדינטות למסלול
const droneRoute = [
    [32.0853, 34.7818], // נקודת המראה
    [32.0900, 34.7900], // נקודת ביניים
    [32.0950, 34.7950]  // נקודת נחיתה
];

const MapComponent = () => {
    return (
        <MapContainer center={[32.0853, 34.7818]} zoom={13} style={{ height: '600px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Polyline positions={droneRoute} color="blue" />
        </MapContainer>
    );
};

export default MapComponent;
