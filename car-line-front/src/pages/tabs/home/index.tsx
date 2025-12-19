import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { RefresherEventDetail } from "@ionic/core";
import { useQueryClient } from "@tanstack/react-query";
import { ActiveCarSelector } from "./components/active-car-selector";
import { QuickStats } from "./components/quick-stats";
import { QuickActions } from "./components/quick-actions";
import { useActiveCar } from "../../../features/cars/api/cars.queries";

const HomePage = () => {
  const queryClient = useQueryClient();
  const { data: activeCar } = useActiveCar();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await queryClient.invalidateQueries();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white">Головна</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          <ActiveCarSelector />
          {activeCar && <QuickStats carId={activeCar.id} />}
        </div>

        {activeCar && <QuickActions carId={activeCar.id} />}
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
