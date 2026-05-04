import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home/Home'
import NotFound from '../pages/NotFound/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
