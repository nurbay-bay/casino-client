import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../shared/hooks/reduxHooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Если нет токена или пользователя, перенаправляем на главную с параметром для открытия модалки
  if (!token || !user) {
    return <Navigate to="/?auth=login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

