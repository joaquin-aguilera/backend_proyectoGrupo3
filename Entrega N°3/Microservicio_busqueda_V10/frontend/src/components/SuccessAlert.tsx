import { Alert, AlertProps } from "@mui/material";
import React from "react";

interface SuccessAlertProps extends Omit<AlertProps, "children"> {
  message: string;
  onClose?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onClose, ...props }) => {
  return (
    <Alert onClose={onClose} severity="success" {...props}>
      {message}
    </Alert>
  );
};

export default SuccessAlert;
