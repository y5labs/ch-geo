import inject from 'seacreature/lib/inject'
import { createRoot } from 'react-dom/client'

inject('pod', async () => {
  const App = inject.one('app')
  const Root = () =>
    inject.many('provider')
      .reverse()
      .reduce((children, Provider) =>
        <Provider children={children} />,
        <App />)
  const renderRoot = createRoot(document.getElementById('root'))
  renderRoot.render(<Root />)
})
