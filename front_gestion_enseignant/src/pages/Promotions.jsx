import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useModal } from "../hooks/useModal";
import { usePromotions } from "../hooks/usePromotions";
import { PromotionManagementModal } from "../components/modals/PromotionManagementModal";

/* -------------------------------------------------- */
/* Utilitaire : plage de dates de la semaine courante  */
/* -------------------------------------------------- */
function getCurrentWeekRange() {
    const today = new Date();
    const day = today.getDay(); // 0 = dimanche, 1 = lundi …
    const diffToMonday = day === 0 ? -6 : 1 - day; // si dimanche => reculer 6 jours
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const options = { day: "2-digit", month: "short" };
    return `${monday.toLocaleDateString("fr-FR", options)} - ${sunday.toLocaleDateString("fr-FR", options)}`;
}

export default function PromotionsManagementPage() {
    const { openModal } = useModal(); // closeModal n'est pas utilisé directement ici, uniquement par le modal lui-même
    // Utiliser le hook usePromotions du contexte
    const {
        promotions,
        loading,
        error,
        fetchPromotions, // Toujours utile si vous voulez forcer un re-fetch
        deletePromotion,
    } = usePromotions();

    const [searchTerm, setSearchTerm] = useState("");
    const [levelFilter, setLevelFilter] = useState("Tous les niveaux");

    const weekRange = getCurrentWeekRange();

    useEffect(() => {
        if (error) {
            console.error("Erreur détectée dans PromotionsManagementPage (depuis le contexte):", error);
            // toast.error("Une erreur s'est produite lors du chargement des promotions.");
        }
    }, [error]);

    const filteredPromotions = useMemo(() => {
        if (!promotions) return [];

        let currentPromotions = promotions;

        const searchLower = searchTerm.toLowerCase();
        if (searchTerm) {
            currentPromotions = currentPromotions.filter((p) =>
                p.name.toLowerCase().includes(searchLower)
            );
        }

        if (levelFilter !== "Tous les niveaux") {
            currentPromotions = currentPromotions.filter((p) => p.level === levelFilter);
        }

        return currentPromotions;
    }, [searchTerm, levelFilter, promotions]);

    const filters = ["Tous les niveaux", "Niveau 1", "Niveau 2", "Niveau 3", "Niveau 4", "Niveau 5"];

    const getPublicationBadge = (published) => {
        return published ? (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                Publié
            </span>
        ) : (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                Non publié
            </span>
        );
    };

    const handleAddPromotion = () => {
        openModal(PromotionManagementModal, { promotionData: null });
    };

    const handleEditPromotion = (promotion) => {
        openModal(PromotionManagementModal, {
            promotionData: promotion
        });
    };

    const handleDeletePromotion = async (promotionId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
            await deletePromotion(promotionId);
        }
    };

    // Calculer les statistiques à partir du tableau complet des promotions
    const totalPromotions = promotions?.length || 0;
    const totalStudents = promotions?.reduce((acc, cur) => acc + (cur.students || 0), 0) || 0;
    const publishedCount = promotions?.filter((p) => p.published).length || 0;
    const unpublishedCount = promotions?.filter((p) => !p.published).length || 0;

    // --- Squelettes de chargement ---
    const PromotionCardSkeleton = () => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-2/5"></div>
            <div className="mt-4 flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    const PromotionTableSkeleton = ({ rows = 5 }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 animate-pulse">
                    {[...Array(rows)].map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-3">
                                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (error && !loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <p className="text-xl">Erreur lors du chargement des promotions.</p>
                <button onClick={fetchPromotions} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* ---------------------------------------------------- Titre */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-stretch justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '>
                    <i className="fa-solid fa-arrow-left"></i>retour
                </Link>
                <span>gestion des promotions</span>
            </div>

            {/* ---------------------------------------------------- Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {loading ? (
                    <>
                        <PromotionCardSkeleton />
                        <PromotionCardSkeleton />
                        <PromotionCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-graduation-cap text-teal-600 text-xl"></i>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total promotions</p>
                                    <p className="text-xl font-bold text-teal-600">{totalPromotions}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-users text-blue-600 text-xl"></i>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total étudiants</p>
                                    <p className="text-xl font-bold text-blue-600">{totalStudents}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-calendar-check text-purple-600 text-xl"></i>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Emploi du temps</p>
                                    <p className="text-lg font-bold text-green-600">{publishedCount} Publié(s)</p>
                                    <p className="text-lg font-bold text-yellow-600">{unpublishedCount} En attente</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
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
                                className="block w-[80%] pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                disabled={loading}
                            />
                        </div>

                        {/* Filtres + bouton ajout */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                            <select
                                className="border border-gray-300 rounded-md py-2 px-3 text-sm w-full sm:w-auto"
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                disabled={loading}
                            >
                                {filters.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setLevelFilter("Tous les niveaux")}
                                className="text-sm text-gray-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 w-full sm:w-auto"
                                disabled={loading}
                            >
                                Réinitialiser
                            </button>
                            <button
                                onClick={handleAddPromotion}
                                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                                disabled={loading}
                            >
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

                {/* -------- Vue mobile - Cartes -------- */}
                <div className="block md:hidden">
                    <div className="space-y-4 p-4">
                        {loading ? (
                            <PromotionCardSkeleton />
                        ) : filteredPromotions.length > 0 ? (
                            filteredPromotions.map((promo) => (
                                <div key={promo.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            <i className="fas fa-tag w-4 h-4 mr-2 text-teal-600"></i>
                                            {promo.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            <i className="fas fa-layer-group w-4 h-4 mr-2 text-teal-600"></i>
                                            Niveau: {promo.level}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <i className="fas fa-users w-4 h-4 mr-2 text-teal-600"></i>
                                            Étudiants: {promo.students}
                                        </p>
                                        <div className="flex items-center">
                                            <i className="fas fa-calendar-check w-4 h-4 mr-2 text-teal-600"></i>
                                            {getPublicationBadge(promo.published)}
                                        </div>
                                        <div className="flex space-x-3 mt-3">
                                            <button
                                                onClick={() => handleEditPromotion(promo)}
                                                className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                title="Modifier"
                                            >
                                                <i className="fas fa-edit text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePromotion(promo.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash text-sm"></i>
                                            </button>
                                            <button className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded"
                                                title="Gérer l'emploi du temps"
                                            >
                                                Gérer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">Aucune promotion trouvée.</p>
                        )}
                    </div>
                </div>

                {/* -------- Vue desktop - Tableau -------- */}
                <div className="hidden md:block">
                    {loading ? (
                        <PromotionTableSkeleton rows={5} />
                    ) : (
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
                                    {filteredPromotions.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                Aucune promotion trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPromotions.map((promo) => (
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
                                                        <button
                                                            onClick={() => handleEditPromotion(promo)}
                                                            className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                            title="Modifier"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePromotion(promo.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                            title="Supprimer"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <button className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded"
                                                            title="Gérer l'emploi du temps"
                                                        >
                                                            Gérer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* -------- Pagination -------- */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        {loading ? (
                            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        ) : (
                            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                Affichage de 1 à {filteredPromotions.length} sur {promotions.length} résultats
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <button
                                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                                disabled // Pas de logique de pagination implémentée pour l'instant
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="px-3 py-1 text-sm text-white bg-teal-600 border border-teal-600 rounded-md">
                                1
                            </button>
                            <button
                                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled // Pas de logique de pagination implémentée pour l'instant
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