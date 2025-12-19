import React, { useState } from "react";
import { IonButton } from "@ionic/react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  expand?: "full" | "block";
  color?: "dark-blue" | "primary" | "light-blue" | "medium-blue";
  className?: string;
  size?: "small" | "default" | "large";
}

export const Button: React.FC<ButtonProps> = ({
  type = "button",
  children,
  onClick,
  disabled = false,
  loading = false,
  expand = "block",
  color = "dark-blue",
  className = "",
  size = "default",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    small: "h-9 text-sm",
    default: "h-12",
    large: "h-14 text-lg",
  };

  const borderColor = isFocused ? "#2196F3" : "#1976D2"; // medium-blue : dark-blue

  return (
    <IonButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      expand={expand}
      color={color}
      className={`${sizeClasses[size]} ${className} font-medium rounded-lg max-w-[200px]`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <span className="mr-2">⏳</span>
          Завантаження...
        </span>
      ) : (
        children
      )}
    </IonButton>
  );
};
