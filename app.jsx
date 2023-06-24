import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import { Map, NavigationControl, Source, Layer } from 'react-map-gl'
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

export default () => {
  const [viewState, setViewState] = useState({
    latitude: -38.580959820516135,
    longitude: 175.23990528218496,
    zoom: 9.640285348003506,
    bearing: 0,
    pitch: 38.50000000000001
  })

  return <Map
    {...viewState}
    mapLib={maplibregl}
    onMove={e => {
      // console.log(e.viewState)
      setViewState({ ...e.viewState, pitch: 0 })
    }}
    // mapStyle={linz_aerial}
    mapStyle={linz_topographic}
  >
    <NavigationControl />
    <Source
      id='assets'
      type='vector'
      format='pbf'
      tiles={['http://localhost:8080/tiles/{z}/{x}/{y}.pbf']}
    />
    {/* <Layer {...{
      id: 'asset_groups_min',
      source: 'assets',
      'source-layer': 'asset_groups',
      type: 'circle',
      paint: {
        'circle-pitch-alignment': 'map',
        'circle-translate': [2.5, 2.5],
        'circle-radius': 6,
        'circle-color': {
          'property': 'min_condition_score',
          'stops': [
            [0, score_colours[0]],
            [1, score_colours[1]],
            [25, score_colours[2]],
            [50, score_colours[3]],
            [75, score_colours[4]]
          ]
        },
        'circle-stroke-color': '#333333',
        'circle-stroke-width': 2
      }
    }} />
    <Layer {...{
      id: 'asset_groups_max',
      source: 'assets',
      'source-layer': 'asset_groups',
      type: 'circle',
      paint: {
        'circle-pitch-alignment': 'map',
        'circle-translate': [-2.5, -2.5],
        'circle-radius': 6,
        'circle-color': {
          'property': 'max_condition_score',
          'stops': [
            [0, score_colours[0]],
            [1, score_colours[1]],
            [25, score_colours[2]],
            [50, score_colours[3]],
            [75, score_colours[4]]
          ]
        },
        'circle-stroke-color': '#333333',
        'circle-stroke-width': 2
      }
    }} /> */}
    {/* <Layer {...{
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
      }
    }} /> */}
    <Layer {...{
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
  </Map>
}

const TextLayer = ({ layout, paint, ...props }) => <Layer {...{
  type: 'symbol',
  layout: {
    'text-ignore-placement': true,
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
    'circle-pitch-alignment': 'viewport',
    'circle-translate-anchor': 'viewport',
    'circle-pitch-scale': 'viewport',
    'circle-radius': 4,
    'circle-color': '#ffffff',
    'circle-stroke-color': '#000000',
    'circle-stroke-width': 1,
    ...paint
  },
  ...props
}} />
