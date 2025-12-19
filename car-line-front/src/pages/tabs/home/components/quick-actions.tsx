import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import { add, speedometer, cash, build } from "ionicons/icons";
import { useHistory } from "react-router-dom";

interface QuickActionsProps {
  carId: string;
}

export const QuickActions = ({ carId }: QuickActionsProps) => {
  const history = useHistory();

  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton>
        <IonIcon icon={add} />
      </IonFabButton>
      <IonFabList side="top">
        <IonFabButton
          color="primary"
          onClick={() => history.push(`/cars/${carId}/mileage/add`)}
        >
          <IonIcon icon={speedometer} />
        </IonFabButton>
        <IonFabButton
          color="secondary"
          onClick={() => history.push(`/cars/${carId}/expenses/add`)}
        >
          <IonIcon icon={cash} />
        </IonFabButton>
        <IonFabButton
          color="tertiary"
          onClick={() => history.push(`/cars/${carId}/maintenance/add`)}
        >
          <IonIcon icon={build} />
        </IonFabButton>
      </IonFabList>
    </IonFab>
  );
};
