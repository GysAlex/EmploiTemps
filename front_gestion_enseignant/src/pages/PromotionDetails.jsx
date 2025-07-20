import React, { useMemo, useState, useEffect, useRef } from "react"; // Importez useRef
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { useModal } from '../hooks/useModal';
import StudentManagementModal from '../components/modals/StudentManagementModal';
import { FaSpinner, FaInfoCircle, FaDownload, FaUpload } from 'react-icons/fa'; // Importez FaUpload

const PromotionDetail = () => {
    const { promotionId } = useParams();
    const { openModal, closeModal } = useModal();

    const [promotion, setPromotion] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null); // Pour stocker les résultats de l'importation
    const fileInputRef = useRef(null); // Référence pour l'input file

    const initials = (name) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    const fetchPromotionAndStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const promotionRes = await axios.get(`/api/promotions/${promotionId}`);
            setPromotion(promotionRes.data.data);

            const studentsRes = await axios.get(`/api/promotions/${promotionId}/students`);
            setStudents(studentsRes.data.data);
            toast.success("Données chargées avec succès !");
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
            setError(err);
            toast.error("Erreur lors du chargement des données de la promotion ou des étudiants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotionAndStudents();
    }, [promotionId]);

    const filtered = useMemo(() => {
        if (!students) return [];
        return students.filter((s) =>
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.matricule.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, students]);

    /* ----------- Handlers CRUD ----------- */

    const handleAddStudent = () => {
        openModal(
            StudentManagementModal,
            {
                promotionId: promotionId,
                onSaveSuccess: fetchPromotionAndStudents,
                onCancel: closeModal,
                initialData: null
            }
        );
    };

    const handleEditStudent = (studentData) => {
        openModal(
            StudentManagementModal,
            {
                promotionId: promotionId,
                onSaveSuccess: fetchPromotionAndStudents,
                onCancel: closeModal,
                initialData: studentData
            }
        );
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
            try {
                await axios.delete(`/api/promotions/${promotionId}/students/${studentId}`);
                toast.success("Étudiant supprimé avec succès !");
                fetchPromotionAndStudents();
            } catch (err) {
                console.error("Erreur lors de la suppression de l'étudiant:", err);
                const errorMessage = err.response?.data?.message || "Erreur lors de la suppression de l'étudiant.";
                toast.error(errorMessage);
            }
        }
    };

    const handleSetDelegate = async (studentId, isDelegateStatus) => {
        try {
            await axios.patch(`/api/promotions/${promotionId}/students/${studentId}/set-delegate`, {
                is_delegate: isDelegateStatus
            });
            toast.success(`Statut de délégué mis à jour avec succès pour ${students.find(s => s.id === studentId)?.full_name} !`);
            fetchPromotionAndStudents();
        } catch (err) {
            console.error("Erreur lors de la mise à jour du statut de délégué:", err);
            const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour du statut de délégué.";
            toast.error(errorMessage);
        }
    };

    /* ----------- Gestion de l'importation de fichiers ----------- */

    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
        setImportResult(null); // Réinitialiser les résultats précédents
    };

    const handleImportStudents = async () => {
        if (!importFile) {
            toast.error("Veuillez sélectionner un fichier à importer.");
            return;
        }

        setIsImporting(true);
        setImportResult(null); // Réinitialiser les résultats avant une nouvelle importation

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await axios.post(`/api/promotions/${promotionId}/students/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(response.data.message || "Importation réussie !");
            setImportResult(response.data);
            fetchPromotionAndStudents(); // Recharger la liste des étudiants
            setImportFile(null); // Réinitialiser le fichier sélectionné
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Réinitialiser l'input file
            }
        } catch (err) {
            console.error("Erreur lors de l'importation du fichier:", err);
            const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de l'importation.";
            toast.error(errorMessage);
            setImportResult(err.response?.data || { message: errorMessage, success_count: 0, failure_count: 1, failed_rows: [] });
        } finally {
            setIsImporting(false);
        }
    };


    const handleDownloadPdf = async () => {
    try {
        toast.loading("Génération du PDF en cours...");
        const response = await axios.get(`/api/promotions/${promotionId}/students/download-pdf`, {
            responseType: 'blob', // Important pour recevoir le fichier binaire
        });

        // Créer un URL pour le blob et déclencher le téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `liste_etudiants_promotion_${promotion?.name || promotionId}.pdf`); // Nom du fichier
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url); // Libérer la mémoire

        toast.dismiss(); // Fermer le toast de chargement
        toast.success("PDF téléchargé avec succès !");

    } catch (err) {
        console.error("Erreur lors du téléchargement du PDF:", err);
        toast.dismiss(); // Fermer le toast de chargement
        const errorMessage = err.response?.data?.message || "Une erreur est survenue lors du téléchargement du PDF.";
        toast.error(errorMessage);
    }
};


    if (loading) {
        return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 text-red-700">
                <FaInfoCircle className="inline-block mr-2 text-2xl" />
                <p className="text-xl">Erreur lors du chargement : {error.message || "Une erreur est survenue."}</p>
                <button onClick={fetchPromotionAndStudents} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md">
                    Réessayer
                </button>
            </div>
        );
    }

    if (!promotion) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl text-gray-500">Promotion non trouvée.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ——— Banner titre ——— */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
                <span>Détail de la promotion</span>
                <div className="flex items-center">
                    <span className="text-teal-600 text-xl">{promotion.name}</span>
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {promotion.level}
                    </span>
                </div>
            </div>
            <div className="flex font-semibold items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-gray-500">
                    {students.length} étudiants inscrits
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
                    {/* Bouton pour l'importation de fichiers */}
                    <label htmlFor="file-upload" className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2 cursor-pointer">
                        <FaDownload /> Importer des données
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv, .txt, .xlsx"
                            onChange={handleFileChange}
                            ref={fileInputRef} // Associer la référence
                            className="hidden"
                        />
                    </label>
                    {importFile && (
                        <button
                            onClick={handleImportStudents}
                            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center gap-2"
                            disabled={isImporting}
                        >
                            {isImporting ? <FaSpinner className="animate-spin" /> : <FaUpload />} {isImporting ? 'Importation...' : 'confirmer'}
                        </button>
                    )}

                    <button
                        onClick={handleAddStudent}
                        className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 inline-flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Ajouter un étudiant
                    </button>

                    <button onClick={handleDownloadPdf} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2">
                        <i className="fas fa-file-pdf"></i> Télécharger PDF
                    </button>
                </div>
            </div>

            {/* Résultats de l'importation */}
            {importResult && (
                <div className={`p-4 rounded-md ${importResult.failure_count > 0 ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`}>
                    <p className="font-semibold">{importResult.message}</p>
                    <p>Succès: {importResult.success_count}</p>
                    <p>Échecs: {importResult.failure_count}</p>
                    {importResult.failed_rows && importResult.failed_rows.length > 0 && (
                        <div className="mt-2 text-sm">
                            <p className="font-medium">Détails des lignes échouées :</p>
                            <ul className="list-disc list-inside">
                                {importResult.failed_rows.map((row, index) => (
                                    <li key={index}>
                                        Ligne {row.row}: {row.errors.join(', ')} (Données: {JSON.stringify(row.data)})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* ——— Vue mobile (cartes) ——— */}
            <div className="block md:hidden">
                <div className="space-y-4">
                    {filtered.length > 0 ? (
                        filtered.map((s) => (
                            <div
                                key={s.id}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center">
                                        {initials(s.full_name)}
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {s.full_name}
                                            </h3>
                                            <div className="flex space-x-2 text-sm">
                                                <button
                                                    onClick={() => handleEditStudent(s)}
                                                    className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                    title="Modifier"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(s.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                    title="Supprimer"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 truncate">{s.email}</p>
                                        {s.is_delegate != 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                                <i className="fas fa-star mr-1"></i> Délégué
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
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
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                                    Aucun étudiant trouvé.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                        <div className="bg-teal-100 text-teal-700 font-bold w-8 h-8 rounded-full flex items-center justify-center uppercase text-xs">
                                            {initials(s.full_name)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {s.full_name}
                                            {s.is_delegate != 0 && (
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
                                                onClick={() => handleSetDelegate(s.id, !s.is_delegate)}
                                                title={s.is_delegate ? "Retirer le statut de délégué" : "Définir comme délégué"}
                                                className={`hover:text-yellow-600 transition-colors duration-150 ${s.is_delegate ? 'text-yellow-500' : 'text-gray-400'}`}
                                            >
                                                <i className={`${s.is_delegate ? 'fas' : 'far'} fa-star`}></i>
                                            </button>
                                            <button
                                                onClick={() => handleEditStudent(s)}
                                                title="Modifier"
                                                className="hover:text-cyan-700"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(s.id)}
                                                title="Supprimer"
                                                className="hover:text-red-700"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ——— Pagination simple ——— */}
            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between text-sm text-gray-700">
                <span>
                    Affichage de 1 à {filtered.length} sur {students.length} résultats
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
