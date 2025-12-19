import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import {
  useCar,
  useActivateCar,
  useDeleteCar,
} from "../../../features/cars/api/cars.queries";
import { CarCard } from "../../../features/cars/ui/car-card";

const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const { data: car, isLoading } = useCar(id);
  const activateMutation = useActivateCar();
  const deleteMutation = useDeleteCar();

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(id);
      presentToast({
        message: "Автомобіль активовано!",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      presentToast({
        message: "Помилка при активації",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цей автомобіль?")) {
      try {
        await deleteMutation.mutateAsync(id);
        presentToast({
          message: "Автомобіль видалено!",
          duration: 2000,
          color: "success",
        });
        history.replace("/tabs/cars");
      } catch (error) {
        presentToast({
          message: "Помилка при видаленні",
          duration: 2000,
          color: "danger",
        });
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/cars" color="light" />
          </IonButtons>
          <IonTitle className="text-white">Деталі авто</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : car ? (
          <CarCard
            car={car}
            onActivate={!car.isActive ? handleActivate : undefined}
            onDelete={handleDelete}
          />
        ) : (
          <p>Автомобіль не знайдено</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CarDetailsPage;
