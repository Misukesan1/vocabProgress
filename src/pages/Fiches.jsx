import { useLiveQuery } from "dexie-react-hooks";
import FicheCard from "../componnents/FicheCard";
import { getFichesFromProfile } from "../database/fiche";
import { useSelector } from "react-redux";
import { Button, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import ModalFiche from "../componnents/ModalFiche";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function Fiches() {
  const selectProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const fiches = useLiveQuery(
    () => (selectProfile ? getFichesFromProfile(selectProfile?.id) : null),
    [selectProfile],
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedFiche) navigate(`/fiche/${selectedFiche.id}`);
  }, []);

  if (selectedFiche) return null;

  return (
    <>
      {selectProfile ? (
        <BoxContent>
          <p className="text-center">{fiches?.length} fiches.</p>
          <Button
            onPress={onOpen}
            size="sm"
            color="primary"
            radius="full"
            className="mt-2"
          >
            Créer une nouvelle fiche
          </Button>
        </BoxContent>
      ) : (
        <BoxContent>
          <p className="text-center">
            Commencez par créer ou sélectionner un profil.
          </p>
          <Button
            onPress={() => navigate("/")}
            size="sm"
            color="danger"
            radius="full"
            className="mt-2 "
            startContent={<ArrowLeft size={15} />}
          >
            Retour
          </Button>
        </BoxContent>
      )}

      <div className="mt-3">
        {/* Affichage des fiches du profil sélectionné */}
        {selectProfile &&
          fiches &&
          fiches.length > 0 &&
          fiches?.map((fiche) => (
            <FicheCard
              key={fiche.id}
              name={fiche.name}
              description={fiche.description || "Pas de description."}
              fiche={fiche}
            />
          ))}
      </div>

      <ModalFiche isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
