import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { IonButton, IonItem, IonLabel, IonInput, IonText } from "@ionic/react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";
import { useHistory } from "react-router-dom";

const registerSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(8, "Пароль має бути мінімум 8 символів"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const history = useHistory();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data);
      history.push("/home");
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <IonItem>
        <IonLabel position="stacked">Email</IonLabel>
        <IonInput
          type="email"
          {...register("email")}
          placeholder="your@email.com"
        />
        {errors.email && (
          <IonText color="danger" className="text-sm">
            {errors.email.message}
          </IonText>
        )}
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Пароль</IonLabel>
        <IonInput
          type="password"
          {...register("password")}
          placeholder="Мінімум 8 символів"
        />
        {errors.password && (
          <IonText color="danger" className="text-sm">
            {errors.password.message}
          </IonText>
        )}
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Ім'я (необов'язково)</IonLabel>
        <IonInput type="text" {...register("name")} placeholder="Ваше ім'я" />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Телефон (необов'язково)</IonLabel>
        <IonInput
          type="tel"
          {...register("phone")}
          placeholder="+380XXXXXXXXX"
        />
      </IonItem>

      {registerMutation.isError && (
        <IonText color="danger" className="text-sm">
          Помилка реєстрації. Спробуйте ще раз.
        </IonText>
      )}

      <IonButton
        type="submit"
        expand="block"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Реєстрація..." : "Зареєструватися"}
      </IonButton>
    </form>
  );
};
