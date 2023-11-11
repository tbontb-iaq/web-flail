import '@/assets/global.scss'

import React from 'react'
import ReactDOM from 'react-dom/client'
import Index from '@/pages/index'

export default function App() {
  return <Index />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
