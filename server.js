import express from 'express'
import compression from 'compression'
import cors from 'cors'
import vtpbf from 'vt-pbf'
import { PassThrough } from 'stream'
import chdb from './chdb.js'
import {
  zoom2quadint_inv,
  google2quadintrange,
  quadint2googlefrac,
  googlefrac2vecxy,
  vecxy2obj,
  generatevectortile
} from './proj.js'

// import import_assets from './assets.js'
const ch = await chdb()
// await import_assets(ch)

const extent = 4096
const group_depth = 3 // e.g. cluster 16 in a tile 2 ^ group_depth ^ 2
const depth_offset = extent / Math.pow(2, group_depth) / 2

const get_tile_data = async viewing => {
  const quadintrange = google2quadintrange(viewing)
  const groupby = zoom2quadint_inv(viewing[2] + group_depth)
  const quadint2vecxy = qi =>
    googlefrac2vecxy(quadint2googlefrac(qi, viewing[2]), viewing, extent)

  const asset_groups = await ch.query(`
    select
      bitAnd(quadint, ${groupby}) AS quadint_g,
      max(current_condition_score) as max_condition_score,
      avg(current_condition_score) as avg_condition_score,
      min(current_condition_score) as min_condition_score,
      count() as count,
      countIf(current_condition_score <= 0) as count_0,
      countIf(current_condition_score > 0 and current_condition_score <= 25) as count_25,
      countIf(current_condition_score > 25 and current_condition_score <= 50) as count_50,
      countIf(current_condition_score > 50 and current_condition_score <= 75) as count_75,
      countIf(current_condition_score > 75) as count_100
    from asset
    where quadint >= ${quadintrange[0]}
      and quadint <= ${quadintrange[1]}
    group by quadint_g
    `).toPromise()
  let total = asset_groups.reduce((acc, g) => acc + g.count, 0)
  if (total > 10000) {
    for (const g of asset_groups)
      g.xy = quadint2vecxy(g.quadint_g).map(v => v + depth_offset)
    return { asset_groups, assets: [] }
  }

  const assets = await ch.query(`
    select *
    from asset
    where quadint >= ${quadintrange[0]}
      and quadint <= ${quadintrange[1]}
  `).toPromise()
  for (const a of assets)
    a.xy = quadint2vecxy(a.quadint)
  return { asset_groups: [], assets }
}

const app = express()
app.options('*', cors({ origin: true }))
app.use(cors({ origin: true }))
app.use(compression())
app.enable('trust proxy')

app.get('/tiles/:z/:x/:y.json', async (req, res) => {
  const { x, y, z } = req.params
  res.send(await get_tile_data([x, y, z].map(Number)))
})

app.get('/tiles/:z/:x/:y.pbf', async (req, res) => {
  const { x, y, z } = req.params
  const { asset_groups, assets } = await get_tile_data([x, y, z].map(Number))
  const tile = generatevectortile([
    {
      name: 'asset_groups',
      extent,
      features: asset_groups.map(g => ({
        type: 1,
        properties: {
          max_condition_score: g.max_condition_score,
          min_condition_score: g.min_condition_score,
          count: g.count,
          count_0: g.count_0 != 0 ? g.count_0 : null,
          count_25: g.count_25 != 0 ? g.count_25 : null,
          count_50: g.count_50 != 0 ? g.count_50 : null,
          count_75: g.count_75 != 0 ? g.count_75 : null,
          count_100: g.count_100 != 0 ? g.count_100 : null
        },
        geometry: [[vecxy2obj(g.xy)]]
      }))
    },
    {
      name: 'assets',
      extent,
      features: assets.map(a => ({
        type: 1,
        properties: {
          id: a.id,
          name: a.name,
          description: a.description,
          current_condition_score: a.current_condition_score
        },
        geometry: [[vecxy2obj(a.xy)]]
      }))
    }
  ])
  const tile_data = vtpbf(tile)
  const rs = new PassThrough()
  rs.end(tile_data)
  res.setHeader('Content-Type', 'application/x-protobuf')
  rs.pipe(res)
})

const port = process.env.EXPRESS_PORT ?? 8080
app.listen(port, () => {
  console.log(`Listening on ${port}...`)
})
