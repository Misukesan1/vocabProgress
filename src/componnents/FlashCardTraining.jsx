import { Card, CardBody } from "@heroui/react";

export default function FlashCardTraining({
  frontCard,
  backCard,
  isFlipped,
  onPress,
  isReversed
}) {
  return (
    <Card
      isPressable
      onPress={onPress}
      shadow="sm"
      radius="sm"
      className="my-5 mx-auto min-w-60 min-h-80 border border-divider/50 cursor-pointer"
    >
      <CardBody className="flex items-center justify-center">
        {isReversed  
        ? (<p className="text-center text-2xl">{isFlipped ? frontCard : backCard}</p>)
        : (<p className="text-center text-2xl">{isFlipped ? backCard : frontCard}</p>)
        }
      </CardBody>
    </Card>
  );
}
