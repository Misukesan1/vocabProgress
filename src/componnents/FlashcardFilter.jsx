import { Chip, Input } from "@heroui/react";
import { AlertTriangle, Check, Search } from "lucide-react";


export default function FlashcardFilter({searchValue, onSearchValueChange, filter, onFilterChange, flashcards}) {
  return (
    <>
        <Input
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          startContent={<Search />}
          size="lg"
          placeholder="Rechercher parmis les cartes"
          variant="bordered"
        />
        <div className="mt-2 flex justify-center gap-2 flex-wrap">
            <Chip
                size="sm"
                variant={filter === "all" ? "shadow" : "bordered"}
                onClick={() => onFilterChange("all")}
                color="secondary"
                className="cursor-pointer"
                >
                Toutes
            </Chip>

            {flashcards?.filter((card) => card.desactive).length > 0 &&
                <Chip
                    size="sm"
                    variant={filter === "maitrisees" ? "shadow" : "bordered"}
                    onClick={() => onFilterChange("maitrisees")}
                    color="secondary"
                    className="cursor-pointer"
                    endContent={<Check size={18} />}
                    >
                    Maîtrisées
                </Chip>
            }

            {flashcards?.filter((card) => card.errors > 0).length > 0 &&
                <Chip
                    size="sm"
                    variant={filter === "difficiles" ? "shadow" : "bordered"}
                    onClick={() => onFilterChange("difficiles")}
                    color="secondary"
                    className="cursor-pointer"
                    endContent={<AlertTriangle size={18} />}
                    >
                    A revoir
                </Chip>
            }
        </div>
    </>
  )
}
