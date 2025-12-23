import { useState } from "react";
import { IonButton, IonPage, IonContent, useIonToast } from "@ionic/react";
import { ReceiptUpload, ReceiptPhoto } from "./receipt-upload";

export const BasicExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);

  return <ReceiptUpload maxPhotos={5} onPhotosChange={setPhotos} />;
};

export const FormValidationExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [presentToast] = useIonToast();

  const handleSubmit = () => {
    const processing = photos.filter((p) => p.status === "processing");
    if (processing.length > 0) {
      presentToast({
        message: "Зачекайте, фото ще обробляються...",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    const errors = photos.filter((p) => p.status === "error");
    if (errors.length > 0) {
      presentToast({
        message: `Видаліть ${errors.length} фото з помилками`,
        duration: 2000,
        color: "danger",
      });
      return;
    }

    const successPhotos = photos.filter((p) => p.status === "success");
    console.log("Готові до відправки:", successPhotos);

    presentToast({
      message: `✅ Відправлено ${successPhotos.length} чеків`,
      duration: 2000,
      color: "success",
    });
  };

  return (
    <>
      <ReceiptUpload maxPhotos={5} onPhotosChange={setPhotos} />
      <IonButton onClick={handleSubmit}>Зберегти</IonButton>
    </>
  );
};

export const DisabledDuringLoadingExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Форму відправлено з фото:", photos);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ReceiptUpload
        maxPhotos={5}
        onPhotosChange={setPhotos}
        disabled={isLoading}
      />
      <IonButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Збереження..." : "Зберегти"}
      </IonButton>
    </>
  );
};

export const CustomLimitExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);

  return (
    <>
      <h3>Максимум 3 фото</h3>
      <ReceiptUpload maxPhotos={3} onPhotosChange={setPhotos} />

      <p>Завантажено: {photos.length} / 3</p>
    </>
  );
};

export const WithStatisticsExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);

  const stats = {
    processing: photos.filter((p) => p.status === "processing").length,
    success: photos.filter((p) => p.status === "success").length,
    error: photos.filter((p) => p.status === "error").length,
    totalSize: photos.reduce((sum, p) => sum + p.size, 0),
  };

  return (
    <>
      <ReceiptUpload maxPhotos={5} onPhotosChange={setPhotos} />

      <div style={{ marginTop: "16px" }}>
        <h4>Статистика:</h4>
        <ul>
          <li>Обробляється: {stats.processing}</li>
          <li>Успішно: {stats.success}</li>
          <li>Помилки: {stats.error}</li>
          <li>
            Загальний розмір: {(stats.totalSize / 1024 / 1024).toFixed(2)} MB
          </li>
        </ul>
      </div>
    </>
  );
};

interface ExpenseFormData {
  amount: number;
  description: string;
  categoryId: string;
}

export const FullFormIntegrationExample = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    description: "",
    categoryId: "",
  });
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [presentToast] = useIonToast();

  const canSubmit = () => {
    const hasProcessing = photos.some((p) => p.status === "processing");
    const hasErrors = photos.some((p) => p.status === "error");
    return !hasProcessing && !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit()) {
      presentToast({
        message: "Дочекайтесь обробки всіх фото",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    const successPhotos = photos.filter((p) => p.status === "success");

    // Тут відправка на бекенд
    console.log({
      ...formData,
      receipts: successPhotos.map((p) => ({
        id: p.id,
        dataUrl: p.dataUrl,
        fileName: p.fileName,
      })),
    });

    presentToast({
      message: "✅ Витрату збережено!",
      duration: 2000,
      color: "success",
    });
  };

  return (
    <IonPage>
      <IonContent>
        <form onSubmit={handleSubmit}>
          {/* Інші поля форми */}
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value),
              })
            }
            placeholder="Сума"
          />

          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Опис"
          />

          {/* Компонент завантаження чеків */}
          <ReceiptUpload maxPhotos={5} onPhotosChange={setPhotos} />

          {/* Кнопка відправки */}
          <IonButton type="submit" expand="block" disabled={!canSubmit()}>
            Зберегти витрату
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

// ============================================================================
// ПРИКЛАД 7: Реакція на зміни статусу
// ============================================================================

export const StatusChangeReactionExample = () => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [presentToast] = useIonToast();

  const handlePhotosChange = (newPhotos: ReceiptPhoto[]) => {
    // Перевірка, чи з'явились нові фото з помилками
    const newErrors = newPhotos.filter((p) => p.status === "error");
    const oldErrors = photos.filter((p) => p.status === "error");

    if (newErrors.length > oldErrors.length) {
      presentToast({
        message: "⚠️ Деякі фото не пройшли валідацію",
        duration: 2500,
        color: "warning",
      });
    }

    // Перевірка, чи всі фото успішно оброблені
    const allProcessed =
      newPhotos.length > 0 && newPhotos.every((p) => p.status !== "processing");
    const hadProcessing = photos.some((p) => p.status === "processing");

    if (allProcessed && hadProcessing) {
      const successCount = newPhotos.filter(
        (p) => p.status === "success"
      ).length;
      presentToast({
        message: `✅ Оброблено ${successCount} фото`,
        duration: 2000,
        color: "success",
      });
    }

    setPhotos(newPhotos);
  };

  return <ReceiptUpload maxPhotos={5} onPhotosChange={handlePhotosChange} />;
};
