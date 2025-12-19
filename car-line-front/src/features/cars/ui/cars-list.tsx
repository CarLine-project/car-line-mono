import {
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { create, trash, checkmarkCircle } from "ionicons/icons";
import { useCars, useDeleteCar, useActivateCar } from "../api/cars.queries";
import { useHistory } from "react-router-dom";

export const CarsList = () => {
  const { data: cars, isLoading } = useCars();
  const deleteMutation = useDeleteCar();
  const activateMutation = useActivateCar();
  const history = useHistory();

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="ion-text-center ion-padding">
        <p>Немає автомобілів. Додайте свій перший автомобіль!</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей автомобіль?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleActivate = async (id: string) => {
    await activateMutation.mutateAsync(id);
  };

  return (
    <IonList>
      {cars.map((car) => (
        <IonItemSliding key={car.id}>
          <IonItem
            button
            onClick={() => history.push(`/cars/${car.id}`)}
            detail
          >
            <IonLabel className="ion-text-wrap">
              <h2 style={{ marginBottom: "8px", wordBreak: "break-word" }}>
                {car.make} {car.model}
              </h2>
              <p style={{ wordBreak: "break-word" }}>Рік: {car.year}</p>
              <p style={{ wordBreak: "break-word" }}>
                Початковий пробіг: {car.initialMileage.toLocaleString()} км
              </p>
            </IonLabel>
            {car.isActive && (
              <IonBadge color="success" slot="end" style={{ flexShrink: 0 }}>
                Активне
              </IonBadge>
            )}
          </IonItem>

          <IonItemOptions side="end">
            {!car.isActive && (
              <IonItemOption
                color="success"
                onClick={() => handleActivate(car.id)}
              >
                <IonIcon slot="icon-only" icon={checkmarkCircle} />
              </IonItemOption>
            )}
            <IonItemOption color="danger" onClick={() => handleDelete(car.id)}>
              <IonIcon slot="icon-only" icon={trash} />
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};
