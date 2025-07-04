import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileSection from '../components/ProfileSection'; // Assure-toi que le chemin est correct
import { useUser } from '../hooks/useUser'; // Importe le hook useUser
import { useModal } from '../hooks/useModal'; // Assure-toi que le chemin est correct pour ton hook de modal
import { UserModal } from '../components/modals/UserModal'; // Assure-toi que le chemin est correct pour ton composant de modal

export default function ProfileSettings() {
  // Accès au contexte utilisateur
  const { user, loading, error, updateUser } = useUser();
  
  // Accès au hook de modal
  const { openModal } = useModal();

  // État local pour les données du formulaire, qui seront seulement affichées
  const [displayData, setDisplayData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  // --- Effet pour charger les données utilisateur dans l'état d'affichage ---
  useEffect(() => {
    if (user) {
      setDisplayData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '', 
        role: user.roles.join(', ') || '',   
      });
    }
  }, [user]); // Déclenche cet effet chaque fois que l'objet 'user' du contexte change

  const handleOpenEditModal = () => {
    openModal(UserModal, { userData: user, onUpdateSuccess: updateUser });
  };

  // --- Gestion des états de chargement et d'erreur de l'utilisateur ---
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl text-gray-600">Chargement des paramètres de profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl text-red-500">Erreur lors du chargement des informations : {error}</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté ou les données ne sont pas disponibles après le chargement
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl text-gray-500">Veuillez vous connecter pour gérer votre profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-stretch justify-center">
        <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '>
          <i className="fa-solid fa-arrow-left"></i>retour
        </Link>
        <span>profil de l'utilisateur</span>
      </div>
      
      <div className="mx-auto space-y-6">
        {/* Section Mes Informations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header avec image de profil - utilise le contexte via ProfileSection */}
          <ProfileSection />

          <div className="pt-12 sm:pt-14 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Mes Informations
              </h2>
              <button 
                onClick={handleOpenEditModal} // Appelle la nouvelle fonction
                className="inline-flex gap-2 items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 w-full sm:w-auto justify-center"
              >
                <i className="fa-solid fa-edit"></i>
                <span>Modifier mes informations</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-user w-4 h-4 mr-2 text-teal-600"></i>
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={displayData.name}
                  readOnly // Rendu en lecture seule
                  className="w-full px-3 py-2 border-gray-100 rounded-md bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-envelope w-4 h-4 mr-2 text-teal-600"></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={displayData.email}
                  readOnly // Rendu en lecture seule
                  className="w-full px-3 py-2 border-gray-100 rounded-md bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent  cursor-not-allowed"
                />
              </div>

              {/* Rôle */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-briefcase w-4 h-4 mr-2 text-teal-600"></i>
                  Rôle
                </label>
                <input
                  type="text"
                  name="role"
                  value={displayData.role}
                  readOnly // Rendu en lecture seule
                  className="w-full px-3 py-2 border border-gray-100 rounded-md bg-teal-50 text-teal-700 font-medium cursor-not-allowed"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <i className="fas fa-phone w-4 h-4 mr-2 text-teal-600"></i>
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={displayData.phone}
                  readOnly // Rendu en lecture seule
                  className="w-full px-3 py-2 border-gray-100 rounded-md bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Modifier le mot de passe - SUPPRIMÉE car gérée par modal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Mise à jour de sécurité
              </h2>
              <button 
                onClick={handleOpenEditModal} // Appelle la nouvelle fonction
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 w-full sm:w-auto justify-center"
              >
                <i className="fa-solid fa-lock"></i>
                <span>Changer de mot de passe </span>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}