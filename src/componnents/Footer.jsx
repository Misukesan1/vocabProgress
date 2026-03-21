import { useNavigate, useLocation } from "react-router"
import { Button } from "@heroui/react"
import { House, NotebookTabs, ChartNoAxesCombined, Settings } from "lucide-react"

export default function Footer() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <div className="fixed bottom-0 w-full border-t border-divider bg-background flex justify-around items-center px-4 py-2">
            <Button isIconOnly radius="full" variant="light" onPress={() => navigate("/")}>
                <House className={location.pathname === "/" ? "text-primary" : "text-foreground"} />
            </Button>
            <Button isIconOnly radius="full" variant="light" onPress={() => navigate("/fiches")}>
                <NotebookTabs className={location.pathname === "/fiches" ? "text-primary" : "text-foreground"} />
            </Button>
            <Button isIconOnly radius="full" variant="light" onPress={() => navigate("/progres")}>
                <ChartNoAxesCombined className={location.pathname === "/progres" ? "text-primary" : "text-foreground"} />
            </Button>
            <Button isIconOnly radius="full" variant="light" onPress={() => navigate("/options")}>
                <Settings className={location.pathname === "/options" ? "text-primary" : "text-foreground"} />
            </Button>
        </div>
    )
}