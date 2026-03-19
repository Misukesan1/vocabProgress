import { Navbar, NavbarBrand, NavbarContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"

export default function Header() {

    const profils = [] // tu brancheras Dexie ici plus tard

    return (
        <Navbar isBordered isBlurred={false} className="fixed top-0">
            <NavbarBrand>
                <p className="font-bold text-xl">VocabProgress</p>
            </NavbarBrand>
            <NavbarContent justify="end">
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="bordered" size="sm">
                            Sans nom ▾
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        aria-label="Profils"
                        emptyContent="Aucun profil créé"
                    >
                        {profils.map((profil) => (
                            <DropdownItem key={profil.id}>
                                {profil.name}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>
        </Navbar>
    )
}