import gm from 'global-mercator'

const lnglat2google = gm.lngLatToGoogle
const lnglat2googlefrac = gm.pointToTileFraction

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

const quadint2quadkey = quadint => {
  const s = quadint.toString(2).padStart(64, '0')
  let res = ''
  for (let i = 0; i < 32; i++) {
    const bin = s.slice(i * 2, i * 2 + 2)
    if (bin == '00') res += '0'
    else if (bin == '01') res += '1'
    else if (bin == '10') res += '2'
    else if (bin == '11') res += '3'
  }
  return res
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

const zoom2quadint_inv = zoom => {
  let res = '0b'
  for (let i = 0; i < 32; i++) {
    if (i > zoom - 1) {
      res += '00'
      continue
    }
    res += '11'
  }
  return BigInt(res)
}

const lnglat2quadint = lnglat => {
  const tile = gm.lngLatToGoogle(lnglat, 32)
  const quadkey = gm.googleToQuadkey(tile)
  const quadint = quadkey2quadint(quadkey)
  return quadint
}

const google2quadint = tile => {
  const quadkey = gm.googleToQuadkey(tile)
  const quadint = quadkey2quadint(quadkey)
  return quadint
}

const google2quadintrange = tile => {
  const quadint_low = google2quadint(tile)
  const quadint_zoom = zoom2quadint(tile[2])
  const quadint_high = quadint_low + quadint_zoom
  return [quadint_low, quadint_high]
}

const quadint2googlefrac = (quadint, z) => {
  const s = quadint.toString(2).padStart(64, '0')
  let x = 0
  let y = 0

  for (let i = z + 1; i > 0; i--) {
    const mask = 1 << (i - 1)
    const ii = (z - i) * 2
    const bin = s.slice(ii, ii + 2)
    if (bin == '00') continue
    else if (bin == '01') x |= mask
    else if (bin == '10') y |= mask
    else if (bin == '11') {
      x |= mask
      y |= mask
    }
  }
  let frac = 1
  for (let i = z; i < 32; i++) {
    frac /= 2
    const ii = i * 2
    const bin = s.slice(ii, ii + 2)
    if (bin == '00') continue
    else if (bin == '01') x += frac
    else if (bin == '10') y += frac
    else if (bin == '11') {
      x += frac
      y += frac
    }
  }
  return [x, y, z]
}

const googlefrac2vecxy = (xyz, origin_xyz, extent) =>
  xyz.slice(0, 2).map((v, i) => Math.trunc((v - origin_xyz[i]) * extent))

const vecxy2obj = xy => ({ x: xy[0], y: xy[1] })

const generate_tile = (tile_coord, layers) => ({
  layers: Object.fromEntries(
    layers.map(layer => [layer.name, {
      ...layer,
      version: 2,
      length: layer.features.length,
      feature: i => {
        const feature = layer.features[i]
        return {
          ...feature,
          loadGeometry: () => feature.geometry
        }
      }
    }])
  )
})

export {
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
}