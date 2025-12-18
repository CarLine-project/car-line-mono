import { IonRouterOutlet } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { PublicRoutes } from "./public";
import { PrivateRoutes } from "./private";

export const AppRouter = () => {
  return (
    <IonRouterOutlet>
      <PublicRoutes />
      <PrivateRoutes />
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
    </IonRouterOutlet>
  );
};
