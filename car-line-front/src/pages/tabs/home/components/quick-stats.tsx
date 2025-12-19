import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonButton,
} from "@ionic/react";
import { speedometer, cash, build, list } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useCurrentMileage } from "../../../../features/mileage/api/mileage.queries";
import { useExpenseStats } from "../../../../features/expenses/api/expenses.queries";
import { useMaintenanceRecommendation } from "../../../../features/maintenance/api/maintenance.queries";

interface QuickStatsProps {
  carId: string;
}

export const QuickStats = ({ carId }: QuickStatsProps) => {
  const history = useHistory();
  const { data: currentMileage, isLoading: mileageLoading } =
    useCurrentMileage(carId);

  // Get expenses for the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats(
    carId,
    firstDayOfMonth,
    lastDayOfMonth
  );

  const { data: maintenanceRec, isLoading: maintenanceLoading } =
    useMaintenanceRecommendation(carId);

  if (mileageLoading || expensesLoading || maintenanceLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  return (
    <div>
      <IonCard style={{ margin: "16px", overflow: "hidden" }}>
        <IonCardHeader>
          <IonCardTitle
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <IonIcon icon={speedometer} style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>Поточний пробіг</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <h1 style={{ wordBreak: "break-word" }}>
            {currentMileage
              ? `${currentMileage.value.toLocaleString()} км`
              : "Немає даних"}
          </h1>
        </IonCardContent>
      </IonCard>

      <IonCard style={{ margin: "16px", overflow: "hidden" }}>
        <IonCardHeader>
          <IonCardTitle
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <IonIcon icon={cash} style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>Витрати за місяць</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <h1 style={{ wordBreak: "break-word" }}>
            {expenseStats
              ? `${expenseStats.totalAmount.toFixed(2)} ₴`
              : "0.00 ₴"}
          </h1>
        </IonCardContent>
      </IonCard>

      {maintenanceRec && maintenanceRec.recommended && (
        <IonCard color="warning" style={{ margin: "16px", overflow: "hidden" }}>
          <IonCardHeader>
            <IonCardTitle
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <IonIcon icon={build} style={{ flexShrink: 0 }} />
              <span style={{ wordBreak: "break-word" }}>Наближається ТО</span>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ wordBreak: "break-word", margin: 0 }}>
              {maintenanceRec.reason}
            </p>
          </IonCardContent>
        </IonCard>
      )}

      <IonCard style={{ margin: "16px", overflow: "hidden" }}>
        <IonCardContent>
          <IonButton
            expand="block"
            onClick={() => history.push("/expenses/all")}
          >
            <IonIcon slot="start" icon={list} />
            Переглянути всі витрати
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};
