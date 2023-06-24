import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import {
  Map,
  NavigationControl,
  Popup,
  FullscreenControl,
  Source,
  Layer,
  MapProvider,
  useMap
} from 'react-map-gl'
import maplibregl from 'maplibre-gl'
import linz_aerial from './linz_aerial.json'
import linz_topographic from './linz_topographic.json'

const score_colours = [
  '#000000',
  '#FF2600',
  '#FF8C00',
  '#FFDA00',
  '#95C500'
]

const AssetGroupCounts = props => <Layer {...{
  id: 'asset_groups_count',
  source: 'assets',
  'source-layer': 'asset_groups',
  type: 'symbol',
  layout: {
    'text-field': '{count}',
    'text-font': ['Open Sans Bold'],
    'text-size': 12
  },
  paint: {
    'text-color': '#FFFFFF',
    'text-halo-color': '#333333',
    'text-halo-width': 2
  },
  ...props
}} />

// // Create a popup, but don't add it to the map yet.
// var popup = new maplibregl.Popup({
//   closeButton: false,
//   closeOnClick: false
// });

// map.on('mouseenter', 'places', function (e) {
//   // Change the cursor style as a UI indicator.
//   map.getCanvas().style.cursor = 'pointer';

//   const coordinates = e.features[0].geometry.coordinates.slice()
//   const name = e.features[0].properties.name
//   const description = e.features[0].properties.description

//   // Ensure that if the map is zoomed out such that multiple
//   // copies of the feature are visible, the popup appears
//   // over the copy being pointed to.
//   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//   }

//   // Populate the popup and set its coordinates
//   // based on the feature found.
//   popup.setLngLat(coordinates).setHTML(description).addTo(map);
// });

// map.on('mouseleave', 'places', function () {
//   map.getCanvas().style.cursor = '';
//   popup.remove();
// });

const Assets = props => <Layer {...{
  id: 'assets',
  source: 'assets',
  'source-layer': 'assets',
  type: 'circle',
  paint: {
    'circle-pitch-alignment': 'map',
    'circle-radius': 3,
    'circle-color': {
      'property': 'current_condition_score',
      'stops': [
        [0, score_colours[0]],
        [1, score_colours[1]],
        [25, score_colours[2]],
        [50, score_colours[3]],
        [75, score_colours[4]]
      ]
    },
    'circle-stroke-color': '#000000',
    'circle-stroke-opacity': 0.5,
    'circle-stroke-width': 1
  }
}} />

const AssetGroupConditionCounts = props => <>
  <TextLayer
    {...{
      id: 'asset_groups_count_0',
      source: 'assets',
      'source-layer': 'asset_groups'
    }}
    layout={{ 'text-field': '{count_0}' }}
    paint={{
      'text-translate': [-4, 20],
      'text-translate-anchor': 'viewport'
    }}
  />
  <CircleLayer
    {...{
      id: 'asset_groups_count_0_circle',
      source: 'assets',
      'source-layer': 'asset_groups',
      filter: ['has', 'count_0']
    }}
    paint={{
      'circle-translate': [4, 20],
      'circle-color': score_colours[0]
    }}
  />
  <TextLayer
    {...{
      id: 'asset_groups_count_25',
      source: 'assets',
      'source-layer': 'asset_groups'
    }}
    layout={{ 'text-field': '{count_25}' }}
    paint={{
      'text-translate': [-4, 10],
      'text-translate-anchor': 'viewport'
    }}
  />
  <CircleLayer
    {...{
      id: 'asset_groups_count_25_circle',
      source: 'assets',
      'source-layer': 'asset_groups',
      filter: ['has', 'count_25']
    }}
    paint={{
      'circle-translate': [4, 10],
      'circle-color': score_colours[1]
    }}
  />
  <TextLayer
    {...{
      id: 'asset_groups_count_50',
      source: 'assets',
      'source-layer': 'asset_groups'
    }}
    layout={{ 'text-field': '{count_50}' }}
    paint={{
      'text-translate': [-4, 0],
      'text-translate-anchor': 'viewport'
    }}
  />
  <CircleLayer
    {...{
      id: 'asset_groups_count_50_circle',
      source: 'assets',
      'source-layer': 'asset_groups',
      filter: ['has', 'count_50']
    }}
    paint={{
      'circle-translate': [4, 0],
      'circle-color': score_colours[2]
    }}
  />
  <TextLayer
    {...{
      id: 'asset_groups_count_75',
      source: 'assets',
      'source-layer': 'asset_groups'
    }}
    layout={{ 'text-field': '{count_75}' }}
    paint={{
      'text-translate': [-4, -10],
      'text-translate-anchor': 'viewport'
    }}
  />
  <CircleLayer
    {...{
      id: 'asset_groups_count_75_circle',
      source: 'assets',
      'source-layer': 'asset_groups',
      filter: ['has', 'count_75']
    }}
    paint={{
      'circle-translate': [4, -10],
      'circle-color': score_colours[3]
    }}
  />
  <TextLayer
    {...{
      id: 'asset_groups_count_100',
      source: 'assets',
      'source-layer': 'asset_groups'
    }}
    layout={{ 'text-field': '{count_100}' }}
    paint={{
      'text-translate': [-4, -20],
      'text-translate-anchor': 'viewport'
    }}
  />
  <CircleLayer
    {...{
      id: 'asset_groups_count_100_circle',
      source: 'assets',
      'source-layer': 'asset_groups',
      filter: ['has', 'count_100']
    }}
    paint={{
      'circle-translate': [4, -20],
      'circle-color': score_colours[4]
    }}
  />
