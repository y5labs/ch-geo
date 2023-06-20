import inject from 'seacreature/lib/inject'
import { useState } from 'react'

inject('pod', ({ StateContext, HubContext }) => {
  inject('route', ['/', p => () => {
    const state = useContext(StateContext)
    const hub = useContext(HubContext)
    const params = new URLSearchParams(window.location.search)
    return <>
      <h1>Hi</h1>
    </>
  }])
})