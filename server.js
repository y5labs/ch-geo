import { ClickHouse } from 'clickhouse'
import express from 'express'
import compression from 'compression'
import cors from 'cors'

// import tovt from 'geojson-vt'
import vtpbf from 'vt-pbf'
import { VectorTile } from '@mapbox/vector-tile'
import pbf from 'pbf'
// import { cellToBoundary, cellToLatLng } from 'h3-js'

const p_x = x => {
  return x / 360 + 0.5;
}

const p_y = y => {
  const sin = Math.sin(y * Math.PI / 180);
  const y2 = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI;
  return y2 < 0 ? 0 : y2 > 1 ? 1 : y2;
}

const to_tile_space = (x, y, z, extent, coord) => {
  const z2 = 1 << z
  return [
    Math.round(extent * (p_x(coord[0]) * z2 - x)),
    Math.round(extent * (p_y(coord[1]) * z2 - y))]
}

console.log(to_tile_space(0, 0, 0, 4096, [-90, 66.5]))

const tile = vtpbf({
	layers: {
    test: {
      version: 2,
      name: 'test',
      extent: 4096,
      length: 1,
      feature: i => {
        return {
          id: 1,
          properties: {
            custom1: true,
            custom2: 1,
            custom3: 'true'
          },
          // type 1 = point, 2 = line string, 3 = polygon
          type: 1,
          loadGeometry: () => [
            [
              { x: 1024, y: 1024 }
            ]
          ]
        }
      }
    }
  }
})

const tile_res = new VectorTile(new pbf(tile))
console.log(tile_res.layers.test.feature(0).toGeoJSON(0, 0, 0))

// const ch = new ClickHouse({
//   url: 'localhost',
//   port: '8123',
//   format: 'json',
//   config: {
//     enable_http_compression: 1,
//     database: 'default'
//   }
// })

// console.log(await ch.query(`select 1 as a`).toPromise())

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