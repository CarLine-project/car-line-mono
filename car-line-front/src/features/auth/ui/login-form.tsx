import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { IonButton, IonItem, IonLabel, IonInput, IonText } from "@ionic/react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";
import { useHistory } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const history = useHistory();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      history.push("/home");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
          placeholder="Введіть пароль"
        />
        {errors.password && (
          <IonText color="danger" className="text-sm">
            {errors.password.message}
          </IonText>
        )}
      </IonItem>

      {loginMutation.isError && (
        <IonText color="danger" className="text-sm">
          Помилка входу. Перевірте дані.
        </IonText>
      )}

      <IonButton
        type="submit"
        expand="block"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Вхід..." : "Увійти"}
      </IonButton>
    </form>
  );
};
