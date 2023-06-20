import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import { Map, NavigationControl } from 'react-map-gl'
import maplibregl from 'maplibre-gl'
import linz_aerial from './linz_aerial.json'
import linz_topographic from './linz_topographic.json'

import tovt from 'geojson-vt'
import { fromGeojsonVt } from 'vt-pbf'
import { cellToBoundary, cellToLatLng } from 'h3-js'

const h3t_protocol = async (params, cb) => {
  const s = params.url.split(/\/|\./i)
  // TODO: improve this?
  const zxy = s.slice(s.length - 4, s.length - 1).map(parseInt)
  const controller = new AbortController()
  const signal = controller.signal
  setTimeout(() => controller.abort(), 5000)
  try {
    const h3t_res = await fetch(params.url, { signal })
    if (!h3t_res.ok) throw new Error(h3t_res.statusText)
    const content = await h3t_res.json()
    const feature_collection = {
      type: 'FeatureCollection',
      features: content.cells.map(properties => ({
        properties,
        geometry: {
          type: 'Point',
          coordinates: cellToLatLng(j.h3id).reverse()
          // type: 'Polygon',
          // coordinates: [cellToBoundary(j.h3id, true)]
        }
      }))
    }
    const tile_res = fromGeojsonVt(
      { h3tlayer: tovt(feature_collection).getTile(...zxy) },
      { version: 2 })
    cb(null, tile_res, null, null)
  }
  catch (e) {
    if (e.name == 'AbortError') e.message = `Timeout: Tile .../${zxy.join('/')}.h3t is taking too long to fetch`
    cb(new Error(e))
  }
}

maplibregl.addProtocol('h3t', async (params, cb) =>
  h3t_protocol({ ...params, url: `http://${params.url.split('://')[1]}` }, cb))

maplibregl.addProtocol('h3ts', async (params, cb) =>
  h3t_protocol({ ...params, url: `https://${params.url.split('://')[1]}` }, cb))

export default () => {
  const [viewState, setViewState] = useState({
    latitude: -37.7728,
    longitude: 175.2874,
    zoom: 12,
    bearing: 0.8,
    pitch: 60
  })

  return <Map
    {...viewState}
    mapLib={maplibregl}
    onMove={e => {
      console.log(e.viewState)
      setViewState(e.viewState)
    }}
    mapStyle={linz_topographic}
  >
    <NavigationControl />
  </Map>
}

// map.addSource('test-source', {
//   tiles: ['h3tiles://cryptic-temple-41553.herokuapp.com/{z}/{x}/{y}.h3t'],
//   // minzoom: 14,
//   // maxzoom: 14,
//   type: 'vector',
//   format: 'pbf',
//   promoteId: 'h3id'
// })

// map.addLayer({
//   "id": 'test-layer',
//   "type": 'fill',
//   "source": 'test-source',
//   "source-layer": 'test-layer',
//   "paint": {
//     "fill-color": {
//       "property": 'value',
//       "stops": [
//         [1,"#fdc7b7"],
//         [2,"#fe9699"],
//         [3,"#f16580"],
//         [4,"#d9316c"],
//         [5,"#a71f65"],
//         [6,"#760e5d"],
//         [7,"#430254"]
//       ]
//       },
//     "fill-opacity": 0.25,
//   }
// });

// map.addSource('mapillary', {
//   type: 'vector',
//   tiles: ['https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}'],
//   minzoom: 6,
//   maxzoom: 14
// })

// map.addLayer(
//   {
//     id: 'mapillary',
//     type: 'line',
//     source: 'mapillary',
//     'source-layer': 'sequence',
//     layout: {
//       'line-cap': 'round',
//       'line-join': 'round'
//     },
//     paint: {
//       'line-opacity': 0.6,
//       'line-color': 'rgb(53, 175, 109)',
//       'line-width': 2
//     }
//   },
//   'water_name_line'
// )
