import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { home, car, statsChart, person } from "ionicons/icons";
import HomePage from "../../pages/tabs/home";
import CarsPage from "../../pages/tabs/cars";
import StatisticsPage from "../../pages/tabs/statistics";
import ProfilePage from "../../pages/tabs/profile";

export const TabsRouter = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home">
          <HomePage />
        </Route>
        <Route exact path="/tabs/cars">
          <CarsPage />
        </Route>
        <Route exact path="/tabs/statistics">
          <StatisticsPage />
        </Route>
        <Route exact path="/tabs/profile">
          <ProfilePage />
        </Route>
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={home} />
          <IonLabel>Головна</IonLabel>
        </IonTabButton>
        <IonTabButton tab="cars" href="/tabs/cars">
          <IonIcon icon={car} />
          <IonLabel>Авто</IonLabel>
        </IonTabButton>
        <IonTabButton tab="statistics" href="/tabs/statistics">
          <IonIcon icon={statsChart} />
          <IonLabel>Статистика</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon icon={person} />
          <IonLabel>Профіль</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
