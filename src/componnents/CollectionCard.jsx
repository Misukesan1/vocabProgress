import { Card, CardBody } from "@heroui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { getFichesFromProfile } from "../database/fiche";
import { useNavigate } from "react-router";
import { selectProfile } from "../features/profileSlice";
import { useDispatch } from "react-redux";
import { selectFiche } from "../features/ficheSlice";

export default function CollectionCard({collection}) {

    const fichesOfCollection = useLiveQuery(() => getFichesFromProfile(collection.id))
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const selectCollection = () => {
        dispatch(selectProfile(collection))
        dispatch(selectFiche(null))
        navigate("/fiches")
    }

  return (
    <Card
      shadow="sm"
      radius="sm"
      className="border border-divider/50 bg-background mx-3"
    >
        <CardBody 
            className="px-4 py-2 cursor-pointer transition-opacity active:opacity-70"
            onClick={selectCollection}
        >
            <h3 className="font-semibold">{collection.name}</h3>
            <p className="text-xs text-current/70">Nombre de fiches : <span className="font-bold">{fichesOfCollection?.length}</span></p>
        </CardBody>
    </Card>
  )
}
