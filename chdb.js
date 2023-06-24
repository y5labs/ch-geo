import { ClickHouse } from 'clickhouse'

export default async () => {
  const ch = new ClickHouse({
    url: '127.0.0.1',
    port: '8123',
    format: 'json',
    config: {
      enable_http_compression: 1,
      database: 'default'
    }
  })

  const ch_migration = `
    create table if not exists asset (
      id String,
      name Nullable(String),
      description Nullable(String),
      site Nullable(String),
      class_id Nullable(UInt32),
      location_id Nullable(UInt32),
      category_id Nullable(UInt32),
      manufacturer_id Nullable(UInt32),
      assetstatus_id Nullable(UInt32),
      owner_id Nullable(UInt32),
      current_condition_score Nullable(UInt8),
      location_x Nullable(Float32),
      location_y Nullable(Float32),

      quadint Nullable(UInt64),

      index asset_class_id_idx (class_id)
        type bloom_filter granularity 3,
      index asset_location_id_idx (location_id)
        type bloom_filter granularity 3,
      index asset_category_id_idx (category_id)
        type bloom_filter granularity 3,
      index asset_manufacturer_id_idx (manufacturer_id)
        type bloom_filter granularity 3,
      index asset_assetstatus_id_idx (assetstatus_id)
        type bloom_filter granularity 3,
      index asset_owner_id_idx (owner_id)
        type bloom_filter granularity 3,
      index asset_quadint_idx (quadint)
        type minmax,
      index asset_location_x_idx (location_x)
        type minmax,
      index asset_location_y_idx (location_y)
        type minmax
    )
    engine = ReplacingMergeTree
    primary key (id);
  `
  const queries = ch_migration.split(';').map(s => s.trim()).filter(s => s != '')
  for (const q of queries) await ch.query(q).toPromise()

  return ch
}