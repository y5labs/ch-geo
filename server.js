import { ClickHouse } from 'clickhouse'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import fs from 'fs/promises'
import papa from 'papaparse'
import gm from 'global-mercator'

const quadkey2quadint = quadkey => {
  let res = '0b'
  for (let i = 0; i < 32; i++) {
    if (i >= quadkey.length) {
      res += '00'
      continue
    }
    const quat = quadkey.charAt(i)
    if (quat == '0') res += '00'
    else if (quat == '1') res += '01'
    else if (quat == '2') res += '10'
    else if (quat == '3') res += '11'
  }
  return BigInt(res)
}

const zoom2quadint = zoom => {
  let res = '0b'
  for (let i = 0; i < 32; i++) {
    if (i > zoom - 1) {
      res += '11'
      continue
    }
    res += '00'
  }
  return BigInt(res)
}

const lnglat2quadint = lnglat => {
  const tile = gm.lngLatToGoogle(location, 32)
  const quadkey = gm.googleToQuadkey(tile)
  const quadint = quadkey2quadint(quadkey)
  return quadint
}

const google2quadint = tile => {
  const quadkey = gm.googleToQuadkey(tile)
  const quadint = quadkey2quadint(quadkey)
  return quadint
}

const location = [174.99867, -38.52861]
const tile_viewing = [4136034, 2584284, 22]

const quadint = lnglat2quadint(location)

// tile_viewing[0] += 1
const quadint_low = google2quadint(tile_viewing)
const quadint_zoom = zoom2quadint(tile_viewing[2])
const quadint_high = quadint_low + quadint_zoom

console.log({
  location,
  tile_viewing,
  quadint,
  quadint_zoom,
  quadint_low,
  quadint_high
})
console.log(quadint.toString(2).padStart(64, '0'))
console.log(quadint_zoom.toString(2).padStart(64, '0'))
console.log(quadint_low.toString(2).padStart(64, '0'))
console.log(quadint_high.toString(2).padStart(64, '0'))
console.log(quadint >= quadint_low && quadint < quadint_high)

// https://www.npmjs.com/package/@high-u/quadkeytools
// https://labs.mapbox.com/what-the-tile/

// import vtpbf from 'vt-pbf'
// import { VectorTile } from '@mapbox/vector-tile'
// import pbf from 'pbf'
// // import { cellToBoundary, cellToLatLng } from 'h3-js'

// const p_x = x => x / 360 + 0.5

// const p_y = y => {
//   const sin = Math.sin(y * Math.PI / 180)
//   const y2 = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI
//   return y2 < 0 ? 0 : y2 > 1 ? 1 : y2
// }

// const to_tile_space = ([z, x, y], extent, coord) => {
//   const z2 = 1 << z
//   return {
//     x: Math.round(extent * (p_x(coord[0]) * z2 - x)),
//     y: Math.round(extent * (p_y(coord[1]) * z2 - y))
//   }
// }

// // TODO: This could take GeoJSON as input
// const generate_tile = (tile_coord, layers) => vtpbf({
//   layers: Object.fromEntries(
//     layers.map(layer => [layer.name, {
//       ...layer,
//       version: 2,
//       length: layer.features.length,
//       feature: i => {
//         const feature = layer.features[i]
//         return {
//           ...feature,
//           loadGeometry: () =>
//             feature.geometry.map(ring =>
//               ring.map(coord =>
//                 to_tile_space(tile_coord, layer.extent, coord)))
//         }
//       }
//     }])
//   )
// })

// const tile = generate_tile([0, 1, 0], [
//   {
//     name: 'test',
//     extent: 4096,
//     features: [
//       {
//         id: 1,
//         type: 1,
//         properties: {
//           custom1: true,
//           custom2: 1,
//           custom3: 'true'
//         },
//         geometry: [
//           [
//             [-45, 66.5]
//           ]
//         ]
//       }
//     ]
//   }
// ])

// const tile_res = new VectorTile(new pbf(tile))
// console.log(tile_res.layers.test.feature(0).toGeoJSON(1, 0, 0))

// const ch = new ClickHouse({
//   url: '127.0.0.1',
//   port: '8123',
//   format: 'json',
//   config: {
//     enable_http_compression: 1,
//     database: 'default'
//   }
// })

// const ch_migration = `
//   create table if not exists asset (
//     id String,
//     name Nullable(String),
//     description Nullable(String),
//     site Nullable(String),
//     class_id Nullable(UInt32),
//     location_id Nullable(UInt32),
//     category_id Nullable(UInt32),
//     manufacturer_id Nullable(UInt32),
//     assetstatus_id Nullable(UInt32),
//     owner_id Nullable(UInt32),
//     current_condition_score Nullable(UInt8),
//     location_x Nullable(Float32),
//     location_y Nullable(Float32),

//     quadkey UInt64,

//     index asset_class_id_idx (class_id)
//       type bloom_filter granularity 3,
//     index asset_location_id_idx (location_id)
//       type bloom_filter granularity 3,
//     index asset_category_id_idx (category_id)
//       type bloom_filter granularity 3,
//     index asset_manufacturer_id_idx (manufacturer_id)
//       type bloom_filter granularity 3,
//     index asset_assetstatus_id_idx (assetstatus_id)
//       type bloom_filter granularity 3,
//     index asset_owner_id_idx (owner_id)
//       type bloom_filter granularity 3,
//     index asset_quadkey_idx (quadkey)
//       type minmax
//   )
//   engine = ReplacingMergeTree
//   primary key (id);
// `
// const queries = ch_migration.split(';').map(s => s.trim()).filter(s => s != '')
// for (const q of queries) await ch.query(q).toPromise()

// const assets = papa.parse(await fs.readFile('./assets.csv', 'utf8'), { header: true }).data

// const insert_assets = chdb
//   .insert('insert into asset (id, name, description, site, class_id, location_id, category_id, manufacturer_id, assetstatus_id, owner_id, current_condition_score, location_x, location_y, quadkey)')
//   .stream()

// for (const a of assets) {
//   await insert_assets.writeRow([
//     a.id,
//     a.name,
//     a.description,
//     a.site,
//     parseInt(a.class_id),
//     parseInt(a.location_id),
//     parseInt(a.category_id),
//     parseInt(a.manufacturer_id),
//     parseInt(a.assetstatus_id),
//     parseInt(a.owner_id),
//     parseInt(a.current_condition_score),
//     parseFloat(a.location_x),
//     parseFloat(a.location_y),
//     parseInt(a.quadkey)
//   ])
// }

// await insert_assets.exec()

// ch.query('optimize table asset final').toPromise()

// const app = express()
// app.options('*', cors({ origin: true }))
// app.use(cors({ origin: true }))
// app.use(compression())
// app.enable('trust proxy')

// app.get('/data/:z/:x/:y.h3t', async (req, res) => {
//   const { z, x, y } = req.params
//   const zxy = [z, x, y].map(Number)
//   const feature_collection = {
//     type: 'FeatureCollection',
//     features: []
//   }
//   const tile_res = fromGeojsonVt(
//     { geojsonLayer: tovt(feature_collection).getTile(...zxy) },
//     { version: 2 })
//   res
//     .setHeader(
//       'Content-Type',
//       'application/x-protobuf'
//     )
//     .status(200).send(tile_res)
// })

// const port = process.env.EXPRESS_PORT ?? 8080
// app.listen(port, () => {
//   console.log(`Listening on ${port}...`)
// })