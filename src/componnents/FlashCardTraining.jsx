import { Card, CardBody } from "@heroui/react";

export default function FlashCardTraining({
  frontCard,
  backCard,
  isFlipped,
  onPress,
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
        <p className="text-center">{isFlipped ? backCard : frontCard}</p>
      </CardBody>
    </Card>
  );
}
