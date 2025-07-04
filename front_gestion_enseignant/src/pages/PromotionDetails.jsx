import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* -------------------------------------------------- */
/* Données mock (à remplacer par vos appels API)      */
/* -------------------------------------------------- */
const studentsData = [
    {
        id: 1,
        name: "Thomas Dubois",
        email: "thomas.dubois@email.com",
        matricule: "STD-2023-001",
        delegate: true,
    },
    { id: 2, name: "Marie Laurent", email: "marie.laurent@email.com", matricule: "STD-2023-002" },
    { id: 3, name: "Lucas Martin", email: "lucas.martin@email.com", matricule: "STD-2023-003" },
    { id: 4, name: "Emma Bernard", email: "emma.bernard@email.com", matricule: "STD-2023-004" },
    { id: 5, name: "Hugo Petit", email: "hugo.petit@email.com", matricule: "STD-2023-005" },
    { id: 6, name: "Chloé Leroy", email: "chloe.leroy@email.com", matricule: "STD-2023-006" },
    { id: 7, name: "Nathan Moreau", email: "nathan.moreau@email.com", matricule: "STD-2023-007" },
    { id: 8, name: "Léa Simon", email: "lea.simon@email.com", matricule: "STD-2023-008" },
];

const PromotionDetail = () => {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        return studentsData.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    /* ----------- Helpers ----------- */
    const initials = (name) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    return (
        <div className="space-y-6">
            {/* ——— Banner titre ——— */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
                <span>Détail de la promotion</span>
                <div className="flex items-center">
                    <span className="text-teal-600 text-xl">GI‑L1</span>                    
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        Niveau 1
                    </span>
                </div>

            </div>
            <div className="flex font-semibold items-center justify-between flex-wrap gap-2">

                <span className="text-sm text-gray-500">
                    {studentsData.length} étudiants inscrits
                </span>
            </div>

            {/* ——— Outils (Recherche / Filtres / Actions) ——— */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Bloc gauche */}
                <div className="flex flex-1 items-center gap-2">
                    {/* Barre de recherche */}
                    <div className="relative flex-1 max-w-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher un étudiant…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>


                </div>

                {/* Bloc actions */}
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2">
                        <i className="fas fa-download"></i> Importer des données
                    </button>
                    <button className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 inline-flex items-center gap-2">
                        <i className="fas fa-plus"></i> Ajouter un étudiant
                    </button>
                    <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2">
                        <i className="fas fa-print"></i> Imprimer la liste
                    </button>
                </div>
            </div>

            {/* ——— Vue mobile (cartes) ——— */}
            <div className="block md:hidden">
                <div className="space-y-4">
                    {filtered.map((s) => (
                        <div
                            key={s.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                            <div className="flex items-start space-x-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center">
                                    {initials(s.name)}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {s.name}
                                        </h3>
                                        <div className="flex space-x-2 text-sm">
                                            <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 truncate">{s.email}</p>
                                    {s.delegate && (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                            <i className="fas fa-star mr-1"></i> Délégué
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-center text-gray-500 text-sm">Aucun étudiant trouvé.</p>
                    )}
                </div>
            </div>

            {/* ——— Vue desktop (tableau) ——— */}
            <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 text-left">Nom complet</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Matricule</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                    <div className="bg-teal-100 text-teal-700 font-bold w-8 h-8 rounded-full flex items-center justify-center uppercase text-xs">
                                        {initials(s.name)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.name}
                                        {s.delegate && (
                                            <span className="text-yellow-600" title="Délégué">
                                                <i className="fas fa-star"></i>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                    {s.email}
                                </td>
                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                    {s.matricule}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <button
                                            title="Favori"
                                            className="hover:text-yellow-600 transition-colors duration-150"
                                        >
                                            <i className={`${s.delegate ? 'fas' : 'far'} fa-star`}></i>
                                        </button>
                                        <button title="Voir" className="hover:text-teal-600">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button title="Modifier" className="hover:text-cyan-700">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button title="Supprimer" className="hover:text-red-700">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                                    Aucun étudiant trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ——— Pagination simple ——— */}
            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between text-sm text-gray-700">
                <span>
                    Affichage de 1 à {filtered.length} sur {studentsData.length} résultats
                </span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                        &lt;
                    </button>
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-md">1</span>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionDetail;