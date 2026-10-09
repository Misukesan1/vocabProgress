import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { hideAlert } from "../../features/alertSlice";
import { runUndo } from "../../utils/undo";

const DURATION_MS = 3000;

/**
 * Notification des actions (showAlert), affichée au-dessus de la barre du bas
 * et masquée automatiquement après quelques secondes.
 */
export default function AlertToast() {
  const dispatch = useDispatch();
  const { message, type, isVisible, long, undoable } = useSelector((state) => state.alert);
  const isError = type === "danger";
  const duration = isError || long || undoable ? DURATION_MS * 2 : DURATION_MS;

  // Relancé à chaque nouveau message, même identique au précédent
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => dispatch(hideAlert()), duration);
    return () => clearTimeout(timer);
  }, [isVisible, message, duration, dispatch]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div
        role={isError ? "alert" : "status"}
        className={`neu-raised neu-shape-control pointer-events-auto flex max-w-md items-center gap-3 px-4 py-3 text-sm font-medium ${
          isError ? "text-danger" : "text-success"
        }`}
      >
        {isError ? <CircleAlert size={18} className="shrink-0" /> : <CircleCheck size={18} className="shrink-0" />}
        <span className="text-neutral-700 dark:text-neutral-200">{message}</span>
        {undoable && (
          <button
            type="button"
            onClick={() => {
              runUndo();
              dispatch(hideAlert());
            }}
            className="neu-focusable shrink-0 rounded-md px-1 font-semibold text-primary"
          >
            Annuler
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch(hideAlert())}
          aria-label="Fermer la notification"
          className="neu-focusable -mr-1 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
