import React, { useState, useMemo } from "react";
import { usePromotions } from "../hooks/usePromotions"; // Importez votre hook usePromotions
import { FaPlus } from "react-icons/fa"; // Importez l'icône plus si ce n'est pas déjà fait

export default function PromotionsTable() {
  const { promotions, loading, error } = usePromotions(); // Utilisez le hook pour accéder aux données
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromotions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    // Filtrez les promotions uniquement si elles sont chargées
    return promotions.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm, promotions]); // Ajoutez 'promotions' aux dépendances

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0694A2]"></div>
        <p className="ml-4 text-gray-600">Chargement des promotions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Erreur lors du chargement des promotions.</p>
        <p>Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Barre de recherche */}
      <div className="mb-6 flex items-center gap-2 justify-between">
        <input
          type="text"
          placeholder="Rechercher une promotion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-[350px] px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0694A2] focus:border-transparent"
        />
        <button className="px-3 py-2 flex items-center gap-2 cursor-pointer text-white bg-[#0694A2] rounded-2xl ">
            <FaPlus className="text-white" /> {/* Utilisez l'icône React */}
            <span className="hidden md:block">ajouter une promotion</span>
        </button>
      </div>

      {/* Tableau pour les grands écrans */}
      <div className="hidden lg:block overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Nom de la promotion</th>
              <th className="px-6 py-4 font-medium">Niveau</th>
              <th className="px-6 py-4 font-medium">Nombre d'étudiants</th>
              <th className="px-6 py-4 font-medium">Emploi du temps publié</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((promo, idx) => (
              <tr key={promo.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{promo.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 font-medium">
                    {/* Assurez-vous que la propriété 'level' correspond à ce que votre API retourne */}
                    Niveau {promo.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{promo.students.length}</td>
                <td className="px-6 py-4">
                  {/* Assurez-vous que la propriété 'schedulePublished' correspond à ce que votre API retourne */}
                  {promo.published ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      Non
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-[#0694A2] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Gérer
                  </button>
                </td>
              </tr>
            ))}
            {filteredPromotions.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Aucune promotion trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cartes pour mobile/tablette */}
      <div className="lg:hidden space-y-4">
        {filteredPromotions.map((promo) => (
          <div key={promo.id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-800 text-base">{promo.name}</h3>
              <button className="bg-[#0694A2] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                Gérer
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Niveau:</span>
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 font-medium">
                  Niveau {promo.level}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Étudiants:</span>
                <span className="text-sm text-gray-700 font-medium">{promo.students.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emploi du temps:</span>
                {promo.schedulePublished ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Publié
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Non publié
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredPromotions.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 text-center text-gray-500">
            Aucune promotion trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
