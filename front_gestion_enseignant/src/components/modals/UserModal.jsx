import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser";

export function UserModal({userData}) {
    const { closeModal } = useModal(); // Récupère isOpen pour contrôler l'affichage

    // Accède au contexte utilisateur pour l'utilisateur courant et la fonction de mise à jour
    const { user: currentUser, updateUser } = useUser();

    // État local pour les données du formulaire du modal
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [isSaving, setIsSaving] = useState(false); // État pour le loader du bouton
    const [selectedRoles, setSelectedRoles] = useState([]); // Pour gérer les rôles sélectionnés dans le modal

    // Vérifie si l'utilisateur actuellement connecté peut éditer les rôles
    const canEditRoles = currentUser && currentUser.roles && currentUser.roles.includes('super_admin');
    const availableRoles = ["super_admin", "admin", "enseignant"]; // Tous les rôles possibles

    // Effet pour initialiser le formulaire avec les données de l'utilisateur à éditer (userData)
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
            });
            // Assure-toi que userData.roles est bien un tableau de noms de rôles
            setSelectedRoles(userData.roles || []);
        }
    }, [userData]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleToggle = (roleToToggle) => {
        if (!canEditRoles) return; // Empêche le changement si l'utilisateur n'est pas super_admin

        setSelectedRoles(prevRoles => {
            if (prevRoles.includes(roleToToggle)) {
                // Si le rôle est déjà présent, le retire
                return prevRoles.filter(role => role !== roleToToggle);
            } else {
                // Sinon, l'ajoute
                return [...prevRoles, roleToToggle];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page par défaut du formulaire
        setIsSaving(true);
        try {
            const dataToUpdate = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                // Inclure les rôles uniquement si l'utilisateur connecté a le droit de les éditer
                ...(canEditRoles && { roles: selectedRoles }),
            };

            // Appelle la fonction updateUser du contexte qui gère déjà l'API et les toasts
            await updateUser(userData.id, dataToUpdate);

            closeModal(); // Ferme le modal après un succès (la notification est gérée par updateUser)
        } catch (error) {
            // L'erreur est déjà gérée par toast.promise dans updateUser, mais tu peux loguer ici
            console.error("Erreur lors de la sauvegarde dans le modal:", error);
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <form 
            className="max-w-[500px] flex flex-col my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white  p-4 rounded-xl" 
            style={{boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)"}} 
            onSubmit={handleSave}
        >
        <div className="my-4 flex items-center justify-between">
            <span className="text-teal-700 text-lg">Mettre à jour mes informations</span>
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
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-user w-4 h-4 mr-2 text-teal-600"></i>
                        Nom
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Champ Email */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-envelope w-4 h-4 mr-2 text-teal-600"></i>
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Champ Téléphone */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-phone w-4 h-4 mr-2 text-teal-600"></i>
                        Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                </div>

                {/* Section Rôles */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-briefcase w-4 h-4 mr-2 text-teal-600"></i>
                        Rôles
                    </label>
                    {canEditRoles ? (
                        // Affichage des boutons pour l'édition des rôles (si super_admin)
                        <div className="flex flex-wrap gap-2 mt-1">
                            {availableRoles.map(role => (
                                <button
                                    key={role}
                                    type="button" // Important: type="button" pour éviter la soumission du formulaire
                                    onClick={() => handleRoleToggle(role)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                        ${selectedRoles.includes(role)
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Affichage simple des rôles (si pas super_admin)
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium cursor-not-allowed">
                            {selectedRoles.length > 0 ? selectedRoles.map(role => role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)).join(', ') : 'Aucun rôle'}
                        </div>
                    )}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">

                <button
                    type="submit" // Type submit pour déclencher handleSave via onSubmit du formulaire
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>

                <button
                    onClick={closeModal}
                    type="button" // Important: type="button" pour ne pas soumettre le formulaire
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={isSaving}
                >
                    Annuler
                </button>

            </div>
        </form>
    );
}