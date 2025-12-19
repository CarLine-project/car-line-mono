import {
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
} from "@ionic/react";
import { trash, build, alertCircle } from "ionicons/icons";
import {
  useMaintenanceList,
  useDeleteMaintenance,
  useMaintenanceRecommendation,
} from "../api/maintenance.queries";
import { useState } from "react";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  oil_change: "Заміна олії",
  filters: "Фільтри",
  brakes: "Гальма",
  tires: "Шини",
  full_service: "Повне ТО",
  other: "Інше",
};

interface MaintenanceListProps {
  carId: string;
}

export const MaintenanceList = ({ carId }: MaintenanceListProps) => {
  const [page] = useState(1);
  const { data, isLoading } = useMaintenanceList(carId, page);
  const { data: recommendation } = useMaintenanceRecommendation(carId);
  const deleteMutation = useDeleteMaintenance();

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей запис?")) {
      await deleteMutation.mutateAsync({ id, carId });
    }
  };

  return (
    <div>
      {recommendation && recommendation.recommended && (
        <IonCard color="warning" style={{ margin: "16px" }}>
          <IonCardHeader>
            <IonCardTitle
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                wordBreak: "break-word",
              }}
            >
              <IonIcon icon={alertCircle} style={{ flexShrink: 0 }} />
              <span>Рекомендується ТО</span>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ wordBreak: "break-word" }}>
            <p style={{ marginBottom: "8px" }}>{recommendation.reason}</p>
            {recommendation.suggestedMileage && (
              <p style={{ marginTop: "8px" }}>
                <small>
                  Рекомендований пробіг:{" "}
                  {recommendation.suggestedMileage.toLocaleString()} км
                </small>
              </p>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {!data || data.data.length === 0 ? (
        <div className="ion-text-center ion-padding">
          <p>Немає записів про технічне обслуговування</p>
        </div>
      ) : (
        <IonList>
          {data.data.map((maintenance) => (
            <IonItemSliding key={maintenance.id}>
              <IonItem>
                <IonIcon icon={build} slot="start" style={{ flexShrink: 0 }} />
                <IonLabel className="ion-text-wrap">
                  <h2 style={{ marginBottom: "8px" }}>
                    <IonBadge
                      color="primary"
                      style={{ maxWidth: "100%", whiteSpace: "normal" }}
                    >
                      {SERVICE_TYPE_LABELS[maintenance.serviceType] ||
                        maintenance.serviceType}
                    </IonBadge>
                  </h2>
                  <p style={{ marginTop: "4px", wordBreak: "break-word" }}>
                    Пробіг: {maintenance.mileageAtService.toLocaleString()} км
                  </p>
                  <p style={{ marginTop: "4px", wordBreak: "break-word" }}>
                    Дата:{" "}
                    {new Date(maintenance.serviceDate).toLocaleDateString(
                      "uk-UA"
                    )}
                  </p>
                  {maintenance.description && (
                    <p style={{ marginTop: "4px", wordBreak: "break-word" }}>
                      {maintenance.description}
                    </p>
                  )}
                </IonLabel>
                <IonNote
                  slot="end"
                  color="primary"
                  style={{ flexShrink: 0, marginLeft: "8px" }}
                >
                  {maintenance.cost.toFixed(2)} ₴
                </IonNote>
              </IonItem>

              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  onClick={() => handleDelete(maintenance.id)}
                >
                  <IonIcon slot="icon-only" icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      )}
    </div>
  );
};
