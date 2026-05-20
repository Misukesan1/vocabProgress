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
import { ArrowRight, BookOpen, LibraryBig, NotepadText, Pencil, Plus, Trash } from "lucide-react";
import ModalConfirm from "../componnents/ModalConfirm";
import { useState } from "react";
import { useNavigate } from "react-router";
import { showAlert } from "../features/alertSlice";
import CollectionCard from "../componnents/CollectionCard";

export default function Home() {
  const profils = useLiveQuery(() => getProfiles()); // profil => collections
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

      {/* Aucune collections crées */}
      {profils?.length === 0 && (
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl text-center font-semibold">Bienvenue sur VocaFlow !</h1>
          <p className="text-center mb-2">Organisez votre apprentissage en 3 niveaux.</p>
          <BoxContent>
            <div className="grid grid-cols-5">
              <div className="flex flex-col items-center">
                <LibraryBig className="text-primary" size={22} />
                <p className="text-xs font-semibold text-primary">Collections</p>
                <p className="text-xs italic text-foreground/60">Votre sujet</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <ArrowRight className="text-foreground/40" size={22} />
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="text-secondary" size={22} />
                <p className="text-xs font-semibold text-secondary">Fiches</p>
                <p className="text-xs italic text-foreground/60">Une catégorie</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <ArrowRight className="text-foreground/40" size={22} />
              </div>
              <div className="flex flex-col items-center">
                <NotepadText className="text-warning" size={22} />
                <p className="text-xs font-semibold text-warning">Cartes</p>
                <p className="text-xs italic text-foreground/60">Un mot à maîtriser</p>
              </div>
            </div>
          </BoxContent>
          <Button
            onPress={onOpenProfile}
            size="sm"
            color="primary"
            radius="full"
            className="mt-3 mx-auto px-6"
            startContent={<Plus size={18} />}
          >
            Créer ma première collection
          </Button>
        </div>
      )}

      {/* Affichage des collections */}
      {profils?.length > 0 && (
        <div>
          <BoxContent>
            <div className="flex justify-between items-center">
              <p>Mes Collections : <span className="font-bold">{profils?.length}</span></p>
              <Button 
                color="primary" 
                isIconOnly 
                onPress={onOpenProfile}
              ><Plus size={18} /></Button>
            </div>
          </BoxContent>
          <div className="mt-5 flex flex-col gap-2">
            {profils?.map((profil) => 
            (<CollectionCard key={profil.id} collection={profil}/>)
            )}
          </div>
        </div>
        // <BoxContent>
        //   <div className="flex flex-col justify-center items-center">
        //     <p className="text-2xl text-center mb-2">
        //       <span className="font-bold"> {selectedProfile.name}</span>
        //     </p>
        //     <div className="flex gap-2">
        //       <Button
        //         onPress={() => {
        //           setIsNewProfile(false);
        //           onOpenProfile();
        //         }}
        //         size="sm"
        //         isIconOnly
        //         radius="full"
        //       >
        //         <Pencil size={17} />
        //       </Button>
        //       <Button
        //         onPress={onOpenConfirm}
        //         size="sm"
        //         isIconOnly
        //         color="danger"
        //         radius="full"
        //       >
        //         <Trash size={17} />
        //       </Button>
        //     </div>
        //   </div>

        //   <BoxContent>
        //     <p>Informations de la collection.</p>
        //     {/* a remplir plus tard */}
        //   </BoxContent>

        //   <Button
        //     onPress={() => navigate("/fiches")}
        //     size="sm"
        //     color="primary"
        //     radius="full"
        //     className="mt-2"
        //   >
        //     Consulter ses fiches
        //   </Button>
        //   <Button
        //     onPress={() => {
        //       setIsNewProfile(true);
        //       onOpenProfile();
        //     }}
        //     size="sm"
        //     color="secondary"
        //     radius="full"
        //     className="mt-2"
        //   >
        //     Créer une nouvelle collection
        //   </Button>
        // </BoxContent>
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
        message={`Etes-vous sur de vouloir supprimer cette collection "${selectedProfile?.name}" ?`}
        onConfirm={() => {
          deleteProfile(selectedProfile.id);
          dispatch(selectProfile(null));
          dispatch(showAlert({ message: "Collection supprimée.", type: "success" }));
        }}
      />
    </>
  );
}
