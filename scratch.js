import { ClickHouse } from 'clickhouse'

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