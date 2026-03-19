import { Link, useLocation } from "react-router"
import { Button } from "@heroui/react"
import { House, NotebookTabs, ChartNoAxesCombined, Settings } from "lucide-react"

export default function Footer() {
    const location = useLocation()

    return (
        <div className="fixed bottom-0 w-full border-t border-divider bg-background flex justify-around items-center px-4 py-2">
            <Link to="/">
                <Button isIconOnly radius="full" variant="light">
                    <House className={location.pathname === "/" ? "text-primary" : "text-foreground"} />
                </Button>
            </Link>
            <Link to="/fiches">
                <Button isIconOnly radius="full" variant="light">
                    <NotebookTabs className={location.pathname === "/fiches" ? "text-primary" : "text-foreground"} />
                </Button>
            </Link>
            <Link to="/progres">
                <Button isIconOnly radius="full" variant="light">
                    <ChartNoAxesCombined className={location.pathname === "/progres" ? "text-primary" : "text-foreground"} />
                </Button>
            </Link>
            <Link to="/options">
                <Button isIconOnly radius="full" variant="light">
                    <Settings className={location.pathname === "/options" ? "text-primary" : "text-foreground"} />
                </Button>
            </Link>
        </div>
    )
}