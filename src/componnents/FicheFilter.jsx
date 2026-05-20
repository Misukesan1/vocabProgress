import { Chip, Input } from "@heroui/react";
import { Search, TriangleAlert } from "lucide-react";

export default function FicheFilter({ficheList, filter, onFilterChange, searchValue, onSearchValueChange}) {
  return (
    <>
      <div className="flex items-center">
        <Input
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          startContent={<Search />}
          size="lg"
          placeholder="Rechercher parmis les fiches"
          variant="bordered"
        />
      </div>
      <div className="mt-2 flex justify-center gap-2 flex-wrap">
        <Chip
          size="sm"
          variant={filter === "recent" ? "shadow" : "bordered"}
          onClick={() => onFilterChange("recent")}
          color="secondary"
          className="cursor-pointer"
        >
          Récent
        </Chip>
        <Chip
          size="sm"
          variant={filter === "ancien" ? "shadow" : "bordered"}
          onClick={() => onFilterChange("ancien")}
          color="secondary"
          className="cursor-pointer"
        >
          Ancien
        </Chip>
        <Chip
          size="sm"
          variant={filter === "a-z" ? "shadow" : "bordered"}
          onClick={() => onFilterChange("a-z")}
          color="secondary"
          className="cursor-pointer"
        >
          A-z
        </Chip>
        <Chip
          size="sm"
          variant={filter === "z-a" ? "shadow" : "bordered"}
          onClick={() => onFilterChange("z-a")}
          color="secondary"
          className="cursor-pointer"
        >
          Z-a
        </Chip>

        {ficheList?.filter((fiche) => fiche.countErrors > 0).length > 0 &&
            <Chip
            size="sm"
            variant={filter === "difficiles" ? "shadow" : "bordered"}
            onClick={() => onFilterChange("difficiles")}
            color="secondary"
            className="cursor-pointer"
            endContent={<TriangleAlert size={18} />}
            >
            A revoir
            </Chip>
        }
      </div>
    </>
  );
}
