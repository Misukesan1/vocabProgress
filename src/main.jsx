import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { RouterProvider } from 'react-router'

import router from './router/router.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <HeroUIProvider>
    <RouterProvider router={router}/>
  </HeroUIProvider>
)
