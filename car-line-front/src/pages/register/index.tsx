import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { RegisterForm } from "../../features/auth/ui/register-form";
import { Link } from "react-router-dom";
import { useIsAuthenticated } from "../../features/auth/model/auth.store";

const RegisterPage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace("/tabs/home");
    }
  }, [isAuthenticated, history]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white font-semibold">Реєстрація</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-md mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8 text-text-primary">
            Створити акаунт
          </h1>
          <RegisterForm />
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-medium-blue hover:text-dark-blue transition-colors font-medium"
            >
              Вже є акаунт? Увійти
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
