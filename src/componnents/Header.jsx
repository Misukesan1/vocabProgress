import { Navbar, NavbarBrand } from "@heroui/react";
import { useNavigate } from "react-router";

export default function Header() {
  const navigate = useNavigate();

  return (
    <Navbar isBordered isBlurred={false} className="fixed top-0">
      <NavbarBrand>
        <p
          className="font-bold text-xl cursor-pointer transition-opacity hover:opacity-70 active:opacity-50"
          onClick={() => navigate("/")}
        >
          VocabFlow
        </p>
      </NavbarBrand>
    </Navbar>
  );
}
