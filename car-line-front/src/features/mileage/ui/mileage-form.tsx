import { IonButton, IonSpinner } from "@ionic/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../shared/ui/input";
import { CreateMileageDto } from "../model/types";

const mileageSchema = z.object({
  value: z.number().min(0, "Пробіг не може бути від'ємним"),
  recordedAt: z.string().min(1, "Дата обов'язкова"),
  comment: z.string().optional(),
});

interface MileageFormProps {
  onSubmit: (data: CreateMileageDto) => Promise<void>;
  isLoading?: boolean;
  currentMileage?: number;
}

export const MileageForm = ({
  onSubmit,
  isLoading = false,
  currentMileage,
}: MileageFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMileageDto>({
    resolver: zodResolver(mileageSchema),
    defaultValues: {
      value: currentMileage || 0,
      recordedAt: new Date().toISOString().split("T")[0],
      comment: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ion-padding">
      <Input
        label="Пробіг (км)"
        type="number"
        placeholder="50000"
        error={errors.value?.message}
        {...register("value", { valueAsNumber: true })}
      />

      {currentMileage && (
        <p className="ion-padding-start">
          <small>Поточний пробіг: {currentMileage.toLocaleString()} км</small>
        </p>
      )}

      <Input
        label="Дата"
        type="date"
        error={errors.recordedAt?.message}
        {...register("recordedAt")}
      />

      <Input
        label="Коментар (необов'язково)"
        placeholder="Наприклад: Поїздка до моря"
        error={errors.comment?.message}
        {...register("comment")}
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
