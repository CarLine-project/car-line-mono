import { IonRouterOutlet } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import LoginPage from "../../pages/login";
import RegisterPage from "../../pages/register";
import { ProtectedRoute } from "../../shared/ui/protected-route";
import { TabsRouter } from "./tabs";
import CarAddPage from "../../pages/cars/add";
import CarDetailsPage from "../../pages/cars/details";
import MileageAddPage from "../../pages/mileage/add";
import ExpenseAddPage from "../../pages/expenses/add";
import AllExpensesPage from "../../pages/expenses/all";
import MaintenanceAddPage from "../../pages/maintenance/add";

export const AppRouter = () => {
  return (
    <IonRouterOutlet>
      <Route exact path="/login">
        <LoginPage />
      </Route>
      <Route exact path="/register">
        <RegisterPage />
      </Route>

      {/* Protected Routes */}
      <Route path="/tabs">
        <ProtectedRoute>
          <TabsRouter />
        </ProtectedRoute>
      </Route>

      <Route exact path="/cars/add">
        <ProtectedRoute>
          <CarAddPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/cars/:id">
        <ProtectedRoute>
          <CarDetailsPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/cars/:id/mileage/add">
        <ProtectedRoute>
          <MileageAddPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/cars/:id/expenses/add">
        <ProtectedRoute>
          <ExpenseAddPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/expenses/all">
        <ProtectedRoute>
          <AllExpensesPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/cars/:id/maintenance/add">
        <ProtectedRoute>
          <MaintenanceAddPage />
        </ProtectedRoute>
      </Route>

      <Route exact path="/">
        <Redirect to="/tabs/home" />
      </Route>
    </IonRouterOutlet>
  );
};
