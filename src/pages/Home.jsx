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
import { testingProfile } from "../tests/testProfile";
import { deleteProfile, getProfiles } from "../database/profile";
import { selectProfile } from "../features/profileSlice";
import { useSelector, useDispatch } from "react-redux";
import ModalProfile from "../componnents/ModalProfile";
import { Pencil, Trash } from "lucide-react";
import ModalConfirm from "../componnents/ModalConfirm";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Home() {

  // testingProfile()
  const navigate = useNavigate()
  const profils = useLiveQuery(() => getProfiles());
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const [ isNewProfile, setIsNewProfile ] = useState(true)
  const dispatch = useDispatch();

  const { isOpen: isOpenProfile, onOpen: onOpenProfile, onOpenChange: onOpenChangeProfile } = useDisclosure()
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onOpenChange: onOpenChangeConfirm } = useDisclosure()

  return (
    <>

      {/* Aucun profil crée */}
      {profils?.length === 0 && (
        <BoxContent>
          <p className="text-center">Aucuns profils trouvés.</p>
          <Button onPress={onOpenProfile} color="primary" radius="full" className="mt-2 mx-auto px-6">
            Nouveau profil
          </Button>
        </BoxContent>
      )}
      
      {/* Aucun profil sélectionné */}
      {!selectedProfile && profils?.length > 0 &&(
        <BoxContent>
          <p className="text-center">Sélectionnez un profil</p>
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="mx-auto px-6 mt-2"
                variant="shadow"
                radius="full"
                color="primary"
                size="sm"
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
        </BoxContent>
      )}

      {/* Profil sélectionné */}
      {selectedProfile && 
      <BoxContent>
        <p className="text-2xl text-center mb-2">Bonjour
          <span className="font-bold"> {selectedProfile.name}</span>
          <Button onPress={() => {setIsNewProfile(false); onOpenProfile()}} size="sm" isIconOnly radius="full" className="ml-3"><Pencil size={17} /></Button>
          <Button onPress={onOpenConfirm} size="sm" isIconOnly color="danger" radius="full" className="ml-1"><Trash size={17} /></Button>

        </p>

        <BoxContent>
          <p>Informations du profil.</p>
        </BoxContent>

        <Button onPress={() => navigate("/fiches")} size="sm" color="primary" radius="full" className="mt-2 px-6">
          Consulter ses fiches
        </Button>
        <Button onPress={() => {setIsNewProfile(true); onOpenProfile()}} size="sm" color="secondary" radius="full" className="mt-2 px-6">
          Créer un nouveau profil
        </Button>

      </BoxContent>}

      <ModalProfile 
        isOpen={isOpenProfile} 
        onOpenChange={onOpenChangeProfile} 
        profile={selectedProfile} 
        isNewProfile={isNewProfile}/>

      <ModalConfirm 
        isOpen={isOpenConfirm} 
        onOpenChange={onOpenChangeConfirm} 
        message="Etes-vous sur de vouloir supprimer ce profil ?"
        onConfirm={() => {deleteProfile(selectedProfile.id); dispatch(selectProfile(null))}}/>
    </>
  );
}
