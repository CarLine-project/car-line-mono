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
} from "@ionic/react";
import { trash } from "ionicons/icons";
import { useExpenseList, useDeleteExpense } from "../api/expenses.queries";
import { useState } from "react";

interface ExpensesListProps {
  carId: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export const ExpensesList = ({
  carId,
  categoryId,
  from,
  to,
}: ExpensesListProps) => {
  const [page] = useState(1);
  const { data, isLoading } = useExpenseList(carId, {
    page,
    categoryId,
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
      <div className="ion-text-center ion-padding">
        <p>Немає витрат</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
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
                    onClick={() => handleDelete(expense.id)}
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
