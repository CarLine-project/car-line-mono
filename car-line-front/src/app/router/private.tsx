import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../shared/ui/protected-route";
import HomePage from "../../pages/home";

export const PrivateRoutes = () => {
  return (
    <>
      <Route exact path="/home">
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </Route>
    </>
  );
};
