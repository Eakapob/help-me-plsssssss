import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Dashboard from './component/DashboardPage.jsx'
import AdminPage from './component/AdminPage.jsx'
import AdminDashboardPage from './component/AdminDashboardPage.jsx'
import InfoPage from './component/InfoPage.jsx'

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
  }

])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
