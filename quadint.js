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

export {
  lnglat2quadint,
  google2quadint,
  zoom2quadint,
  zoom2quadint_inv,
  google2quadintrange
}