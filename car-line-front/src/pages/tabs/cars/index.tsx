import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { CarsList } from "../../../features/cars/ui/cars-list";

const CarsPage = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white">Мої авто</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <CarsList />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push("/cars/add")}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default CarsPage;
