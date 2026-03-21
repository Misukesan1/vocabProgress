import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Form } from "@heroui/react"
import { addProfile, editProfile } from "../database/profile"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { selectProfile } from "../features/profileSlice"

export default function ModalProfile({ isOpen, onOpenChange, profile = null, isNewProfile }) {

    const [ errorNameMessage, setErrorNameMessage ] = useState("")
    const dispatch = useDispatch()
    const titleModal = (!isNewProfile) ? "Modifier le profil." : "Créer un nouveau profil."
    const textButtonSubmit = (!isNewProfile) ? "Modifier" : "Créer"

    useEffect(() => {
        setErrorNameMessage("")
    }, [isOpen])

    async function handleSubmit(e, onClose) {
        e.preventDefault()
        const name = e.target[0].value

        if (isNewProfile) {
            try {
                await addProfile(name)
                // actionner une notification ici
                onClose()
            } catch (error) {
                console.log(error)
                setErrorNameMessage(error.message)
            }
        } else {
            try {
                await editProfile(profile.id, name)
                // actionner une notification ici

                dispatch(selectProfile({... profile, name: name}))
                onClose()
            } catch (error) {
                console.log(error)
                setErrorNameMessage(error.message)
            }
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            placement="center"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <Form className="contents" onSubmit={(e) => handleSubmit(e, onClose)}>
                        <ModalHeader>{titleModal}</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Nom du profil"
                                isInvalid={errorNameMessage.length > 0}
                                errorMessage={errorNameMessage}
                                onChange={() => setErrorNameMessage("")}
                                validate={(value) => {
                                    if (value.length > 25) return "Maximum 25 caractères."
                                }}
                                defaultValue={(isNewProfile) ? "" : profile?.name}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" color="danger" onPress={onClose}>
                                Retour
                            </Button>
                            <Button color="primary" type="submit">
                                {textButtonSubmit}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </ModalContent>
        </Modal>
    )
}