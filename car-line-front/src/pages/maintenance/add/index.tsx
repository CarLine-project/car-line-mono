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
import { MaintenanceForm } from "../../../features/maintenance/ui/maintenance-form";
import { useCreateMaintenance } from "../../../features/maintenance/api/maintenance.queries";
import { useCurrentMileage } from "../../../features/mileage/api/mileage.queries";
import { CreateMaintenanceDto } from "../../../features/maintenance/model/types";

const MaintenanceAddPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const createMutation = useCreateMaintenance();
  const { data: currentMileage } = useCurrentMileage(id);

  const handleSubmit = async (data: CreateMaintenanceDto) => {
    try {
      await createMutation.mutateAsync({ carId: id, data });
      presentToast({
        message: "Технічне обслуговування успішно додано!",
        duration: 2000,
        color: "success",
      });
      history.goBack();
    } catch (error: any) {
      presentToast({
        message: error?.response?.data?.message || "Помилка при додаванні ТО",
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
          <IonTitle className="text-white">Додати ТО</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MaintenanceForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          currentMileage={currentMileage?.value}
        />
      </IonContent>
    </IonPage>
  );
};

export default MaintenanceAddPage;
