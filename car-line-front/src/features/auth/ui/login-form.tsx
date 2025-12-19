import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { IonText } from "@ionic/react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";
import { useHistory } from "react-router-dom";
import { Input, Button } from "../../../shared/ui";

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
      history.push("/tabs/home");
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
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        register={register("email")}
        error={errors.email?.message}
        required
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="Введіть пароль"
        register={register("password")}
        error={errors.password?.message}
        required
      />

      {loginMutation.isError && (
        <IonText color="danger" className="text-sm">
          Помилка входу. Перевірте дані.
        </IonText>
      )}

      <Button type="submit" loading={loginMutation.isPending} className="mt-6">
        Увійти
      </Button>
    </form>
  );
};
