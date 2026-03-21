import { Card, CardBody } from "@heroui/react"

export default function BoxContent({ children }) {
    return (
        <Card
            shadow="sm"
            radius="sm"
            className="border border-divider/50 bg-background mt-3 mx-3"
        >
            <CardBody className="px-4 py-4">
                {children}
            </CardBody>
        </Card>
    )
}