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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { trash } from "ionicons/icons";
import {
  useAllMaintenance,
  useDeleteMaintenance,
} from "../api/maintenance.queries";
import { useCars } from "../../cars/api/cars.queries";
import { useState } from "react";

interface AllMaintenanceListProps {
  from?: string;
  to?: string;
}

export const AllMaintenanceList = ({ from, to }: AllMaintenanceListProps) => {
  const [page] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  const { data: cars } = useCars();
  const { data, isLoading } = useAllMaintenance({
    page,
    carId: selectedCarId || undefined,
    from,
    to,
  });
  const deleteMutation = useDeleteMaintenance();

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <>
        <div className="ion-padding">
          <IonItem>
            <IonLabel>Автомобіль</IonLabel>
            <IonSelect
              value={selectedCarId}
              onIonChange={(e) => setSelectedCarId(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="">Всі</IonSelectOption>
              {cars?.map((car) => (
                <IonSelectOption key={car.id} value={car.id}>
                  {car.brand} {car.model}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>
        <div className="ion-text-center ion-padding">
          <p>Немає записів про обслуговування</p>
        </div>
      </>
    );
  }

  const handleDelete = async (id: string, carId: string) => {
    if (
      window.confirm(
        "Ви впевнені, що хочете видалити цей запис обслуговування?"
      )
    ) {
      await deleteMutation.mutateAsync({ id, carId });
    }
  };

  // Group maintenance by date
  const groupedMaintenance = data.data.reduce((groups, maintenance) => {
    const date = new Date(maintenance.serviceDate).toLocaleDateString("uk-UA");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(maintenance);
    return groups;
  }, {} as Record<string, typeof data.data>);

  return (
    <div>
      <div className="ion-padding" style={{ paddingBottom: "8px" }}>
        <IonItem>
          <IonLabel>Автомобіль</IonLabel>
          <IonSelect
            value={selectedCarId}
            onIonChange={(e) => setSelectedCarId(e.detail.value)}
            interface="popover"
          >
            <IonSelectOption value="">Всі</IonSelectOption>
            {cars?.map((car) => (
              <IonSelectOption key={car.id} value={car.id}>
                {car.brand} {car.model}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </div>

      {Object.entries(groupedMaintenance).map(([date, maintenances]) => (
        <div key={date}>
          <div
            className="ion-padding"
            style={{ paddingBottom: "8px", paddingTop: "16px" }}
          >
            <h3 style={{ margin: 0, wordBreak: "break-word" }}>{date}</h3>
          </div>
          <IonList>
            {maintenances.map((maintenance) => (
              <IonItemSliding key={maintenance.id}>
                <IonItem>
                  <IonLabel className="ion-text-wrap">
                    <h2>{maintenance.serviceType}</h2>
                    {maintenance.description && (
                      <p style={{ wordBreak: "break-word", marginTop: "4px" }}>
                        {maintenance.description}
                      </p>
                    )}
                    <p>
                      Пробіг: {maintenance.mileageAtService.toLocaleString()} км
                    </p>
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
                    onClick={() =>
                      handleDelete(maintenance.id, maintenance.carId)
                    }
                  >
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        </div>
      ))}
    </div>
  );
};
