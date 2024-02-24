import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const region = import.meta.env.VITE_REGION;
const mapApiKey = import.meta.env.VITE_MAP_API_KEY;
const mapName = import.meta.env.VITE_MAP_NAME;

const map = new maplibregl.Map({
    container: 'map',
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${mapApiKey}`,
    center: [139.767, 35.681],
    zoom: 11,
});

map.addControl(
    new maplibregl.NavigationControl({
        visualizePitch: true,
    })
);
