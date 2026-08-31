import { useLiveQuery } from "dexie-react-hooks";
import FicheCard from "../componnents/FicheCard";
import { getFichesFromProfile } from "../database/fiche";
import { useSelector } from "react-redux";
import { Button, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import ModalFiche from "../componnents/ModalFiche";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import FicheFilter from "../componnents/FicheFilter";
import ModalSearchFlashcard from "../componnents/ModalSearchFlashcard";

export default function Fiches() {
  const selectProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const fiches = useLiveQuery(
    () => (selectProfile ? getFichesFromProfile(selectProfile?.id) : null),
    [selectProfile],
  );
  const {
    isOpen: isOpenFicheModal,
    onOpen: onOpenFicheModal,
    onOpenChange: onOpenChangeFicheModal,
  } = useDisclosure();
  const {
    isOpen: isOpenSearchModal,
    onOpen: onOpenSearchModal,
    onOpenChange: onOpenChangeSearchModal,
  } = useDisclosure();
  const [filter, setFilter] = useState("recent");
  const [searchValue, setSearchValue] = useState("");
  const filteredFiche = fiches
    ?.slice()
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (filter === "recent") return b.id - a.id;
      if (filter === "ancien") return a.id - b.id;
      if (filter === "a-z") return a.name.localeCompare(b.name);
      if (filter === "z-a") return b.name.localeCompare(a.name);
      if (filter === "difficiles") return b.countErrors - a.countErrors;
    });

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedFiche) navigate(`/fiche/${selectedFiche.id}`);
  }, [selectedFiche]);

  if (selectedFiche) return null;

  return (
    <>
      {/* Retour vers la page home avec la liste des collections */}
      {selectProfile && (
        <Button
          size="sm"
          color="danger"
          radius="full"
          className="ml-3 w-fit"
          variant="light"
          startContent={<ArrowLeft size={16} />}
          onPress={() => navigate("/")}
        >
          Liste des collections
        </Button>
      )}

      {/* Affichage des infos de la collection */}
      {selectProfile && (
        <BoxContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold">{selectProfile?.name}</p>
              <p className="font-light">
                <span className="font-bold">{fiches?.length}</span>{" "}
                {fiches?.length === 1 ? "fiche" : "fiches"}
              </p>
            </div>
            <Button
              color="primary"
              radius="md"
              isIconOnly
              onPress={onOpenFicheModal}
            >
              <Plus size={18} />
            </Button>
          </div>
        </BoxContent>
      )}

      {/* Pas de collections sélectionnées */}
      {!selectProfile && (
        <div className="flex flex-col">
          <BoxContent>
            <p className="text-center">
              Sélectionnez une collection depuis l'accueil
            </p>
            <Button
              onPress={() => navigate("/")}
              size="sm"
              color="danger"
              radius="full"
              className="mt-3 mx-auto"
              startContent={<ArrowLeft size={15} />}
            >
              Accueil
            </Button>
          </BoxContent>
        </div>
      )}

      {/* Pas de fiches dans la collection */}
      {selectProfile && fiches?.length === 0 && (
        <div className="flex flex-col">
          <BoxContent>
            <div className="text-center">
              {/* <p className="font-bold">{selectProfile?.name}</p> */}
              <p className="font-light">
                Cette collection ne contient pas encore de fiches.
              </p>
            </div>
            <Button
              onPress={onOpenFicheModal}
              size="sm"
              color="primary"
              radius="full"
              className="mt-3 mx-auto"
              startContent={<Plus size={18} />}
            >
              Créer ma première fiche
            </Button>
          </BoxContent>
        </div>
      )}

      {/* Affichage des fiches de la collection sélectionnée */}
      {selectProfile && fiches?.length > 0 && (
        <div>
          {/* Recherche d'une carte parmi toutes les fiches */}
          <div className="mx-3 mt-3">
            <Button
              size="sm"
              color="secondary"
              variant="flat"
              radius="full"
              fullWidth
              startContent={<Search size={16} />}
              onPress={onOpenSearchModal}
            >
              Rechercher une carte parmi les fiches
            </Button>
          </div>

          {/* Filtre de recherche */}
          <BoxContent>
            <FicheFilter
              ficheList={fiches}
              filter={filter}
              onFilterChange={setFilter}
              searchValue={searchValue}
              onSearchValueChange={setSearchValue}
            />
          </BoxContent>

          {/* Affichage des fiches du profil sélectionné */}
          <div className="mt-3 mx-3 flex flex-col gap-2">
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
        </div>
      )}

      <ModalFiche
        isOpen={isOpenFicheModal}
        onOpenChange={onOpenChangeFicheModal}
      />

      {selectProfile && (
        <ModalSearchFlashcard
          isOpen={isOpenSearchModal}
          onOpenChange={onOpenChangeSearchModal}
          profileId={selectProfile.id}
        />
      )}
    </>
  );
}
