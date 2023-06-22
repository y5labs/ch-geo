import express from 'express'
import compression from 'compression'
import cors from 'cors'

import chdb from './chdb.js'
import import_assets from './assets.js'

// TODO: Remove these deps when finished testing
import { VectorTile } from '@mapbox/vector-tile'
import pbf from 'pbf'

import {
  lnglat2google,
  lnglat2googlefrac,
  quadkey2quadint,
  quadint2quadkey,
  lnglat2quadint,
  google2quadint,
  zoom2quadint,
  zoom2quadint_inv,
  google2quadintrange,
  quadint2googlefrac,
  lng2frac,
  lat2frac,
  lnglat2tilespace,
  generate_tile
} from './proj.js'

// https://labs.mapbox.com/what-the-tile/

// TODO: Testing vector tile generation
const tile = generate_tile([1, 0, 0], [
  {
    name: 'test',
    extent: 4096,
    features: [
      {
        id: 1,
        type: 1,
        properties: {
          custom1: true,
          custom2: 1,
          custom3: 'true'
        },
        geometry: [
          [
            [-45, 66.5]
          ]
        ]
      }
    ]
  }
])

const tile_res = new VectorTile(new pbf(tile))
console.log(tile_res.layers.test.feature(0).toGeoJSON(1, 0, 0))

// await import_assets()

const group_depth = 2

const location = [174.99867, -38.52861]
const tile_viewing = lnglat2google(location, 16)

const ch = await chdb()

const quadintrange = google2quadintrange(tile_viewing)
const groupby = zoom2quadint_inv(tile_viewing[2] + group_depth)

// Get everything
console.log((await ch.query(`
  select *
  from asset
  where quadint >= ${quadintrange[0]}
    and quadint <= ${quadintrange[1]}
`).toPromise()))

// Cluster
console.log((await ch.query(`
  select
    bitAnd(quadint, ${groupby}) AS quadint_g,
    count(1) as count,
    max(current_condition_score) as max_condition_score,
    min(current_condition_score) as min_condition_score
  from asset
  where quadint >= ${quadintrange[0]}
    and quadint <= ${quadintrange[1]}
  group by quadint_g
`).toPromise()))

const qi = lnglat2quadint(location)

console.log('q', qi.toString(2).padStart(64, '0'))
console.log('>', quadintrange[0].toString(2).padStart(64, '0'))
console.log('<', quadintrange[1].toString(2).padStart(64, '0'))
console.log('g', groupby.toString(2).padStart(64, '0'))
console.log('f', qi >= quadintrange[0] && qi <= quadintrange[1])

console.log('0', lnglat2google(location, 0))
console.log('1', lnglat2google(location, 1))
console.log('2', lnglat2google(location, 2))
console.log('3', lnglat2google(location, 3))

console.log('0', quadint2googlefrac(qi, 0))
console.log('1', quadint2googlefrac(qi, 1))
console.log('2', quadint2googlefrac(qi, 2))
console.log('3', quadint2googlefrac(qi, 3))

console.log('0', lnglat2googlefrac(location, 0))
console.log('1', lnglat2googlefrac(location, 1))
console.log('2', lnglat2googlefrac(location, 2))
console.log('3', lnglat2googlefrac(location, 3))

const app = express()
app.options('*', cors({ origin: true }))
app.use(cors({ origin: true }))
app.use(compression())
app.enable('trust proxy')

app.get('/data/:z/:x/:y.mvt', async (req, res) => {
  const { x, y, z } = req.params
  const zxy = [x, y, z].map(Number)
  const feature_collection = {
    type: 'FeatureCollection',
    features: []
  }
  const tile_res = fromGeojsonVt(
    { geojsonLayer: tovt(feature_collection).getTile(...zxy) },
    { version: 2 })
  res
    .setHeader(
      'Content-Type',
      'application/x-protobuf'
    )
    .status(200).send(tile_res)
})

const port = process.env.EXPRESS_PORT ?? 8080
app.listen(port, () => {
  console.log(`Listening on ${port}...`)
})
