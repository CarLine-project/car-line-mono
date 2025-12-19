import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { IonText } from "@ionic/react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";
import { useHistory } from "react-router-dom";
import { Input, Button } from "../../../shared/ui";

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
      history.push("/tabs/home");
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
        placeholder="Мінімум 8 символів"
        register={register("password")}
        error={errors.password?.message}
        required
      />

      <Input
        label="Ім'я (необов'язково)"
        type="text"
        placeholder="Ваше ім'я"
        register={register("name")}
        error={errors.name?.message}
      />

      <Input
        label="Телефон (необов'язково)"
        type="tel"
        placeholder="+380XXXXXXXXX"
        register={register("phone")}
        error={errors.phone?.message}
      />

      {registerMutation.isError && (
        <IonText color="danger" className="text-sm">
          Помилка реєстрації. Спробуйте ще раз.
        </IonText>
      )}
      <div className="flex justify-center">
        <Button
          type="submit"
          loading={registerMutation.isPending}
          className="mt-6"
        >
          Зареєструватися
        </Button>
      </div>
    </form>
  );
};
