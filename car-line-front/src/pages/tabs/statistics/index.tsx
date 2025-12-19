import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useState } from "react";
import { useActiveCar } from "../../../features/cars/api/cars.queries";
import { useExpenseStats } from "../../../features/expenses/api/expenses.queries";

const StatisticsPage = () => {
  const [period, setPeriod] = useState<string>("month");
  const { data: activeCar, isLoading: carLoading } = useActiveCar();

  const getDateRange = (period: string) => {
    const now = new Date();
    let from: string;
    let to: string = now.toISOString().split("T")[0];

    switch (period) {
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
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
    }

    return { from, to };
  };

  const { from, to } = getDateRange(period);
  const { data: stats, isLoading: statsLoading } = useExpenseStats(
    activeCar?.id || "",
    from,
    to
  );

  if (carLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Статистика</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!activeCar) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Статистика</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Спочатку оберіть активний автомобіль</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white">Статистика</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonItem>
            <IonLabel>Період</IonLabel>
            <IonSelect
              value={period}
              onIonChange={(e) => setPeriod(e.detail.value)}
            >
              <IonSelectOption value="month">Останній місяць</IonSelectOption>
              <IonSelectOption value="3months">3 місяці</IonSelectOption>
              <IonSelectOption value="6months">6 місяців</IonSelectOption>
              <IonSelectOption value="year">Рік</IonSelectOption>
            </IonSelect>
          </IonItem>

          {statsLoading ? (
            <div className="ion-text-center ion-padding">
              <IonSpinner />
            </div>
          ) : stats ? (
            <>
              <IonCard style={{ margin: "16px", overflow: "hidden" }}>
                <IonCardHeader>
                  <IonCardTitle style={{ wordBreak: "break-word" }}>
                    Загальна сума витрат
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h1
                    style={{
                      fontSize: "2.5rem",
                      margin: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {stats.totalAmount.toFixed(2)} ₴
                  </h1>
                </IonCardContent>
              </IonCard>

              <IonCard style={{ margin: "16px", overflow: "hidden" }}>
                <IonCardHeader>
                  <IonCardTitle style={{ wordBreak: "break-word" }}>
                    Розподіл по категоріях
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {stats.byCategory.length > 0 ? (
                    stats.byCategory.map((cat) => (
                      <div key={cat.category} style={{ marginBottom: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "0.5rem",
                            gap: "8px",
                          }}
                        >
                          <span style={{ wordBreak: "break-word", flex: 1 }}>
                            {cat.category}
                          </span>
                          <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                            {cat.amount.toFixed(2)} ₴ (
                            {cat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#E3F2FD",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${cat.percentage}%`,
                              height: "100%",
                              backgroundColor: "#2196F3",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Немає даних</p>
                  )}
                </IonCardContent>
              </IonCard>

              <IonCard style={{ margin: "16px", overflow: "hidden" }}>
                <IonCardHeader>
                  <IonCardTitle style={{ wordBreak: "break-word" }}>
                    Витрати по місяцях
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {stats.byMonth.length > 0 ? (
                    stats.byMonth.map((month) => (
                      <div
                        key={month.month}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0",
                          borderBottom: "1px solid #E3F2FD",
                          gap: "8px",
                        }}
                      >
                        <span style={{ wordBreak: "break-word", flex: 1 }}>
                          {month.month}
                        </span>
                        <span
                          className="font-semibold text-medium-blue"
                          style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                        >
                          {month.amount.toFixed(2)} ₴
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>Немає даних</p>
                  )}
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <p>Немає даних про витрати</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StatisticsPage;
