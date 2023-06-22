import fs from 'fs/promises'
import papa from 'papaparse'

export default async ch => {
  // TODO: Insert assets
  const assets = papa.parse(await fs.readFile('./assets.csv', 'utf8'), { header: true }).data

  let insert_assets = null
  let insert_assets_count = 0

  const insert_asset = async a => {
    if (insert_assets == null)
      insert_assets = ch
        .insert('insert into asset (id, name, description, site, class_id, location_id, category_id, manufacturer_id, assetstatus_id, owner_id, current_condition_score, location_x, location_y, quadint)')
        .stream()
    await insert_assets.writeRow(a)
    insert_assets_count++
    if (insert_assets_count == 1000) {
      await insert_assets.exec()
      insert_assets_count = 0
      insert_assets = null
    }
  }
  const insert_asset_final = async () => {
    if (insert_assets != null) {
      await insert_assets.exec()
      insert_assets_count = 0
      insert_assets = null
    }
    await ch.query('optimize table asset final').toPromise()
  }

  const parseIntOrNull = s => {
    const res = parseInt(s)
    return isNaN(res) ? null : res
  }

  const parseFloatOrNull = s => {
    const res = parseFloat(s)
    return isNaN(res) ? null : res
  }

  for (const a of assets) {
    const location_x = parseFloatOrNull(a.location_x)
    const location_y = parseFloatOrNull(a.location_y)
    const quadint = location_x != null && location_y != null
      ? lnglat2quadint([location_y, location_x])
      : null
    await insert_asset([
      a.id,
      a.name,
      a.description,
      a.site,
      parseIntOrNull(a.class_id),
      parseIntOrNull(a.location_id),
      parseIntOrNull(a.category_id),
      parseIntOrNull(a.manufacturer_id),
      parseIntOrNull(a.assetstatus_id),
      parseIntOrNull(a.owner_id),
      parseIntOrNull(a.current_condition_score),
      parseFloatOrNull(a.location_x),
      parseFloatOrNull(a.location_y),
      quadint
    ])
  }
  await insert_asset_final()
}
