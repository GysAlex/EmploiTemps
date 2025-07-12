// src/components/ClassroomManagement/ClassroomManagementModal.jsx
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useClassrooms } from "../../hooks/useClassrooms";

export function ClassroomManagementModal({ classroomData }) {
    const { closeModal } = useModal();
    const { createClassroom, updateClassroom, isSaving, validationErrors, setValidationErrors } = useClassrooms();

    const isCreating = !classroomData;

    const availableTypes = ["Amphithéâtre", "Salle de Cours", "Salle TP"];

    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        type: availableTypes[0], // Type par défaut initial
        available: true,         // Disponible par défaut initial
    });

    // État pour le type sélectionné (géré par les boutons)
    const [selectedType, setSelectedType] = useState(availableTypes[0]);

    useEffect(() => {
        if (classroomData) {
            // Mode mise à jour : pré-remplir avec les données existantes
            setFormData({
                name: classroomData.name || '',
                capacity: classroomData.capacity || '',
                type: classroomData.type || availableTypes[0],
                available: classroomData.available ?? true,
            });
            setSelectedType(classroomData.type || availableTypes[0]); // Initialiser le type sélectionné pour les boutons
        } else {
            // Mode création : réinitialiser
            setFormData({
                name: '',
                capacity: '',
                type: availableTypes[0],
                available: true, // Toujours vrai par défaut pour la création
            });
            setSelectedType(availableTypes[0]); // Réinitialiser le type sélectionné
        }
        setValidationErrors({});
    }, [classroomData, setValidationErrors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target; // On n'a plus de checkbox, donc pas besoin de 'type' ou 'checked' ici
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleTypeChange = (typeToSelect) => {
        setSelectedType(typeToSelect);
        setFormData(prev => ({
            ...prev,
            type: typeToSelect
        }));
        // Effacer l'erreur de validation pour le type si elle existait
        if (validationErrors.type) {
            setValidationErrors(prev => ({ ...prev, type: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            // Assurez-vous que le formData envoyé contient le selectedType et la disponibilité
            const dataToSave = {
                ...formData,
                type: selectedType, // Utilise le type du bouton sélectionné
                available: formData.available, // Utilise l'état de disponibilité, qui sera toujours true en création
            };

            if (isCreating) {
                await createClassroom(dataToSave);
            } else {
                await updateClassroom(classroomData.id, dataToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la soumission du formulaire salle de classe:", error);
        }
    };

    const modalTitle = isCreating ? "Ajouter une salle de classe" : "Modifier la salle de classe";

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
                        <i className="fas fa-building w-4 h-4 mr-2 text-teal-600"></i>
                        Nom de la salle
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

                {/* Champ Capacité */}
                <div className="space-y-2">
                    <label htmlFor="capacity" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-chair w-4 h-4 mr-2 text-teal-600"></i>
                        Capacité
                    </label>
                    <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                        min="1"
                    />
                    {validationErrors.capacity && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.capacity[0]}</p>
                    )}
                </div>

                {/* Section Type de Salle (avec boutons) */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-th-large w-4 h-4 mr-2 text-teal-600"></i>
                        Type de salle
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {availableTypes.map(type => (
                            <button
                                key={type}
                                type="button" // Très important pour éviter la soumission du formulaire
                                onClick={() => handleTypeChange(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                    ${selectedType === type
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    {validationErrors.type && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.type[0]}</p>
                    )}
                </div>

                {/* Champ Disponibilité (texte explicite en lecture seule) */}
                <div className="space-y-2">
                    <label htmlFor="available" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-door-open w-4 h-4 mr-2 text-teal-600"></i>
                        Disponibilité
                    </label>
                    <input
                        type="text"
                        id="available"
                        name="available"
                        value={formData.available ? "Disponible" : "Non disponible"} // Texte explicite
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none"
                        readOnly // Rendu en lecture seule
                    />
                    {isCreating && (
                        <p className="text-gray-500 text-xs mt-1">
                            Par défaut, la salle est **Disponible** lors de la création.
                        </p>
                    )}
                    {!isCreating && (
                        <p className="text-gray-500 text-xs mt-1">
                            La disponibilité peut être modifiée par d'autres processus (ex: réservation).
                        </p>
                    )}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement...' : (isCreating ? 'Ajouter' : 'Mettre à jour')}
                </button>

                <button
                    onClick={closeModal}
                    type="button"
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={isSaving}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}