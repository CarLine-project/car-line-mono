import { useState } from "react";
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
  IonChip,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import {
  camera,
  images,
  closeCircle,
  checkmarkCircle,
  alertCircle,
  hourglass,
} from "ionicons/icons";

export type ReceiptPhotoStatus = "processing" | "success" | "error";

export interface ReceiptPhoto {
  id: string;
  dataUrl: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
  status: ReceiptPhotoStatus;
  errorMessage?: string;
}

interface ReceiptUploadProps {
  maxPhotos?: number;
  onPhotosChange?: (photos: ReceiptPhoto[]) => void;
  disabled?: boolean;
}

export const ReceiptUpload = ({
  maxPhotos = 5,
  onPhotosChange,
  disabled = false,
}: ReceiptUploadProps) => {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<ReceiptPhoto | null>(null);

  const validateReceipt = (
    fileName: string,
    size: number
  ): { isValid: boolean; error?: string } => {
    // Simulate various validation errors (30% chance of error)
    const shouldFail = Math.random() < 0.3;

    if (!shouldFail) {
      return { isValid: true };
    }

    const errors = [
      "Фото занадто розмите. Спробуйте зробити чіткіше знімок",
      "Не вдалося розпізнати чек. Переконайтесь, що весь чек видно на фото",
      "Погана якість зображення. Використайте краще освітлення",
      "Чек занадто темний. Зробіть фото при кращому освітленні",
      "Не вдалося знайти суму на чеку. Перевірте, чи весь чек на фото",
      "Формат зображення не підтримується для розпізнавання",
    ];

    const randomError = errors[Math.floor(Math.random() * errors.length)];
    return { isValid: false, error: randomError };
  };

  const processPhoto = async (photo: ReceiptPhoto): Promise<ReceiptPhoto> => {
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    // Validate receipt
    const validation = validateReceipt(photo.fileName, photo.size);

    return {
      ...photo,
      status: validation.isValid ? "success" : "error",
      errorMessage: validation.error,
    };
  };

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const newPhotos: ReceiptPhoto[] = [];

      for (let i = 0; i < files.length && photos.length + i < maxPhotos; i++) {
        const file = files[i];
        const dataUrl = await fileToDataUrl(file);

        const photo: ReceiptPhoto = {
          id: `${Date.now()}_${i}`,
          dataUrl,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date(),
          status: "processing",
        };

        newPhotos.push(photo);
      }

      // Add photos with processing status
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      // Process each photo
      setIsProcessing(false);

      // Process photos one by one
      for (const photo of newPhotos) {
        const processedPhoto = await processPhoto(photo);

        setPhotos((currentPhotos) => {
          const updated = currentPhotos.map((p) =>
            p.id === photo.id ? processedPhoto : p
          );
          onPhotosChange?.(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error("Error processing photos:", error);
      setIsProcessing(false);
    } finally {
      // Reset input
      event.target.value = "";
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== id);
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="receipt-upload ion-margin-bottom">
      <label style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
        Чеки (фото)
      </label>

      {/* Upload buttons */}
      {canAddMore && !disabled && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <IonButton
            fill="outline"
            size="default"
            disabled={isProcessing}
            onClick={() => document.getElementById("camera-input")?.click()}
          >
            <IonIcon slot="start" icon={camera} />
            Камера
          </IonButton>

          <IonButton
            fill="outline"
            size="default"
            disabled={isProcessing}
            onClick={() => document.getElementById("gallery-input")?.click()}
          >
            <IonIcon slot="start" icon={images} />
            Галерея
          </IonButton>

          {/* Hidden file inputs */}
          <input
            id="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            style={{ display: "none" }}
            onChange={handleFileInput}
          />

          <input
            id="gallery-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <IonCard>
          <IonCardContent className="ion-text-center">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Завантаження зображень...</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      {/* Photos count info */}
      {photos.length > 0 && (
        <IonText color="medium">
          <p style={{ fontSize: "14px", margin: "0 0 12px 0" }}>
            Завантажено: {photos.length} / {maxPhotos}
          </p>
        </IonText>
      )}

      {/* Photos grid */}
      {photos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--ion-color-light-shade)",
              }}
            >
              {/* Photo preview */}
              <img
                src={photo.dataUrl}
                alt={photo.fileName}
                onClick={() => setPreviewPhoto(photo)}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  display: "block",
                  cursor: "pointer",
                }}
              />

              {/* Remove button */}
              {!disabled && (
                <button
                  onClick={() => removePhoto(photo.id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <IonIcon
                    icon={closeCircle}
                    style={{ color: "white", fontSize: "20px" }}
                  />
                </button>
              )}

              {/* Status indicator */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  right: "8px",
                }}
              >
                {photo.status === "processing" && (
                  <IonChip
                    color="warning"
                    style={{ height: "24px", fontSize: "12px" }}
                  >
                    <IonIcon icon={hourglass} />
                    <IonLabel>Обробка...</IonLabel>
                  </IonChip>
                )}
                {photo.status === "success" && (
                  <IonChip
                    color="success"
                    style={{ height: "24px", fontSize: "12px" }}
                  >
                    <IonIcon icon={checkmarkCircle} />
                    <IonLabel>Готово</IonLabel>
                  </IonChip>
                )}
                {photo.status === "error" && (
                  <IonChip
                    color="danger"
                    style={{ height: "24px", fontSize: "12px" }}
                  >
                    <IonIcon icon={alertCircle} />
                    <IonLabel>Помилка</IonLabel>
                  </IonChip>
                )}
              </div>

              {/* File info and error message */}
              <div
                style={{
                  padding: "8px",
                  background:
                    photo.status === "error"
                      ? "var(--ion-color-danger-tint)"
                      : "var(--ion-color-light)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={photo.fileName}
                >
                  {photo.fileName}
                </div>
                <div style={{ color: "var(--ion-color-medium)" }}>
                  {formatFileSize(photo.size)}
                </div>
                {photo.status === "error" && photo.errorMessage && (
                  <div
                    style={{
                      marginTop: "4px",
                      color: "var(--ion-color-danger)",
                      fontSize: "11px",
                      lineHeight: "1.3",
                    }}
                  >
                    {photo.errorMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && !isProcessing && (
        <IonCard>
          <IonCardContent className="ion-text-center">
            <IonIcon
              icon={images}
              style={{ fontSize: "48px", color: "var(--ion-color-medium)" }}
            />
            <IonText color="medium">
              <p>Фото чеків не завантажено</p>
              <p style={{ fontSize: "14px" }}>
                Натисніть кнопки вище, щоб додати фото
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      {/* Full-size preview modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            cursor: "pointer",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewPhoto(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IonIcon
              icon={closeCircle}
              style={{ color: "white", fontSize: "32px" }}
            />
          </button>

          {/* Photo title */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              color: "white",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {previewPhoto.fileName}
          </div>

          {/* Full-size image */}
          <img
            src={previewPhoto.dataUrl}
            alt={previewPhoto.fileName}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            }}
          />

          {/* Photo info */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "12px 24px",
              borderRadius: "8px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <span>{formatFileSize(previewPhoto.size)}</span>
            <span>•</span>
            {previewPhoto.status === "success" && (
              <span style={{ color: "var(--ion-color-success)" }}>
                ✓ Успішно оброблено
              </span>
            )}
            {previewPhoto.status === "processing" && (
              <span style={{ color: "var(--ion-color-warning)" }}>
                ⏳ Обробляється...
              </span>
            )}
            {previewPhoto.status === "error" && (
              <span style={{ color: "var(--ion-color-danger)" }}>
                ✗ {previewPhoto.errorMessage}
              </span>
            )}
          </div>

          {/* Tap to close hint */}
          <div
            style={{
              position: "absolute",
              top: "70px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
            }}
          >
            Натисніть, щоб закрити
          </div>
        </div>
      )}
    </div>
  );
};
