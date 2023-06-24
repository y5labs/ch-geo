import 'maplibre-gl/dist/maplibre-gl.css'
import { useState, useEffect } from 'react'
import {
  Map,
  NavigationControl,
  Popup,
  FullscreenControl,
  ScaleControl,
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

const AssetCity = props => <Layer {...{
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

const styles = [
  {
    mapProps: { terrain: null },
    mapStyle: linz_topographic
  },
  {
    mapProps: { terrain: null },
    mapStyle: linz_aerial
  },
  {
    mapProps: {
      maxPitch: 85,
      terrain: {
        source: 'dem',
        exaggeration: 1
      }
    },
    mapStyle: linz_aerial,
    mapContent: () => <Source
      id='dem'
      type='raster-dem'
      url='https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=mra0eq3zFMRQ8yFgwd1D'
      tileSize={512}
      maxzoom={14}
    />
  },
  // TODO: This renders very slow
  // {
  //   mapProps: {
  //     maxPitch: 85,
  //     terrain: {
  //       source: 'dem',
  //       exaggeration: 1
  //     }
  //   },
  //   mapStyle: linz_topographic,
  //   mapContent: () => <Source
  //     id='dem'
  //     type='raster-dem'
  //     url='https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=mra0eq3zFMRQ8yFgwd1D'
  //     tileSize={512}
  //     maxzoom={14}
  //   />
  // }
]

const MapView = () => {
  const [popupDetails, setPopupDetails] = useState()
  const [oneTime, setOneTime] = useState(true)
  const [styleIndex, setStyleIndex] = useState(0)
  const [filters, setFilters] = useState({})
  const { map } = useMap()

  const [viewState, setViewState] = useState({
    latitude: -38.580959820516135,
    longitude: 175.23990528218496,
    zoom: 9.640285348003506,
    bearing: 0,
    pitch: 0 // 38.50000000000001
  })

  const MapContent = styles[styleIndex].mapContent

  useEffect(() => {
    if (!map) return
    const load = async () => {
      const bbox_req = await fetch(`http://localhost:8080/bbox?${new URLSearchParams(filters).toString()}`)
      const bbox = await bbox_req.json()
      const options = { padding: 40 }
      if (oneTime) options.duration = 0
      map.fitBounds(bbox.lnglat, options)
      setOneTime(false)
    }
    load()
  }, [oneTime, map, filters])

  useEffect(() => {
    setTimeout(() => {
      setFilters(f => ({ ...f, location_id: 3313 }))
    }, 2000)
  }, [])

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
      const { id, name, description, current_condition_score } = feature.properties
      setPopupDetails({
        id,
        coord,
        name,
        current_condition_score,
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
    mapStyle={styles[styleIndex].mapStyle}
    {...styles[styleIndex].mapProps ?? {}}
  >
    {MapContent && <MapContent />}
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
    <NavigationControl
      showCompass={true}
      showZoom={false}
    />
    <FullscreenControl />
    <ScaleControl
      position='bottom-right'
    />
    <Source
      id='assets'
      type='vector'
      format='pbf'
      tiles={[`http://localhost:8080/tiles/{z}/{x}/{y}.pbf?${new URLSearchParams(filters).toString()}`]}
    />
    <div
      style={{
        pointerEvents: 'all',
        zIndex: 2,
        position: 'absolute',
        top: 90,
        right: 10
      }}
    >
      <div className='maplibregl-ctrl maplibregl-ctrl-group' style={{ width: '29px' }}><button onClick={e => {
        setStyleIndex((styleIndex + 1) % styles.length)
      }} className='maplibregl-ctrl-terrain' type='button' aria-label='Toggle basemap' title='Toggle basemap'><span className='maplibregl-ctrl-icon' aria-hidden='true'></span></button></div>
    </div>
    <Assets />
    <AssetCity />
  </Map>
}

export default () => <MapProvider><MapView /></MapProvider>
