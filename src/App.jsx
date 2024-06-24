import { useState } from 'react'
import './App.css'
import DashboardPage from './component/DashboardPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DashboardPage />
    </>
  )
}

export default App
