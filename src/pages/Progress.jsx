import { useSelector } from "react-redux";
import PageStub from "../componnents/common/PageStub";

export default function Progress() {
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);

  if (!selectedProfile) {
    return (
      <PageStub
        title="Statistiques"
        description="Sélectionne une collection depuis Collections pour voir ses statistiques."
      />
    );
  }

  return (
    <PageStub
      title={`Statistiques — ${selectedProfile.name}`}
      description="Bientôt disponible : tu pourras suivre ici ta progression (cartes maîtrisées, révisions...)."
    />
  );
}
