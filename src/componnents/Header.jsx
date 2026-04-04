import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { selectProfile } from "../features/profileSlice";
import { useLiveQuery } from "dexie-react-hooks";
import { getProfiles } from "../database/profile";
import { selectFiche } from "../features/ficheSlice";

export default function Header() {

  const profils = useLiveQuery(() => getProfiles());
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);

  const dispatch = useDispatch();

  return (
    <Navbar isBordered isBlurred={false} className="fixed top-0">
      <NavbarBrand>
        <p className="font-bold text-xl">VocabProgress</p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" radius="lg" size="sm">
              {selectedProfile?.name || "Sans nom ▾"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profils"
            emptyContent="Aucun profil créé"
            variant="light"
            color="primary"
          >
            {/* Affichage des profils crées dans le menu dropdown */}
            {profils?.map((profil) => (
              <DropdownItem
                key={profil.id}
                onPress={(e) => {dispatch(selectProfile(profil));dispatch(selectFiche(null))}}
              >
                {profil.name}
              </DropdownItem>
            ))}

          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
