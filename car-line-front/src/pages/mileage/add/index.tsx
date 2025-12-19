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
import { useParams, useHistory } from "react-router-dom";
import { MileageForm } from "../../../features/mileage/ui/mileage-form";
import {
  useCreateMileage,
  useCurrentMileage,
} from "../../../features/mileage/api/mileage.queries";
import { CreateMileageDto } from "../../../features/mileage/model/types";

const MileageAddPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const createMutation = useCreateMileage();
  const { data: currentMileage } = useCurrentMileage(id);

  const handleSubmit = async (data: CreateMileageDto) => {
    try {
      await createMutation.mutateAsync({ carId: id, data });
      presentToast({
        message: "Пробіг успішно додано!",
        duration: 2000,
        color: "success",
      });
      history.goBack();
    } catch (error: any) {
      presentToast({
        message:
          error?.response?.data?.message || "Помилка при додаванні пробігу",
        duration: 3000,
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/cars/${id}`} color="light" />
          </IonButtons>
          <IonTitle className="text-white">Додати пробіг</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MileageForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          currentMileage={currentMileage?.value}
        />
      </IonContent>
    </IonPage>
  );
};

export default MileageAddPage;
