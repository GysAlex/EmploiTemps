import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './hooks/useAuth.jsx'
import { ModalProvider } from './hooks/useModal.jsx'
import { ModalContainer } from './layouts/ModalContainer.jsx'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { UserProvider } from './hooks/useUser.jsx'
import { UserProviderManagement } from './hooks/useManageUser.jsx'
import { ClassroomProvider } from './hooks/useClassrooms.jsx'
import { CourseProvider } from './hooks/useCourses.jsx'
import { PromotionProvider } from './hooks/usePromotions.jsx'



createRoot(document.getElementById('root')).render(
	<ModalProvider>
		<AuthContextProvider>
			<UserProviderManagement>
				<CourseProvider>
					<UserProvider >
						<ClassroomProvider>
							<PromotionProvider>								
								<App />
								<Toaster position='top-right' richColors />
								<ModalContainer />
							</PromotionProvider>
						</ClassroomProvider>
					</UserProvider>
				</CourseProvider>
			</UserProviderManagement>
		</AuthContextProvider>
	</ModalProvider>

)
