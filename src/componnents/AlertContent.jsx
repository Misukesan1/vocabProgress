import { Alert } from "@heroui/react";
import { useDispatch } from "react-redux";
import { hideAlert } from "../features/alertSlice";

export default function AlertContent({ message, style, isVisible }) {
    
  const dispatch = useDispatch();

  return (
    <Alert
      className="fixed top-16 left-0 right-0 z-50"
      color={style}
      title={message}
      radius="none"
      isClosable
      isVisible={isVisible}
      onClose={() => dispatch(hideAlert())}
    />
  );
}
