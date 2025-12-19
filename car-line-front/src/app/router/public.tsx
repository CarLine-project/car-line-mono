import { Route, Redirect } from "react-router-dom";
import { useIsAuthenticated } from "../../features/auth/model/auth.store";
import LoginPage from "../../pages/login";
import RegisterPage from "../../pages/register";

export const PublicRoutes = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <Route
        exact
        path="/login"
        render={() => {
          if (isAuthenticated) {
            return <Redirect to="/home" />;
          }
          return <LoginPage />;
        }}
      />
      <Route
        exact
        path="/register"
        render={() => {
          if (isAuthenticated) {
            return <Redirect to="/home" />;
          }
          return <RegisterPage />;
        }}
      />
    </>
  );
};
