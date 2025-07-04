import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './hooks/useAuth.jsx'
import { ModalProvider } from './hooks/useModal.jsx'
import { ModalContainer } from './layouts/ModalContainer.jsx'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { UserProvider } from './hooks/useUser.jsx'



createRoot(document.getElementById('root')).render(
	<ModalProvider>
		<AuthContextProvider>
			<UserProvider >
				<App />
				<Toaster position='bottom-right' richColors />
				<ModalContainer />
			</UserProvider>
		</AuthContextProvider>
	</ModalProvider>

)
