import { Alert } from "@heroui/react";
import { useDispatch } from "react-redux";
import { hideAlert } from "../features/alertSlice";

export default function AlertContent({ message, style, isVisible }) {
    
  const dispatch = useDispatch();

  return (
    <Alert
      color={style}
      title={message}
      radius="none"
      isClosable
      isVisible={isVisible}
      onClose={() => dispatch(hideAlert())}
    />
  );
}
