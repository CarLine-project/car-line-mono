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
  IonBadge,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { trash } from "ionicons/icons";
import {
  useAllExpenses,
  useDeleteExpense,
  useExpenseCategories,
} from "../api/expenses.queries";
import { useCars } from "../../cars/api/cars.queries";
import { useState } from "react";

interface AllExpensesListProps {
  from?: string;
  to?: string;
}

export const AllExpensesList = ({ from, to }: AllExpensesListProps) => {
  const [page] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: cars } = useCars();
  const { data: categories } = useExpenseCategories();
  const { data, isLoading } = useAllExpenses({
    page,
    carId: selectedCarId || undefined,
    categoryId: selectedCategoryId || undefined,
    from,
    to,
  });
  const deleteMutation = useDeleteExpense();

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
          <IonItem>
            <IonLabel>Категорія</IonLabel>
            <IonSelect
              value={selectedCategoryId}
              onIonChange={(e) => setSelectedCategoryId(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="">Всі</IonSelectOption>
              {categories?.map((category) => (
                <IonSelectOption key={category.id} value={category.id}>
                  {category.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>
        <div className="ion-text-center ion-padding">
          <p>Немає витрат</p>
        </div>
      </>
    );
  }

  const handleDelete = async (id: string, carId: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю витрату?")) {
      await deleteMutation.mutateAsync({ id, carId });
    }
  };

  // Group expenses by date
  const groupedExpenses = data.data.reduce((groups, expense) => {
    const date = new Date(expense.expenseDate).toLocaleDateString("uk-UA");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
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
        <IonItem>
          <IonLabel>Категорія</IonLabel>
          <IonSelect
            value={selectedCategoryId}
            onIonChange={(e) => setSelectedCategoryId(e.detail.value)}
            interface="popover"
          >
            <IonSelectOption value="">Всі</IonSelectOption>
            {categories?.map((category) => (
              <IonSelectOption key={category.id} value={category.id}>
                {category.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </div>

      {Object.entries(groupedExpenses).map(([date, expenses]) => (
        <div key={date}>
          <div
            className="ion-padding"
            style={{ paddingBottom: "8px", paddingTop: "16px" }}
          >
            <h3 style={{ margin: 0, wordBreak: "break-word" }}>{date}</h3>
          </div>
          <IonList>
            {expenses.map((expense) => (
              <IonItemSliding key={expense.id}>
                <IonItem>
                  <IonLabel className="ion-text-wrap">
                    <h2 style={{ marginBottom: "8px" }}>
                      <IonBadge
                        color="medium"
                        style={{ maxWidth: "100%", whiteSpace: "normal" }}
                      >
                        {expense.category.name}
                      </IonBadge>
                    </h2>
                    {expense.description && (
                      <p style={{ wordBreak: "break-word", marginTop: "4px" }}>
                        {expense.description}
                      </p>
                    )}
                  </IonLabel>
                  <IonNote
                    slot="end"
                    color="primary"
                    style={{ flexShrink: 0, marginLeft: "8px" }}
                  >
                    {expense.amount.toFixed(2)} ₴
                  </IonNote>
                </IonItem>

                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => handleDelete(expense.id, expense.carId)}
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
