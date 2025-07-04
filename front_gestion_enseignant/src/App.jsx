import './App.css'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Login } from './pages/Login'
import { AuthRoutes } from './layouts/AuthRoutes'
import { SecondLayer } from './layouts/SecondLayer'
import Dashboard from './pages/Dashboard'
import UserProfile from './pages/UserProfile'
import UserManagement from './pages/UserManagement'
import Classrooms from './pages/Classrooms'
import Promotions from './pages/Promotions'
import PromotionDetail from './pages/PromotionDetails'
import Courses from './pages/Courses'
import TimeTableList from './pages/TimeTableList'


const routes = createBrowserRouter([
	{
		path: '/',
		element: <AuthRoutes />,
	},

	{
		path: 'dashboard',
		element: <SecondLayer />,
		children:[
			{
				path: '',
				element: <Dashboard />
			},
			{
				path: 'profile',
				element: <UserProfile />
			},
			{
				path: 'admins',
				element: <UserManagement />
			},
			{
				path: 'classrooms',
				element: <Classrooms />
			},
			{
				path: 'promotions',
				element: <Promotions />
			},
			{
				path: 'promotions/1/detail',
				element: <PromotionDetail />
			},
			{
				path: 'courses',
				element: <Courses />
			},
			{
				path: 'schedules',
				element: <TimeTableList />
			}
		]
	},

	{
		path: '/login',
		element: <Login />
	},
])

function App() {

	return <RouterProvider router={routes} />
}

export default App
