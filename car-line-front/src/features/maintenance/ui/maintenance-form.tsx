import {
  IonButton,
  IonSpinner,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../shared/ui/input";
import { CreateMaintenanceDto } from "../model/types";

const maintenanceSchema = z.object({
  serviceType: z.string().min(1, "Тип робіт обов'язковий"),
  mileageAtService: z.number().min(0, "Пробіг не може бути від'ємним"),
  serviceDate: z.string().min(1, "Дата обов'язкова"),
  cost: z.number().min(0, "Вартість не може бути від'ємною"),
  description: z.string().optional(),
});

const SERVICE_TYPES = [
  { value: "oil_change", label: "Заміна олії" },
  { value: "filters", label: "Фільтри" },
  { value: "brakes", label: "Гальма" },
  { value: "tires", label: "Шини" },
  { value: "full_service", label: "Повне ТО" },
  { value: "other", label: "Інше" },
];

interface MaintenanceFormProps {
  onSubmit: (data: CreateMaintenanceDto) => Promise<void>;
  isLoading?: boolean;
  currentMileage?: number;
}

export const MaintenanceForm = ({
  onSubmit,
  isLoading = false,
  currentMileage,
}: MaintenanceFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMaintenanceDto>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      serviceType: "",
      mileageAtService: currentMileage || 0,
      serviceDate: new Date().toISOString().split("T")[0],
      cost: 0,
      description: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ion-padding">
      <div className="ion-margin-bottom">
        <label>Тип робіт *</label>
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <IonSelect
              value={field.value}
              onIonChange={(e) => field.onChange(e.detail.value)}
              placeholder="Виберіть тип робіт"
            >
              {SERVICE_TYPES.map((type) => (
                <IonSelectOption key={type.value} value={type.value}>
                  {type.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          )}
        />
        {errors.serviceType && (
          <p
            className="ion-padding-start"
            style={{ color: "var(--ion-color-danger)" }}
          >
            {errors.serviceType.message}
          </p>
        )}
      </div>

      <Input
        label="Пробіг на момент ТО (км)"
        type="number"
        placeholder="50000"
        error={errors.mileageAtService?.message}
        {...register("mileageAtService", { valueAsNumber: true })}
      />

      <Input
        label="Дата обслуговування"
        type="date"
        error={errors.serviceDate?.message}
        {...register("serviceDate")}
      />

      <Input
        label="Вартість (₴)"
        type="number"
        step="0.01"
        placeholder="1500.00"
        error={errors.cost?.message}
        {...register("cost", { valueAsNumber: true })}
      />

      <Input
        label="Опис (необов'язково)"
        placeholder="Додаткова інформація"
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
