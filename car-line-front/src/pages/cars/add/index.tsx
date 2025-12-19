import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { CarForm } from "../../../features/cars/ui/car-form";
import { useCreateCar } from "../../../features/cars/api/cars.queries";
import { CreateCarDto } from "../../../features/cars/model/types";

const CarAddPage = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();
  const createMutation = useCreateCar();

  const handleSubmit = async (data: CreateCarDto) => {
    try {
      await createMutation.mutateAsync(data);
      presentToast({
        message: "Автомобіль успішно додано!",
        duration: 2000,
        color: "success",
      });
      history.goBack();
    } catch (error) {
      presentToast({
        message: "Помилка при додаванні автомобіля",
        duration: 2000,
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/cars" color="light" />
          </IonButtons>
          <IonTitle className="text-white">Додати автомобіль</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <CarForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </IonContent>
    </IonPage>
  );
};

export default CarAddPage;
