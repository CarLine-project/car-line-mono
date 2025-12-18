import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import { useAuthStore } from "../../features/auth/model/auth.store";
import { useHistory } from "react-router-dom";

const HomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Головна</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-md mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-4">Ласкаво просимо!</h1>
          {user && (
            <div className="mb-4">
              <p className="text-lg">Email: {user.email}</p>
              {user.name && <p className="text-lg">Ім'я: {user.name}</p>}
              {user.phone && <p className="text-lg">Телефон: {user.phone}</p>}
            </div>
          )}
          <IonButton expand="block" onClick={handleLogout} color="danger">
            Вийти
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
