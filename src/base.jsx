import inject from 'seacreature/lib/inject'
import { useContext } from 'react'

inject('pod', ({ RouterContext }) => {
  inject('app', () => {
    const Route = useContext(RouterContext)
    return Route ? <Route /> : <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem'
    }}>Loading…</div>
  })
})