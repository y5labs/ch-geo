import fs from 'fs/promises'
import { VectorTile } from '@mapbox/vector-tile'
import pbf from 'pbf'

console.log(new VectorTile(new pbf(await fs.readFile('test.pbf'))).layers)
console.log(new VectorTile(new pbf(await fs.readFile('assets.pbf'))).layers)
console.log(new VectorTile(new pbf(await fs.readFile('asset_groups.pbf'))).layers)
