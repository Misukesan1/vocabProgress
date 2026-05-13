import { useLiveQuery } from "dexie-react-hooks";
import FicheCard from "../componnents/FicheCard";
import { getFichesFromProfile } from "../database/fiche";
import { useSelector } from "react-redux";
import { Button, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import ModalFiche from "../componnents/ModalFiche";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import FicheFilter from "../componnents/FicheFilter";

export default function Fiches() {
  const selectProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const fiches = useLiveQuery(
    () => (selectProfile ? getFichesFromProfile(selectProfile?.id) : null),
    [selectProfile],
  );
  const { isOpen: isOpenFicheModal, onOpen: onOpenFicheModal, onOpenChange: onOpenChangeFicheModal } = useDisclosure();
  const [filter, setFilter] = useState("recent")
  const [searchValue, setSearchValue] = useState("")
  const filteredFiche = fiches?.slice().filter((item) => {
    return item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchValue.toLowerCase())
  }).sort((a,b) => {
    if (filter === "recent") return b.id - a.id
    if (filter === "ancien") return a.id - b.id
    if (filter === "a-z") return a.name.localeCompare(b.name)
    if (filter === "z-a") return b.name.localeCompare(a.name)
    if (filter === "difficiles") return b.countErrors - a.countErrors
  })

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedFiche) navigate(`/fiche/${selectedFiche.id}`);
  }, [selectedFiche]);

  if (selectedFiche) return null;

  return (
    <>
      {selectProfile ? (
        <BoxContent>
          <p className="text-center">{fiches?.length} fiches.</p>
          <Button
            onPress={onOpenFicheModal}
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
            Commencez par créer ou sélectionner une collection.
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

      {/* Filtre de recherche */}
      {fiches?.length > 0 &&
        <BoxContent>
          <FicheFilter 
            ficheList={fiches}
            filter={filter} 
            onFilterChange={setFilter}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
          />
        </BoxContent>
      }

      <div className="mt-3 mx-3">
        {/* Affichage des fiches du profil sélectionné */}
        {selectProfile &&
          filteredFiche &&
          filteredFiche.length > 0 &&
          filteredFiche?.map((fiche) => (
            <FicheCard
              key={fiche.id}
              name={fiche.name}
              description={fiche.description || "Pas de description."}
              fiche={fiche}
            />
          ))}
      </div>

      <ModalFiche isOpen={isOpenFicheModal} onOpenChange={onOpenChangeFicheModal}/>

    </>
  );
}
