import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonButton,
  useIonToast,
} from "@ionic/react";
import { useState } from "react";
import { ReceiptUpload, ReceiptPhoto } from "../../shared/ui";

const ReceiptUploadDemo = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [presentToast] = useIonToast();

  const handlePhotosChange = (newPhotos: ReceiptPhoto[]) => {
    setPhotos(newPhotos);
    console.log("Photos updated:", newPhotos);
  };

  const handleProcessPhotos = () => {
    if (photos.length === 0) {
      presentToast({
        message: "Спочатку додайте фото чеків",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    const processingPhotos = photos.filter((p) => p.status === "processing");
    if (processingPhotos.length > 0) {
      presentToast({
        message: "Зачекайте, фото ще обробляються...",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    const successPhotos = photos.filter((p) => p.status === "success");
    const errorPhotos = photos.filter((p) => p.status === "error");

    if (errorPhotos.length > 0) {
      presentToast({
        message: `⚠️ ${errorPhotos.length} фото з помилками. Виправте їх перед відправкою`,
        duration: 3000,
        color: "warning",
      });
      return;
    }

    presentToast({
      message: `✅ Відправлено ${successPhotos.length} чеків на обробку!`,
      duration: 3000,
      color: "success",
    });
  };

  const handleClearAll = () => {
    setPhotos([]);
    presentToast({
      message: "Всі фото видалено",
      duration: 2000,
      color: "medium",
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-white">Демо: Завантаження чеків</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Інформація</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>
                  Цей компонент дозволяє завантажувати фото чеків для подальшої
                  обробки.
                </p>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  <li>Зробити фото через камеру</li>
                  <li>Вибрати з галереї</li>
                  <li>Додати до 5 фото</li>
                  <li>Переглянути завантажені чеки</li>
                  <li>Видалити непотрібні фото</li>
                </ul>
              </IonText>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Завантажити чеки</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <ReceiptUpload
                maxPhotos={5}
                onPhotosChange={handlePhotosChange}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  gap: "8px",
                  flexDirection: "column",
                }}
              >
                <IonButton
                  expand="block"
                  onClick={handleProcessPhotos}
                  disabled={photos.length === 0}
                >
                  Обробити чеки ({photos.length})
                </IonButton>

                {photos.length > 0 && (
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="danger"
                    onClick={handleClearAll}
                  >
                    Очистити все
                  </IonButton>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {photos.length > 0 && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Статистика обробки</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      background: "var(--ion-color-warning-tint)",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {photos.filter((p) => p.status === "processing").length}
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                      Обробляється
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      background: "var(--ion-color-success-tint)",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {photos.filter((p) => p.status === "success").length}
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                      Успішно
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      background: "var(--ion-color-danger-tint)",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {photos.filter((p) => p.status === "error").length}
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                      Помилки
                    </div>
                  </div>
                </div>

                <IonText>
                  <p>
                    <strong>Всього фото:</strong> {photos.length}
                  </p>
                  <p>
                    <strong>Загальний розмір:</strong>{" "}
                    {(
                      photos.reduce((sum, p) => sum + p.size, 0) /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </IonText>

                {photos.filter((p) => p.status === "error").length > 0 && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "var(--ion-color-danger-tint)",
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                      ⚠️ Фото з помилками:
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        paddingLeft: "20px",
                        margin: 0,
                      }}
                    >
                      {photos
                        .filter((p) => p.status === "error")
                        .map((photo) => (
                          <li key={photo.id} style={{ marginBottom: "4px" }}>
                            <strong>{photo.fileName}</strong>
                            <br />
                            {photo.errorMessage}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReceiptUploadDemo;
