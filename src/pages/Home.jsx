import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useLiveQuery } from "dexie-react-hooks";
import BoxContent from "../componnents/BoxContent";
import { deleteProfile, getProfiles } from "../database/profile";
import { selectProfile } from "../features/profileSlice";
import { useSelector, useDispatch } from "react-redux";
import ModalProfile from "../componnents/ModalProfile";
import { Pencil, Trash } from "lucide-react";
import ModalConfirm from "../componnents/ModalConfirm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { showAlert } from "../features/alertSlice";
import { testingFlashcard } from "../tests/testFlashcard";

export default function Home() {

  const profils = useLiveQuery(() => getProfiles());
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const [isNewProfile, setIsNewProfile] = useState(true);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // modal du profil
  const {
    isOpen: isOpenProfile,
    onOpen: onOpenProfile,
    onOpenChange: onOpenChangeProfile,
  } = useDisclosure();

  // modal de confirmation
  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onOpenChange: onOpenChangeConfirm,
  } = useDisclosure();

  return (
    <>

      {/* Aucun profil crée */}
      {profils?.length === 0 && (
        <BoxContent>
          <p className="text-center">Aucuns profils trouvés.</p>
          <Button
            onPress={onOpenProfile}
            color="primary"
            radius="full"
            className="mt-2 mx-auto px-6"
          >
            Nouveau profil
          </Button>
        </BoxContent>
      )}

      {/* Aucun profil sélectionné */}
      {!selectedProfile && profils?.length > 0 && (
        <BoxContent>
          <p className="text-center">Sélectionnez un profil</p>
          <Dropdown>
            <DropdownTrigger>
              <Button
                radius="full"
                color="primary"
                size="sm"
                className="mt-2"
              >
                {selectedProfile || "Choisir ▾"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profils"
              emptyContent="Aucun profil créé"
              variant="light"
              color="primary"
            >
              {/* Affiche la liste des profils dans le menu dropdown */}
              {profils?.map((profil) => (
                <DropdownItem
                  key={profil.id}
                  onPress={(e) => dispatch(selectProfile(profil))}
                >
                  {profil.name}
                </DropdownItem>
              ))}

            </DropdownMenu>
          </Dropdown>
          <Button
            onPress={() => {
              setIsNewProfile(true);
              onOpenProfile();
            }}
            size="sm"
            color="secondary"
            radius="full"
            className="mt-2"
          >
            Créer un nouveau profil
          </Button>
        </BoxContent>
      )}

      {/* Profil sélectionné */}
      {selectedProfile && (
        <BoxContent>
          <div className="flex flex-col justify-center items-center">
            <p className="text-2xl text-center mb-2">
              Bonjour
              <span className="font-bold"> {selectedProfile.name}</span>
            </p>
            <div className="flex gap-2">
              <Button
                onPress={() => {
                  setIsNewProfile(false);
                  onOpenProfile();
                }}
                size="sm"
                isIconOnly
                radius="full"
              >
                <Pencil size={17} />
              </Button>
              <Button
                onPress={onOpenConfirm}
                size="sm"
                isIconOnly
                color="danger"
                radius="full"
              >
                <Trash size={17} />
              </Button>
            </div>
          </div>

          <BoxContent>
            <p>Informations du profil.</p>
            {/* a remplir plus tard */}
          </BoxContent>

          <Button
            onPress={() => navigate("/fiches")}
            size="sm"
            color="primary"
            radius="full"
            className="mt-2"
          >
            Consulter ses fiches
          </Button>
          <Button
            onPress={() => {
              setIsNewProfile(true);
              onOpenProfile();
            }}
            size="sm"
            color="secondary"
            radius="full"
            className="mt-2"
          >
            Créer un nouveau profil
          </Button>
        </BoxContent>
      )}

      <ModalProfile
        isOpen={isOpenProfile}
        onOpenChange={onOpenChangeProfile}
        profile={selectedProfile}
        isNewProfile={isNewProfile}
      />

      <ModalConfirm
        isOpen={isOpenConfirm}
        onOpenChange={onOpenChangeConfirm}
        message={`Etes-vous sur de vouloir supprimer ce profil (${selectedProfile.name})?`}
        onConfirm={() => {
          deleteProfile(selectedProfile.id);
          dispatch(selectProfile(null));
          dispatch(showAlert({ message: "Profil supprimé.", type: "success" }));
        }}
      />
    </>
  );
}
