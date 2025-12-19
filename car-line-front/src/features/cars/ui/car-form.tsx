import { IonButton, IonSpinner } from "@ionic/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../shared/ui/input";
import { CreateCarDto } from "../model/types";

const carSchema = z.object({
  make: z.string().min(1, "Марка обов'язкова"),
  model: z.string().min(1, "Модель обов'язкова"),
  year: z
    .number()
    .min(1900, "Рік має бути більше 1900")
    .max(new Date().getFullYear() + 1, "Невірний рік"),
  initialMileage: z.number().min(0, "Пробіг не може бути від'ємним"),
});

interface CarFormProps {
  onSubmit: (data: CreateCarDto) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateCarDto>;
}

export const CarForm = ({
  onSubmit,
  isLoading = false,
  defaultValues,
}: CarFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCarDto>({
    resolver: zodResolver(carSchema),
    defaultValues: defaultValues || {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      initialMileage: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ion-padding">
      <Input
        label="Марка"
        placeholder="Наприклад: Toyota"
        error={errors.make?.message}
        {...register("make")}
      />

      <Input
        label="Модель"
        placeholder="Наприклад: Camry"
        error={errors.model?.message}
        {...register("model")}
      />

      <Input
        label="Рік випуску"
        type="number"
        placeholder="2020"
        error={errors.year?.message}
        {...register("year", { valueAsNumber: true })}
      />

      <Input
        label="Початковий пробіг (км)"
        type="number"
        placeholder="50000"
        error={errors.initialMileage?.message}
        {...register("initialMileage", { valueAsNumber: true })}
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
