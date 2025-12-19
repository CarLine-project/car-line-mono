import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonSpinner,
  IonBadge,
} from "@ionic/react";
import {
  useActiveCar,
  useCars,
} from "../../../../features/cars/api/cars.queries";
import { useHistory } from "react-router-dom";

export const ActiveCarSelector = () => {
  const { data: activeCar, isLoading } = useActiveCar();
  const { data: allCars } = useCars();
  const history = useHistory();

  if (isLoading) {
    return (
      <IonCard>
        <div className="ion-text-center ion-padding">
          <IonSpinner />
        </div>
      </IonCard>
    );
  }

  if (!activeCar) {
    return (
      <IonCard style={{ margin: "16px", overflow: "hidden" }}>
        <IonCardHeader>
          <IonCardTitle style={{ wordBreak: "break-word" }}>
            Немає активного автомобіля
          </IonCardTitle>
        </IonCardHeader>
        <div className="ion-padding">
          <IonButton expand="block" onClick={() => history.push("/tabs/cars")}>
            {allCars && allCars.length > 0
              ? "Вибрати автомобіль"
              : "Додати автомобіль"}
          </IonButton>
        </div>
      </IonCard>
    );
  }

  return (
    <IonCard
      button
      onClick={() => history.push(`/cars/${activeCar.id}`)}
      style={{ margin: "16px", overflow: "hidden" }}
    >
      <IonCardHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <IonCardTitle style={{ wordBreak: "break-word" }}>
              {activeCar.make} {activeCar.model}
            </IonCardTitle>
            <IonCardSubtitle
              style={{ wordBreak: "break-word", marginTop: "4px" }}
            >
              Рік випуску: {activeCar.year}
            </IonCardSubtitle>
          </div>
          <IonBadge
            color="success"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Активне
          </IonBadge>
        </div>
      </IonCardHeader>
    </IonCard>
  );
};
