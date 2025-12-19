import React, { useState } from "react";
import { IonItem, IonLabel, IonInput, IonText } from "@ionic/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps {
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  placeholder,
  register,
  error,
  required = false,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? "#2196F3" : "#90CAF9"; // medium-blue : light-blue

  return (
    <div className={`mb-4 ${className}`}>
      <IonItem
        className="bg-white rounded-lg shadow-sm"
        style={{
          border: `2px solid ${borderColor}`,
          transition: "border-color 0.2s ease-in-out",
        }}
      >
        <IonLabel position="stacked" className="text-text-primary font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </IonLabel>
        <IonInput
          type={type}
          {...register}
          placeholder={placeholder}
          className="text-text-primary"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </IonItem>
      {error && (
        <IonText color="danger" className="text-sm mt-1 block">
          {error}
        </IonText>
      )}
    </div>
  );
};
