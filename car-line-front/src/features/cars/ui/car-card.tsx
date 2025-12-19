import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
} from "@ionic/react";
import { speedometer, calendar, checkmarkCircle } from "ionicons/icons";
import { Car } from "../model/types";

interface CarCardProps {
  car: Car;
  onActivate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CarCard = ({
  car,
  onActivate,
  onEdit,
  onDelete,
}: CarCardProps) => {
  return (
    <IonCard style={{ margin: "16px", overflow: "hidden" }}>
      <IonCardHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IonCardTitle style={{ wordBreak: "break-word", flex: 1 }}>
            {car.make} {car.model}
          </IonCardTitle>
          {car.isActive && (
            <IonBadge
              color="success"
              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              <IonIcon icon={checkmarkCircle} /> Активне
            </IonBadge>
          )}
        </div>
        <IonCardSubtitle style={{ wordBreak: "break-word", marginTop: "8px" }}>
          Рік випуску: {car.year}
        </IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
              gap: "8px",
            }}
          >
            <IonIcon icon={speedometer} style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>
              Початковий пробіг: {car.initialMileage.toLocaleString()} км
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IonIcon icon={calendar} style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>
              Додано: {new Date(car.createdAt).toLocaleDateString("uk-UA")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {!car.isActive && onActivate && (
            <IonButton size="small" color="success" onClick={onActivate}>
              Зробити активним
            </IonButton>
          )}
          {onEdit && (
            <IonButton size="small" onClick={onEdit}>
              Редагувати
            </IonButton>
          )}
          {onDelete && (
            <IonButton size="small" color="danger" onClick={onDelete}>
              Видалити
            </IonButton>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};
