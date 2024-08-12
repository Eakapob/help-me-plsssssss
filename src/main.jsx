import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Dashboard from './component/DashboardPage.jsx'
import AdminPage from './component/AdminPage.jsx'
import AdminDashboardPage from './component/AdminDashboardPage.jsx'
import InfoPage from './component/InfoPage.jsx'
import Info from './component/Info.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />
  },
  {
    path: "/admin",
    element: <AdminPage />
  },
  {
    path: "/admindashboard",
    element: <AdminDashboardPage />
  },
  {
    path: "/info",
    element: <InfoPage />
  },
  {
    path: "/infouser",
    element: <Info />
  }

])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
