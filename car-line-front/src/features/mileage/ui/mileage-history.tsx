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
} from "@ionic/react";
import { trash, speedometer } from "ionicons/icons";
import { useMileageList, useDeleteMileage } from "../api/mileage.queries";
import { useState } from "react";

interface MileageHistoryProps {
  carId: string;
}

export const MileageHistory = ({ carId }: MileageHistoryProps) => {
  const [page] = useState(1);
  const { data, isLoading } = useMileageList(carId, page);
  const deleteMutation = useDeleteMileage();

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="ion-text-center ion-padding">
        <p>Немає записів про пробіг</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей запис?")) {
      await deleteMutation.mutateAsync({ id, carId });
    }
  };

  const calculateDifference = (current: number, index: number) => {
    if (index === data.data.length - 1) return null;
    const previous = data.data[index + 1].value;
    return current - previous;
  };

  return (
    <IonList>
      {data.data.map((mileage, index) => {
        const diff = calculateDifference(mileage.value, index);
        return (
          <IonItemSliding key={mileage.id}>
            <IonItem>
              <IonIcon
                icon={speedometer}
                slot="start"
                style={{ flexShrink: 0 }}
              />
              <IonLabel className="ion-text-wrap">
                <h2 style={{ marginBottom: "8px", wordBreak: "break-word" }}>
                  {mileage.value.toLocaleString()} км
                </h2>
                <p style={{ marginTop: "4px", wordBreak: "break-word" }}>
                  {new Date(mileage.recordedAt).toLocaleDateString("uk-UA")}
                </p>
                {mileage.comment && (
                  <p style={{ marginTop: "4px", wordBreak: "break-word" }}>
                    {mileage.comment}
                  </p>
                )}
              </IonLabel>
              {diff !== null && (
                <IonNote
                  slot="end"
                  color="primary"
                  style={{ flexShrink: 0, marginLeft: "8px" }}
                >
                  +{diff.toLocaleString()} км
                </IonNote>
              )}
            </IonItem>

            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                onClick={() => handleDelete(mileage.id)}
              >
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        );
      })}
    </IonList>
  );
};
