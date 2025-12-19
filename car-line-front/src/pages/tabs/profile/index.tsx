import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useAuthStore } from "../../../features/auth/model/auth.store";
import { useHistory } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white">Профіль</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h2 style={{ marginBottom: "8px" }}>Email</h2>
              <p style={{ wordBreak: "break-word" }}>
                {user?.email || "Не вказано"}
              </p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h2 style={{ marginBottom: "8px" }}>Ім'я</h2>
              <p style={{ wordBreak: "break-word" }}>
                {user?.name || "Не вказано"}
              </p>
            </IonLabel>
          </IonItem>
        </IonList>

        <div className="ion-padding">
          <IonButton expand="block" color="danger" onClick={handleLogout}>
            Вийти
          </IonButton>
        </div>

        <div className="ion-padding ion-text-center">
          <p className="ion-text-center">
            <small>Версія 1.0.0</small>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
