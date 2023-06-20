import './index.styl'
import { createRoot } from 'react-dom/client'

const App = () => {
  return <div>He</div>
}
const renderRoot = createRoot(document.getElementById('root'))
renderRoot.render(<App />)