</>

const AssetGroupHeatmap1 = props => <Layer {...{
  id: 'asset_groups_heatmap',
  source: 'assets',
  'source-layer': 'asset_heatmap',
  type: 'fill',
  paint: {
    'fill-color': {
      'property': 'avg_condition_score',
      'stops': [
        [0, score_colours[0]],
        [1, score_colours[1]],
        [25, score_colours[2]],
        [50, score_colours[3]],
        [75, score_colours[4]]
      ]
    }
  },
  ...props
}} />

const AssetGroupHeatmap2 = props => <Layer {...{
  id: 'asset_groups_heatmap',
  source: 'assets',
  'source-layer': 'asset_groups',
  type: 'circle',
  paint: {
    'circle-pitch-alignment': 'map',
    'circle-translate-anchor': 'map',
    'circle-pitch-scale': 'map',
    'circle-radius': 3,
    'circle-stroke-color': '#000000',
    'circle-stroke-width': 1,
    'circle-color': {
      'property': 'condition_score',
      'stops': [
        [0, score_colours[0]],
        [1, score_colours[1]],
        [25, score_colours[2]],
        [50, score_colours[3]],
        [75, score_colours[4]]
      ]
    }
  },
  ...props
}} />

const AssetGroupHeatmap3 = props => <Layer {...{
  id: 'asset_groups_heatmap',
  source: 'assets',
  'source-layer': 'asset_heatmap',
  type: 'fill-extrusion',
  paint: {
    'fill-extrusion-color': {
      'property': 'condition_score',
      'stops': [
        [0, score_colours[0]],
        [1, score_colours[1]],
        [25, score_colours[2]],
        [50, score_colours[3]],
        [75, score_colours[4]]
      ]
    },
    'fill-extrusion-height': ['*', ['get', 'count'], 5]
  },
  ...props
}} />

const MapView = () => {
  const [popupDetails, setPopupDetails] = useState()
  const { map } = useMap()

  const [viewState, setViewState] = useState({
    latitude: -38.580959820516135,
    longitude: 175.23990528218496,
    zoom: 9.640285348003506,
    bearing: 0,
    pitch: 38.50000000000001
  })

  return <Map
    id='map'
    {...viewState}
    mapLib={maplibregl}
    onMove={e => {
      // console.log(e.viewState)
      setViewState(e.viewState)
    }}
    onClick={e => {
      const feature = e.features[0]
      if (!feature || feature.layer.id != 'assets') return
      const coord = feature.geometry.coordinates.slice()
      while (Math.abs(e.lngLat.lng - coord[0]) > 180)
        coord[0] += e.lngLat.lng > coord[0] ? 360 : -360
      const { name, description } = feature.properties
      setPopupDetails({
        coord,
        name,
        description,
        href: `https://www.google.com/maps/search/?api=1&query=${coord[1]},${coord[0]}`
      })
    }}
    onMouseEnter={e => {
      map.getCanvas().style.cursor = 'pointer'
    }}
    onMouseLeave={e => {
      map.getCanvas().style.cursor = ''
    }}
    interactiveLayerIds={['assets']}
    // maxPitch={85}
    // mapStyle={linz_aerial}
    mapStyle={linz_topographic}
    // terrain={{
    //   source: 'dem',
    //   exaggeration: 1
    // }}
  >
    {popupDetails && <Popup
      longitude={popupDetails.coord[0]}
      latitude={popupDetails.coord[1]}
      anchor='bottom'
      onClose={() => setPopupDetails()}>
      <div><b>{popupDetails.href
        ? <a href={popupDetails.href} target='_blank'>{popupDetails.name}</a>
        : popupDetails.name
      }</b></div>
      <div>{popupDetails.description}</div>
    </Popup>}
    {/* <NavigationControl /> */}
    <FullscreenControl />
    <Source
      id='assets'
      type='vector'
      format='pbf'
      tiles={['http://localhost:8080/tiles/{z}/{x}/{y}.pbf']}
    />
    {/* <Source
      id='dem'
      type='raster-dem'
      url='https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=mra0eq3zFMRQ8yFgwd1D'
      tileSize={512}
      maxzoom={14}
    /> */}
    <Assets />
    {/* <AssetGroupCounts /> */}
    {/* <AssetGroupConditionCounts /> */}
    {/* <AssetGroupHeatmap1 /> */}
    <AssetGroupHeatmap2 />
    {/* <AssetGroupHeatmap3 /> */}
  </Map>
}

// export default () => <MapProvider>
//   <div style={{
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gridTemplateRows: '1fr',
//     height: '100vh'
//   }}>
//   <div>
//     Hello
//   </div>
//   <MapView />
// </div>
// </MapProvider>

export default () => <MapProvider>
  <MapView />
</MapProvider>

const TextLayer = ({ layout, paint, ...props }) => <Layer {...{
  type: 'symbol',
  layout: {
    'text-ignore-placement': true,
    'text-pitch-alignment': 'map',
    'text-anchor': 'right',
    'text-font': ['Open Sans Bold'],
    'text-size': 11,
    ...layout
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1,
    ...paint
  },
  ...props
}} />

const CircleLayer = ({ layout = {}, paint, ...props }) => <Layer {...{
  type: 'circle',
  layout,
  paint: {
    'circle-pitch-alignment': 'map',
    'circle-translate-anchor': 'viewport',
    'circle-pitch-scale': 'viewport',
    'circle-radius': 3,
    'circle-color': '#ffffff',
    'circle-stroke-color': '#000000',
    'circle-stroke-width': 1,
    ...paint
  },
  ...props
}} />
