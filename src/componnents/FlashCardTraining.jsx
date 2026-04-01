import { Card, CardBody } from "@heroui/react"
import { useState } from "react"

export default function FlashCardTraining({ frontCard, backCard }) {

    const [isFlipped, setIsFlipped] = useState(false)

    return (
        <Card
            isPressable
            onPress={() => setIsFlipped(!isFlipped)}
            shadow="sm"
            radius="sm"
            className="w-full min-h-32 border border-divider/50 cursor-pointer"
        >
            <CardBody className="flex items-center justify-center">
                <p className="text-center">
                    {isFlipped ? backCard : frontCard}
                </p>
            </CardBody>
        </Card>
    )
}