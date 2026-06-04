import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.tsx"
import type { ReactNode } from 'react';

const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;