import { IonButton, IonSpinner, IonSelect, IonSelectOption } from "@ionic/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../shared/ui/input";
import { CreateExpenseDto } from "../model/types";
import { useExpenseCategories } from "../api/expenses.queries";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Категорія обов'язкова"),
  amount: z.number().min(0, "Сума не може бути від'ємною"),
  expenseDate: z.string().min(1, "Дата обов'язкова"),
  description: z.string().optional(),
});

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseDto) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateExpenseDto>;
}

export const ExpenseForm = ({
  onSubmit,
  isLoading = false,
  defaultValues,
}: ExpenseFormProps) => {
  const { data: categories, isLoading: categoriesLoading } =
    useExpenseCategories();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateExpenseDto>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      categoryId: "",
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  if (categoriesLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ion-padding">
      <div className="ion-margin-bottom">
        <label>Категорія *</label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <IonSelect
              value={field.value}
              onIonChange={(e) => field.onChange(e.detail.value)}
              placeholder="Виберіть категорію"
            >
              {categories?.map((category) => (
                <IonSelectOption key={category.id} value={category.id}>
                  {category.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          )}
        />
        {errors.categoryId && (
          <p className="ion-padding-start" style={{ color: "var(--ion-color-danger)" }}>
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <Input
        label="Сума (₴)"
        type="number"
        step="0.01"
        placeholder="500.00"
        error={errors.amount?.message}
        {...register("amount", { valueAsNumber: true })}
      />

      <Input
        label="Дата"
        type="date"
        error={errors.expenseDate?.message}
        {...register("expenseDate")}
      />

      <Input
        label="Опис (необов'язково)"
        placeholder="Наприклад: Заправка в дорогу"
        error={errors.description?.message}
        {...register("description")}
      />

      <IonButton
        expand="block"
        type="submit"
        disabled={isLoading}
        className="ion-margin-top"
      >
        {isLoading ? <IonSpinner name="crescent" /> : "Зберегти"}
      </IonButton>
    </form>
  );
};
