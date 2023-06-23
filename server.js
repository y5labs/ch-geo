import express from 'express'
import compression from 'compression'
import cors from 'cors'

import fs from 'fs/promises'

import chdb from './chdb.js'
import import_assets from './assets.js'

// TODO: Remove these deps when finished testing
import { VectorTile } from '@mapbox/vector-tile'
import pbf from 'pbf'
import vtpbf from 'vt-pbf'

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
  generate_tile,
  googlefrac2vecxy,
  vecxy2obj
} from './proj.js'

// https://labs.mapbox.com/what-the-tile/

const extent = 4096
const group_depth = 2 // e.g. cluster 16 in a tile 2 ^ group_depth ^ 2
const depth_offset = extent / Math.pow(2, group_depth) / 2

const viewing = [7, 4, 3]
// TODO: Testing vector tile generation
const tile = vtpbf(generate_tile(viewing, [
  {
    name: 'test',
    extent,
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
            vecxy2obj(googlefrac2vecxy(lnglat2googlefrac([160, -10], viewing[2]), viewing, extent))
          ]
        ]
      }
    ]
  }
]))

const tile_res1 = new VectorTile(new pbf(await fs.readFile('test.pbf')))
console.log(tile_res1.layers)

const tile_res2 = new VectorTile(new pbf(tile))
console.log(tile_res2.layers)
console.log(tile_res2.layers.test.feature(0).loadGeometry())
console.log(tile_res2.layers.test.feature(0).toGeoJSON(...viewing))
console.log(lnglat2googlefrac([160, -10], viewing[2]))
console.log(googlefrac2vecxy(lnglat2googlefrac([160, -10], viewing[2]), viewing, extent))

// await import_assets()

const ch = await chdb()

const get_tile = async viewing => {
  const quadintrange = google2quadintrange(viewing)
  const groupby = zoom2quadint_inv(viewing[2] + group_depth)

  // Cluster
  const groups = await ch.query(`
    select
      bitAnd(quadint, ${groupby}) AS quadint_g,
      count(1) as count,
      max(current_condition_score) as max_condition_score,
      min(current_condition_score) as min_condition_score
    from asset
    where quadint >= ${quadintrange[0]}
      and quadint <= ${quadintrange[1]}
    group by quadint_g
    `).toPromise()
  let total = groups.reduce((acc, g) => acc + g.count, 0)
  if (total > 100) {
    for (const g of groups)
      g.xy = googlefrac2vecxy(quadint2googlefrac(g.quadint_g, viewing[2]), viewing, extent).map(v => v + depth_offset)
    return { groups, assets: [] }
  }

  // Get all assets in a location
  const assets = await ch.query(`
    select *
    from asset
    where quadint >= ${quadintrange[0]}
      and quadint <= ${quadintrange[1]}
  `).toPromise()
  for (const a of assets)
    a.xy = googlefrac2vecxy(quadint2googlefrac(a.quadint, viewing[2]), viewing, extent)
  return { groups: [], assets }
}

// const data = await get_tile(lnglat2google([174.99867, -38.52861], 15)) // Would normally be x, y, z from url
// console.log(lnglat2google([174.99867, -38.52861], 15))
// console.log(lnglat2google([174.99867, -38.52861], 14))
// console.log(lnglat2google([174.99867, -38.52861], 13))
// console.log(lnglat2google([174.99867, -38.52861], 12))
// console.log(lnglat2google([174.99867, -38.52861], 11))

const app = express()
app.options('*', cors({ origin: true }))
app.use(cors({ origin: true }))
app.use(compression())
app.enable('trust proxy')

app.get('/data/:z/:x/:y.json', async (req, res) => {
  const { x, y, z } = req.params
  res.send(await get_tile([x, y, z].map(Number)))
})

app.get('/data/:z/:x/:y.pbf', async (req, res) => {
  const { x, y, z } = req.params
  res.send(await get_tile([x, y, z].map(Number)))
})

const port = process.env.EXPRESS_PORT ?? 8080
app.listen(port, () => {
  console.log(`Listening on ${port}...`)
})
