// src/pages/Classrooms.jsx
import React, { useEffect, useState } from "react"; // useMemo n'est plus nécessaire ici
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuildingColumns,
    faDoorOpen,
    faDoorClosed,
    faPlus,
    faSearch,
    faFilter,
    faChair,
    faPen,
    faTrash,
    faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useClassrooms } from "../hooks/useClassrooms";
import { useModal } from '../hooks/useModal';
import { ClassroomManagementModal } from "../components/modals/ClassroomManagementModal";

const TYPES = ["Tous", "Amphithéâtre", "Salle de Cours", "Salle TP"];
const CAPACITY_BUCKETS = [
    { label: "< 30", fn: (c) => c < 30 },
    { label: "30 – 60", fn: (c) => c >= 30 && c <= 60 },
    { label: "> 60", fn: (c) => c > 60 },
    { label: "Tous", fn: (c) => true }
];

const Classrooms = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("Tous");
    const [capacityFilter, setCapacityFilter] = useState("Tous");


    const { classrooms, loading, error, deleteClassroom, fetchClassrooms } = useClassrooms();
    const { openModal } = useModal();

    useEffect(() => {
        fetchClassrooms();
    }, []); 

    /* Filtrage des salles de classe - effectué directement ici */
    const filteredRooms = (() => {
        if (loading && classrooms.length === 0) return [];

        return classrooms.filter((room) => {
            const matchSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = typeFilter === "Tous" || room.type === typeFilter;
            const matchCap =
                capacityFilter === "Tous" ||
                CAPACITY_BUCKETS.find((b) => b.label === capacityFilter)?.fn(room.capacity);
            return matchSearch && matchType && matchCap;
        });
    })(); // Exécuté immédiatement comme une fonction

    /* Stats */
    const total = classrooms.length;
    const available = classrooms.filter((r) => r.available).length;
    const occupied = total - available;


    const handleCreateClassroom = () => {
        openModal(ClassroomManagementModal, { classroomData: null });
    };

    const handleEditClassroom = (classroom) => {
        openModal(ClassroomManagementModal, { classroomData: classroom });
    };

    const handleDeleteClassroom = async (classroomId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle de classe ?")) {
            await deleteClassroom(classroomId);
        }
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600 text-lg">
                Erreur : Impossible de charger les salles de classe.
            </div>
        );
    }

    if (loading && classrooms.length === 0) {
        return (
            <div className="space-y-6 min-h-screen p-6">
                <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
                    <div className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</div>
                    <span>gestion des salles classe</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 min-h-screen">
            {/* ——— Titre ——— */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
                <span>gestion des salles classe</span>
            </div>

            {/* ——— Stat Cards ——— */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={faBuildingColumns}
                    iconColor="text-cyan-600"
                    label="Nombre total de salles"
                    value={total}
                    bg="bg-white"
                />
                <StatCard
                    icon={faDoorOpen}
                    iconColor="text-emerald-500"
                    label="Salles disponibles"
                    value={available}
                    bg="bg-white"
                />
                <StatCard
                    icon={faDoorClosed}
                    iconColor="text-amber-500"
                    label="Salles occupées"
                    value={occupied}
                    bg="bg-white"
                />
            </div>

            {/* ——— Bloc principal ——— */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header : Recherche + filtres + ajout */}
                <div className="p-6 border-b border-gray-200 space-y-6">
                    {/* Ligne 1 : search + add */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher une salle…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                disabled={loading}
                            />
                        </div>

                        {/* Add button */}
                        <button
                            onClick={handleCreateClassroom}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition w-full lg:w-auto justify-center"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Ajouter une salle
                        </button>
                    </div>

                    {/* Ligne 2 : filtres */}
                    <div className="flex flex-wrap gap-3">
                        {/* Type */}
                        <div className="relative">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="border border-gray-300 rounded-md pl-10 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                disabled={loading}
                            >
                                {TYPES.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} />
                            </span>
                        </div>

                        {/* Capacity */}
                        <div className="relative">
                            <select
                                value={capacityFilter}
                                onChange={(e) => setCapacityFilter(e.target.value)}
                                className="border border-gray-300 rounded-md pl-10 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                disabled={loading}
                            >
                                <option>Tous</option>
                                {CAPACITY_BUCKETS.map((b) => (
                                    <option key={b.label}>{b.label}</option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} />
                            </span>
                        </div>

                        {/* Reset */}
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setTypeFilter("Tous");
                                setCapacityFilter("Tous");
                            }}
                            className="text-sm text-gray-600 hover:underline"
                            disabled={loading || (searchTerm === "" && typeFilter === "Tous" && capacityFilter === "Tous")}
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* ——— Vue mobile (cartes) ——— */}
                <div className="block md:hidden">
                    <div className="space-y-4 p-4">
                        {filteredRooms.length === 0 && !loading ? (
                            <p className="text-center text-gray-500 text-sm">Aucune salle trouvée.</p>
                        ) : (
                            filteredRooms.map((room) => (
                                <RoomCardMobile
                                    key={room.id}
                                    room={room}
                                    onEdit={() => handleEditClassroom(room)}
                                    onDelete={() => handleDeleteClassroom(room.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ——— Vue desktop (table) ——— */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">Nom/Numéro</th>
                                <th className="px-6 py-3 text-left font-medium">Capacité</th>
                                <th className="px-6 py-3 text-left font-medium">Type</th>
                                <th className="px-6 py-3 text-left font-medium">Disponibilité</th>
                                <th className="px-6 py-3 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredRooms.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                                        Aucune salle trouvée.
                                    </td>
                                </tr>
                            ) : (
                                filteredRooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{room.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                                            <FontAwesomeIcon icon={faChair} className="text-gray-400" />
                                            {room.capacity} places
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{room.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <AvailabilityBadge available={room.available} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEditClassroom(room)}
                                                    className="hover:text-cyan-700"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClassroom(room.id)}
                                                    className="hover:text-red-700 text-red-300"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination simplifiée (laissée telle quelle pour l'instant) */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Affichage de 1 à {filteredRooms.length} sur {classrooms.length} salles
                    </span>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                            Précédent
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ——— Sous‑composants ——— */

const StatCard = ({ icon, iconColor, label, value, bg }) => (
    <div className={`flex items-center gap-4 p-6 rounded-lg border border-gray-200 shadow-sm ${bg}`}>
        <span className={`w-12 h-12 flex items-center justify-center rounded-full bg-white ${iconColor}/20`}>
            <FontAwesomeIcon icon={icon} className={`${iconColor} text-xl`} />
        </span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

const AvailabilityBadge = ({ available }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${available ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-600"}`}
    >
        {available ? "Disponible" : "Occupée"}
    </span>
);

const RoomCardMobile = ({ room, onEdit, onDelete }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{room.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <FontAwesomeIcon icon={faChair} /> {room.capacity} places
                </p>
                <p className="text-sm text-gray-600 mb-2">{room.type}</p>
                <AvailabilityBadge available={room.available} />
            </div>
            <div className="flex gap-2 text-gray-600">
                <button onClick={onEdit} className="hover:text-cyan-700">
                    <FontAwesomeIcon icon={faPen} />
                </button>
                <button onClick={onDelete} className="hover:text-red-700">
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    </div>
);

export default Classrooms;