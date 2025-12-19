import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useState } from "react";
import { AllExpensesList } from "../../../features/expenses/ui/all-expenses-list";
import { AllMaintenanceList } from "../../../features/maintenance/ui/all-maintenance-list";

const AllExpensesPage = () => {
  const [segment, setSegment] = useState<"expenses" | "maintenance">(
    "expenses"
  );
  const [period, setPeriod] = useState<string>("month");

  const getDateRange = (period: string) => {
    const now = new Date();
    let from: string;
    let to: string = now.toISOString().split("T")[0];

    switch (period) {
      case "week":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        break;
      case "month":
        from = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        break;
      case "3months":
        from = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          .toISOString()
          .split("T")[0];
        break;
      case "6months":
        from = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          .toISOString()
          .split("T")[0];
        break;
      case "year":
        from = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        break;
      case "all":
        from = "";
        to = "";
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
    }

    return { from, to };
  };

  const { from, to } = getDateRange(period);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" />
          </IonButtons>
          <IonTitle>Всі записи</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonSegment
            value={segment}
            onIonChange={(e) =>
              setSegment(e.detail.value as "expenses" | "maintenance")
            }
          >
            <IonSegmentButton value="expenses">
              <IonLabel>Витрати</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="maintenance">
              <IonLabel>Обслуговування</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <IonItem>
            <IonLabel>Період</IonLabel>
            <IonSelect
              value={period}
              onIonChange={(e) => setPeriod(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="week">Останній тиждень</IonSelectOption>
              <IonSelectOption value="month">Останній місяць</IonSelectOption>
              <IonSelectOption value="3months">3 місяці</IonSelectOption>
              <IonSelectOption value="6months">6 місяців</IonSelectOption>
              <IonSelectOption value="year">Рік</IonSelectOption>
              <IonSelectOption value="all">Всі</IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>

        {segment === "expenses" ? (
          <AllExpensesList from={from} to={to} />
        ) : (
          <AllMaintenanceList from={from} to={to} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default AllExpensesPage;
