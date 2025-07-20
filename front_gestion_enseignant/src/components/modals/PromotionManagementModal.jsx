// src/components/modals/PromotionManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { usePromotions } from '../../hooks/usePromotions';

export const PromotionManagementModal = ({ promotionData }) => {
    const { closeModal } = useModal();
    const { addPromotion, updatePromotion, loading: saving, validationErrors, setValidationErrors } = usePromotions();

    const isEditing = !!promotionData;

    const [formData, setFormData] = useState({
        name: '',
        level: 'Niveau 1',
        // 'students' field is removed as it's now calculated dynamically on the backend
        published: false, // Default initialization
    });

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: promotionData.name || '',
                level: promotionData.level || 'Niveau 1',
                // 'students' field is removed from initialData assignment
                published: promotionData.published || false, // Use existing value
            });
        } else {
            setFormData({
                name: '',
                level: 'Niveau 1',
                // 'students' field is removed from default initialization
                published: false, // Default "En attente" for a new promotion
            });
        }
        setValidationErrors({});
    }, [promotionData, isEditing, setValidationErrors]);

    const availableLevels = ["Niveau 1", "Niveau 2", "Niveau 3", "Niveau 4", "Niveau 5"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        let clientErrors = {};
        if (!formData.name.trim()) clientErrors.name = ['Le nom de la promotion est obligatoire.'];
        // Removed client-side validation for 'students'

        if (Object.keys(clientErrors).length > 0) {
            setValidationErrors(clientErrors);
            return;
        }

        const promoToSave = {
            name: formData.name,
            level: formData.level,
            // 'students' field is no longer sent from the frontend
            // 'published' field is also not sent as it's a derived status
        };

        try {
            if (isEditing) {
                await updatePromotion(promotionData.id, promoToSave);
            } else {
                await addPromotion(promoToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Erreur de soumission du formulaire:", error);
        }
    };

    const modalTitle = isEditing ? 'Modifier la promotion' : 'Ajouter une promotion';

    // Determine the status and color classes for 'published'
    const publishedStatusText = promotionData?.published ? "Oui" : "En attente"; // Use promotionData.published directly
    const publishedStatusClasses = promotionData?.published
        ? "bg-green-100 text-green-700 border-green-300" // Green for "Oui"
        : "bg-orange-100 text-orange-700 border-orange-300"; // Orange for "En attente"

    return (
        <form
            className="max-w-[500px] flex flex-col max-h-[95vh] overflow-y-auto my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white p-4 rounded-xl"
            style={{ boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)" }}
            onSubmit={handleSubmit}
        >
            <div className="my-4 flex items-center justify-between">
                <span className="text-teal-700 text-lg font-semibold">{modalTitle}</span>
                <button
                    onClick={closeModal}
                    type="button"
                    className="cursor-pointer p-2 rounded-full bg-teal-100 size-[30px] flex items-center justify-center"
                >
                    <i className="fa-solid fa-x text-sm text-teal-800"></i>
                </button>
            </div>

            <div className="space-y-6">
                {/* Champ Nom */}
                <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-tag w-4 h-4 mr-2 text-teal-600"></i>
                        Nom de la promotion
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name[0]}</p>
                    )}
                </div>

                {/* Champ Niveau */}
                <div className="space-y-2">
                    <label htmlFor="level" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-layer-group w-4 h-4 mr-2 text-teal-600"></i>
                        Niveau
                    </label>
                    <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.level ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    >
                        {availableLevels.map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                    </select>
                    {validationErrors.level && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.level[0]}</p>
                    )}
                </div>

                {/* Champ Statut de Publication de l'emploi du temps (Lecture seule) */}
                <div className="space-y-2">
                    <label htmlFor="published-status" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-calendar-check w-4 h-4 mr-2 text-teal-600"></i>
                        Emploi du temps publié cette semaine
                    </label>
                    <div
                        id="published-status"
                        className={`w-full px-3 py-2 border rounded-md text-sm font-medium
                                   ${publishedStatusClasses}
                                   cursor-default`}
                    >
                        {publishedStatusText}
                    </div>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isEditing ? 'Modification...' : 'Ajout...'}
                        </>
                    ) : (
                        isEditing ? 'Sauvegarder les modifications' : 'Ajouter la promotion'
                    )}
                </button>

                <button
                    onClick={closeModal}
                    type="button"
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={saving}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
};
