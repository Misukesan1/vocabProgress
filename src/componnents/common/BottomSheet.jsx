import { Drawer } from "@heroui/react";

/**
 * Panneau qui monte du bas de l'écran pour les formulaires (création /
 * modification de collection, fiche, carte). Le haut de la page reste visible.
 * S'utilise comme un Modal HeroUI : mêmes props, avec DrawerContent /
 * DrawerHeader / DrawerBody / DrawerFooter à l'intérieur.
 * (Les confirmations d'action restent des modales centrées : ModalConfirm.)
 */
export default function BottomSheet({ children, ...props }) {
  return (
    <Drawer
      placement="bottom"
      backdrop="blur"
      classNames={{
        base: [
          "h-[85dvh] max-h-[85dvh] rounded-t-3xl pt-3",
          "bg-[var(--neu-surface)] shadow-[0_-10px_30px_-10px_var(--neu-shadow-dark)]",
          "sm:mx-auto sm:max-w-lg",
          // Poignée en haut du panneau
          "before:absolute before:left-1/2 before:top-2.5 before:h-1.5 before:w-10 before:-translate-x-1/2 before:rounded-full before:bg-neutral-300 dark:before:bg-neutral-600",
        ].join(" "),
        header: "pt-4 text-lg",
        closeButton: "top-4 right-4",
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
}
