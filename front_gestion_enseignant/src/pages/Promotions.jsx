import React, { useState } from "react";
import { Link } from "react-router-dom";

/* -------------------------------------------------- */
/* Utilitaire : plage de dates de la semaine courante  */
/* -------------------------------------------------- */
function getCurrentWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0 = dimanche, 1 = lundi …
  const diffToMonday = day === 0 ? -6 : 1 - day; // si dimanche => reculer 6 jours
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const options = { day: "2-digit", month: "short" };
  return `${monday.toLocaleDateString("fr-FR", options)} - ${sunday.toLocaleDateString("fr-FR", options)}`;
}

/* --------------------------- Données mock --------------------------- */
const promotions = [
  { id: 1, name: "GI-L1", level: "Niveau 1", students: 45, published: true },
  { id: 2, name: "GI-L2", level: "Niveau 2", students: 38, published: true },
  { id: 3, name: "GI-L3", level: "Niveau 3", students: 32, published: true },
  { id: 4, name: "BD-L1", level: "Niveau 1", students: 50, published: true },
  { id: 5, name: "BD-L2", level: "Niveau 2", students: 42, published: true },
  { id: 6, name: "BD-L3", level: "Niveau 3", students: 35, published: false },
  { id: 7, name: "RT-L1", level: "Niveau 1", students: 48, published: true },
  { id: 8, name: "RT-L2", level: "Niveau 2", students: 40, published: false },
];

export default function PromotionsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous les niveaux");

  const weekRange = getCurrentWeekRange();

  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      activeFilter === "Tous les niveaux" || p.level === activeFilter;
    return matchesSearch && matchesLevel;
  });

  const filters = ["Tous les niveaux", "Niveau 1", "Niveau 2", "Niveau 3"];

  const getPublicationBadge = (published) => {
    return published ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Publié
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Non publié
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- Titre */}
        <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
            <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
            <span>gestion des promotions</span>
        </div>

      {/* ---------------------------------------------------- Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Nombre total de promotions</p>
          <p className="text-2xl font-bold text-teal-600">{promotions.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Nombre total d'étudiants</p>
          <p className="text-2xl font-bold text-teal-600">
            {promotions.reduce((acc, cur) => acc + cur.students, 0)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Statut des publications</p>
          <p className="text-md text-green-600 font-semibold">
            {promotions.filter((p) => p.published).length} Publiés
          </p>
          <p className="text-md text-yellow-600 font-semibold">
            {promotions.filter((p) => !p.published).length} Non publiés
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- Bloc principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* -------- Header recherche / filtres / ajout -------- */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher une promotion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filtres + bouton ajout */}
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                {filters.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setActiveFilter("Tous les niveaux")}
                className="text-sm text-gray-600 hover:underline"
              >
                Réinitialiser
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200">
                <i className="fas fa-plus mr-2"></i>
                Ajouter une promotion
              </button>
            </div>
          </div>
        </div>

        {/* -------- Plage de dates de la semaine -------- */}
        <div className="px-6 py-4 text-sm text-gray-600 border-b border-gray-100">
          <i className="fas fa-calendar-alt mr-2 text-teal-600"></i>
          Emploi du temps de la semaine : <span className="font-medium text-gray-800">{weekRange}</span>
        </div>

        {/* -------- Tableau -------- */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOM DE LA PROMOTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIVEAU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMBRE D'ÉTUDIANTS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMPLOI DU TEMPS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-800">
                    {promo.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {promo.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <i className="fas fa-users mr-2 text-gray-400"></i>
                    {promo.students} étudiants
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getPublicationBadge(promo.published)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                        <i className="fas fa-trash"></i>
                      </button>
                      <button className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded">
                        Gérer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de 1 à {filteredPromotions.length} sur {filteredPromotions.length} résultats
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-3 py-1 text-sm text-white bg-teal-600 border border-teal-600 rounded-md">
                1
              </button>
              <button
                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
