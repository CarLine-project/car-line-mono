import { Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { useAuthStore } from "../../features/auth/model/auth.store";
import LoginPage from "../../pages/login";
import RegisterPage from "../../pages/register";

export const PublicRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Route exact path="/login">
        {isAuthenticated ? <Redirect to="/home" /> : <LoginPage />}
      </Route>
      <Route exact path="/register">
        {isAuthenticated ? <Redirect to="/home" /> : <RegisterPage />}
      </Route>
    </>
  );
};
