import { Card, CardBody } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { selectFiche } from "../features/ficheSlice";
import { useLiveQuery } from "dexie-react-hooks";
import { getFlashcardsFromFiche } from "../database/flashcard";

export default function FicheCard({ name, description, fiche }) {
  const flashcards = useLiveQuery(() => getFlashcardsFromFiche(fiche.id));
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleDetails = () => {
    dispatch(selectFiche(fiche));
    navigate(`/fiche/${fiche.id}`);
  };

  return (
    <>
      <Card
        shadow="sm"
        radius="sm"
        className="border border-divider/50"
      >
        <CardBody 
          className="px-4 py-3 cursor-pointer transition-opacity active:opacity-70"
          onClick={handleDetails}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <p className="font-semibold text-foreground">{name}</p>
              {description && (
                <p className="text-xs text-foreground/50">{description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-5">
            <p className="text-sm font-light text-foreground">
              Cartes :{" "}
              <span className="font-semibold">{flashcards?.length}</span>
            </p>
            <p className="text-sm font-light text-foreground">
              A revoir :{" "}
              <span className="font-semibold text-danger">
                {fiche.countErrors}
              </span>
            </p>
            <p className="text-sm font-light text-foreground">
              Maîtrisées :{" "}
              <span className="font-semibold text-success">
                {flashcards?.filter((flashcard) => flashcard.desactive).length}
              </span>
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
