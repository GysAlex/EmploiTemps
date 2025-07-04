import { useState, useMemo } from "react";

export default function PromotionsTable() {
  const promotions = [
    { id: 1, name: "Promotion Alpha", level: 1, students: 180, schedulePublished: true },
    { id: 2, name: "Promotion Beta", level: 1, students: 165, schedulePublished: false },
    { id: 3, name: "Promotion Gamma", level: 1, students: 175, schedulePublished: true },
    { id: 4, name: "Promotion Delta", level: 2, students: 155, schedulePublished: true },
    { id: 5, name: "Promotion Epsilon", level: 2, students: 140, schedulePublished: false },
    { id: 6, name: "Promotion Zeta", level: 2, students: 130, schedulePublished: true },
    { id: 7, name: "Promotion Eta", level: 3, students: 120, schedulePublished: false },
    { id: 8, name: "Promotion Theta", level: 3, students: 105, schedulePublished: true },
    { id: 9, name: "Promotion Iota", level: 3, students: 75, schedulePublished: false },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromotions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return promotions.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2 justify-between">
        <input
          type="text"
          placeholder="Rechercher une promotion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-[350px] px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0694A2] focus:border-transparent"
        />
        <button className="px-3 py-2 flex items-center gap-2 cursor-pointer text-white bg-[#0694A2] rounded-2xl ">
            <i className="fa-solid fa-plus"></i>
            <span className="hidden md:block">ajouter une promotion</span>
        </button>
      </div>

      {/* Desktop Table */}
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
                    Niveau {promo.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{promo.students}</td>
                <td className="px-6 py-4">
                  {promo.schedulePublished ? (
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

      {/* Mobile/Tablet Cards */}
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
                <span className="text-sm text-gray-700 font-medium">{promo.students}</span>
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