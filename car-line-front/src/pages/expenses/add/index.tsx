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
import { ExpenseForm } from "../../../features/expenses/ui/expense-form";
import { useCreateExpense } from "../../../features/expenses/api/expenses.queries";
import { CreateExpenseDto } from "../../../features/expenses/model/types";

const ExpenseAddPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const createMutation = useCreateExpense();

  const handleSubmit = async (data: CreateExpenseDto) => {
    try {
      await createMutation.mutateAsync({ carId: id, data });
      presentToast({
        message: "Витрату успішно додано!",
        duration: 2000,
        color: "success",
      });
      history.goBack();
    } catch (error: any) {
      presentToast({
        message:
          error?.response?.data?.message || "Помилка при додаванні витрати",
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
          <IonTitle className="text-white">Додати витрату</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ExpenseForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </IonContent>
    </IonPage>
  );
};

export default ExpenseAddPage;
