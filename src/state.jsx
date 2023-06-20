import inject from 'seacreature/lib/inject'
import { createContext, useContext, useEffect, useState } from 'react'

inject('ctx', ({ HubContext }) => {
  const StateContext = createContext()

  const StateProvider = ({ children }) => {
    const hub = useContext(HubContext)

    return <StateContext.Provider
      value={{ }} children={children} />
  }

  inject('provider', StateProvider)

  return { StateContext, StateProvider }
})