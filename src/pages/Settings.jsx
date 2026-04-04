import { Button, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import { db } from "../database/db";
import ModalConfirm from "../componnents/ModalConfirm";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";

export default function Settings() {

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const dispatch = useDispatch()

  const handleDeleteDatabase = async () => {
    await db.profile.clear()
    await db.fiche.clear()
    await db.flashcard.clear()
  }

  return (
    <>
      <h1 className="text-center">Page settings.</h1>
      <BoxContent>
        <div className="flex justify-between items-center gap-3">
          <p>Effacer toutes les données.</p>
          <Button
            onPress={onOpen}
            size="sm"
            color="danger"
            radius="full"
          >
            Effacer
          </Button>
        </div>
      </BoxContent>

      <ModalConfirm 
        message={"Etes-vous sur de vouloir effacer toutes les données ? Cette action est irréversible."}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={() => {handleDeleteDatabase(); dispatch(showAlert({message: "Données supprimées.", type: "success"}))}} />
    </>
  );
}
