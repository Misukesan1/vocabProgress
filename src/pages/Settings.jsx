import { Button, Switch, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import { db } from "../database/db";
import ModalConfirm from "../componnents/ModalConfirm";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Settings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  console.log(theme);

  const handleDeleteDatabase = async () => {
    await db.profile.clear();
    await db.fiche.clear();
    await db.flashcard.clear();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <h1 className="text-center">Page settings.</h1>

      {/* Formater données */}
      <BoxContent>
        <div className="flex justify-between items-center gap-3">
          <p>Effacer toutes les données.</p>
          <Button onPress={onOpen} size="sm" color="danger" radius="full">
            Effacer
          </Button>
        </div>
      </BoxContent>

      {/* DarkMode */}
      <BoxContent>
        <div className="flex justify-between items-center">
          Mode {theme === "dark" ? "clair" : "sombre"}
          <Switch
            isSelected={theme === "dark"}
            onValueChange={(isSelected) => {
              isSelected ? setTheme("dark") : setTheme("light");
            }}
            aria-label="dark mode"
          />
        </div>
      </BoxContent>

      <ModalConfirm
        message={
          "Etes-vous sur de vouloir effacer toutes les données ? Cette action est irréversible."
        }
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={() => {
          handleDeleteDatabase();
          dispatch(
            showAlert({
              message: "Toutes les données ont été supprimées.",
              type: "success",
            }),
          );
        }}
      />
    </>
  );
}
