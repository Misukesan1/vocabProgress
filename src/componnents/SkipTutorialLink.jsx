import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { showAlert } from "../features/alertSlice";
import { skipTutorial } from "../utils/onboarding";

/**
 * « Découvrir l'appli par moi-même » (bienvenue et premiers pas) : passe le
 * tutoriel, déverrouille l'app. Le récap n'étant pas vu, on rappelle l'essentiel :
 * les données ne vivent que sur cet appareil, et le mode d'emploi est dans les Options.
 */
export default function SkipTutorialLink() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const skip = () => {
    skipTutorial();
    dispatch(
      showAlert({
        message: "Mode d'emploi et sauvegarde de tes données (elles restent sur cet appareil) : dans les Options (⚙).",
        type: "success",
        long: true,
      }),
    );
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={skip}
      className="neu-focusable self-center rounded-md px-1 text-sm font-medium text-neutral-500 hover:text-primary dark:text-neutral-400"
    >
      Découvrir l'appli par moi-même
    </button>
  );
}
