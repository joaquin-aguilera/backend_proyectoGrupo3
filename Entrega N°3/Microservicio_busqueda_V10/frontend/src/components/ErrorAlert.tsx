import { Alert, AlertProps } from "@mui/material";
import React from "react";

interface ErrorAlertProps extends Omit<AlertProps, "children"> {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose, ...props }) => {
  return (
    <Alert onClose={onClose} severity="error" {...props}>
      {message}
    </Alert>
  );
};

export default ErrorAlert;
