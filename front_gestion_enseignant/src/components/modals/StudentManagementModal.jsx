import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaSave, FaUser, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { toast } from 'sonner';

/**
 * Composant de modale pour la gestion des étudiants (ajout/édition).
 * Ce composant est conçu pour être utilisé à l'intérieur d'un wrapper de modale générique.
 *
 * @param {object} props - Les props du composant.
 * @param {string} props.promotionId - L'ID de la promotion à laquelle l'étudiant appartient.
 * @param {object} [props.initialData] - Données initiales de l'étudiant pour l'édition. Null pour la création.
 * @param {function} props.onSaveSuccess - Fonction de rappel à appeler après une sauvegarde réussie.
 * @param {function} props.onCancel - Fonction de rappel à appeler lors de l'annulation.
 */
const StudentManagementModal = ({ promotionId, initialData, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        matricule: initialData?.matricule || '',
        is_delegate: initialData?.is_delegate || false, // Par défaut à false pour la création
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Détermine si on est en mode édition ou création
    const isEditing = !!initialData;

    useEffect(() => {
        // Réinitialiser les erreurs lors de l'ouverture ou du changement de données initiales
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Effacer l'erreur pour le champ modifié
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Réinitialiser les erreurs de validation
        setIsSubmitting(true);

        try {
            let response;
            if (isEditing) {
                // Mise à jour d'un étudiant existant
                response = await axios.put(`/api/promotions/${promotionId}/students/${initialData.id}`, formData);
                toast.success("Étudiant mis à jour avec succès !");
            } else {
                // Création d'un nouvel étudiant
                // Lors de la création, is_delegate est géré par le backend pour être false par défaut
                const dataToCreate = { ...formData };
                delete dataToCreate.is_delegate; // S'assurer que le frontend n'envoie pas is_delegate à la création
                response = await axios.post(`/api/promotions/${promotionId}/students`, dataToCreate);
                toast.success("Étudiant ajouté avec succès !");
            }
            await onSaveSuccess(); // Appeler la fonction de rappel pour rafraîchir la liste
            onCancel(); // Fermer la modale
        } catch (err) {
            console.error("Erreur lors de la sauvegarde de l'étudiant:", err);
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
                toast.error("Veuillez corriger les erreurs de validation.");
            } else {
                const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.";
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEditing ? "Modifier l'Étudiant" : "Ajouter un Étudiant";

    return (
        // Le formulaire est maintenant l'élément racine, comme dans UserManagementModal
        <form
            className="max-w-[500px] flex flex-col max-h-[95vh] overflow-y-auto my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white p-4 rounded-xl"
            style={{ boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)" }}
            onSubmit={handleSubmit}
        >
            {/* En-tête de la modale - Inspiré de UserManagementModal */}
            <div className="my-4 flex items-center justify-between">
                <span className="text-teal-700 text-lg font-semibold">{modalTitle}</span>
                <button
                    onClick={onCancel}
                    type="button"
                    className="cursor-pointer p-2 rounded-full bg-teal-100 size-[30px] flex items-center justify-center"
                >
                    <i className="fa-solid fa-x text-sm text-teal-800"></i>
                </button>
            </div>

            {/* Formulaire - Inspiré de UserManagementModal */}
            <div className="space-y-6">
                {/* Champ Nom complet */}
                <div className="space-y-2">
                    <label htmlFor="full_name" className="flex items-center text-sm font-medium text-gray-700">
                        <FaUser className="w-4 h-4 mr-2 text-teal-600" /> Nom Complet
                    </label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>

                {/* Champ Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                        <FaEnvelope className="w-4 h-4 mr-2 text-teal-600" /> Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Champ Matricule */}
                <div className="space-y-2">
                    <label htmlFor="matricule" className="flex items-center text-sm font-medium text-gray-700">
                        <FaIdCard className="w-4 h-4 mr-2 text-teal-600" /> Matricule
                    </label>
                    <input
                        type="text"
                        id="matricule"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.matricule ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {errors.matricule && <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>}
                </div>

                {/* Checkbox Délégué (visible seulement en mode édition) */}
                {isEditing && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_delegate"
                            name="is_delegate"
                            checked={formData.is_delegate}
                            onChange={handleChange}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_delegate" className="ml-2 block text-sm text-gray-900">
                            Délégué de promotion
                        </label>
                    </div>
                )}
            </div>

            {/* Boutons d'action - Inspiré de UserManagementModal */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
                </button>

                <button
                    onClick={onCancel}
                    type="button"
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
};

export default StudentManagementModal;
