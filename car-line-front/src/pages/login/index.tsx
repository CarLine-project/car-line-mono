import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { LoginForm } from "../../features/auth/ui/login-form";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Вхід</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-md mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">Вхід в систему</h1>
          <LoginForm />
          <div className="mt-4 text-center">
            <Link to="/register" className="text-primary">
              Немає акаунту? Зареєструватися
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
