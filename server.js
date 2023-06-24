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

const extent = 1024
const group_depth = 6 // e.g. cluster 16 in a tile 2 ^ group_depth ^ 2
const depth_offset = extent / Math.pow(2, group_depth) / 2

const get_tile_data = async viewing => {
  const quadintrange = google2quadintrange(viewing)
  const groupby = zoom2quadint_inv(viewing[2] + group_depth)
  const quadint2vecxy = qi =>
    googlefrac2vecxy(quadint2googlefrac(qi, viewing[2]), viewing, extent)

  if (viewing[2] < 11) {
    const asset_groups = await ch.query(`
      select
        bitAnd(quadint, ${groupby}) AS quadint_g,
        avg(current_condition_score) as condition_score,
        count() as count
      from asset
      where quadint >= ${quadintrange[0]}
        and quadint <= ${quadintrange[1]}
      group by quadint_g
      `).toPromise()
    for (const g of asset_groups)
      g.xy = quadint2vecxy(g.quadint_g)
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
          condition_score: g.condition_score,
          count: g.count
        },
        geometry: [[vecxy2obj(g.xy.map(v => v + depth_offset))]]
      }))
    },
    {
      name: 'asset_heatmap',
      extent,
      features: asset_groups.map(g => {
        const [x, y] = g.xy
        const d = depth_offset * 2
        return {
          type: 3,
          properties: {
            condition_score: g.condition_score,
            count: g.count
          },
          geometry: [[
            { x, y },
            { x: x + d, y },
            { x: x + d, y: y + d },
            { x, y: y + d },
            { x, y }
          ]]
        }
    })
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
