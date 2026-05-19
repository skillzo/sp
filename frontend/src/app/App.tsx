import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <UserProvider>
      <SidebarProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SidebarProvider>
    </UserProvider>
  );
}