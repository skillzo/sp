import { RouterProvider } from "react-router";
import { router } from "./routes";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./context/AuthContext";
import { StoreBootstrap } from "./stores/StoreBootstrap";

export default function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <StoreBootstrap />
        <RouterProvider router={router} />
      </AuthProvider>
    </SidebarProvider>
  );
}
