import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";
import { routeToFeatureCollection } from '@aws/amazon-location-utilities-datatypes';
import { withAPIKey } from '@aws/amazon-location-utilities-auth-helper';

const region = import.meta.env.VITE_REGION;
const mapApiKey = import.meta.env.VITE_MAP_API_KEY;
const mapName = import.meta.env.VITE_MAP_NAME;
const routeApiKey = import.meta.env.VITE_ROUTE_API_KEY;
const routeName = import.meta.env.VITE_ROUTE_NAME;

async function initialize() {
    const authHelper = await withAPIKey(routeApiKey);
    const client = new LocationClient({
        region: region,
        ...authHelper.getLocationClientConfig()
    });

    const input = {
        CalculatorName: routeName,
        DeparturePosition: [139.7558, 35.6767],
        DestinationPosition: [139.8160, 35.6830],
        IncludeLegGeometry: true,
    };
    const command = new CalculateRouteCommand(input);

    const response = await client.send(command);
    const featureCollection = routeToFeatureCollection(response, {
        flattenProperties: true
    });

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

    map.on('load', function () {
        map.addSource("route-result", {
            type: "geojson",
            data: featureCollection
        });
        map.addLayer({
            'id': "route-result",
            'type': 'line',
            'source': 'route-result',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#FF0000',
                'line-width': 10,
                'line-opacity': 0.5
            }
        });
        map.on('click', 'route-result', (e) => {
            const coordinates = e.lngLat;
            const description = `${e.features?.[0]?.properties['Distance'] ?? ''}km`;
            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });
        map.on('mouseenter', 'route-result', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'route-result', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}
initialize();