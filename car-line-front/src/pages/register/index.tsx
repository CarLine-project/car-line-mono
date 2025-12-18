import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { RegisterForm } from "../../features/auth/ui/register-form";
import { Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Реєстрація</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-md mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">Створити акаунт</h1>
          <RegisterForm />
          <div className="mt-4 text-center">
            <Link to="/login" className="text-primary">
              Вже є акаунт? Увійти
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
