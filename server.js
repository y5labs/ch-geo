import { ClickHouse } from 'clickhouse'
import express from 'express'
import compression from 'compression'
import cors from 'cors'

const ch = new ClickHouse({
  url: 'localhost',
  port: '8123',
  format: 'json',
  config: {
    enable_http_compression: 1,
    database: 'default'
  }
})

console.log(await ch.query(`select 1 as a`).toPromise())

const app = express()
app.options('*', cors({ origin: true }))
app.use(cors({ origin: true }))
app.use(compression())
app.enable('trust proxy')

app.get('/data/:z/:x/:y.h3t', (req, res) => {
  
})

const port = process.env.EXPRESS_PORT ?? 8080
app.listen(port, () => {
  console.log(`Listening on ${port}...`)
})