import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaEye, FaEdit, FaCalendarAlt, FaClock, FaUsers, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Le nom du composant a été changé ici
const TimeTableList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tous les niveaux');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées
  const emplois = [
    { id: 1, semaine: 'Semaine 15', niveau: 'Niveau 1', promotion: 'Informatique L1', statut: 'Publié', color: 'blue' },
    { id: 2, semaine: 'Semaine 15', niveau: 'Niveau 1', promotion: 'Mathématiques L1', statut: 'En attente', color: 'blue' },
    { id: 3, semaine: 'Semaine 15', niveau: 'Niveau 2', promotion: 'Informatique L2', statut: 'Publié', color: 'green' },
    { id: 4, semaine: 'Semaine 15', niveau: 'Niveau 2', promotion: 'Mathématiques L2', statut: 'Mis à jour', color: 'green' },
    { id: 5, semaine: 'Semaine 15', niveau: 'Niveau 3', promotion: 'Informatique L3', statut: 'Publié', color: 'purple' },
    { id: 6, semaine: 'Semaine 15', niveau: 'Niveau 3', promotion: 'Mathématiques L3', statut: 'En attente', color: 'purple' },
    { id: 7, semaine: 'Semaine 15', niveau: 'Niveau 1', promotion: 'Physique L1', statut: 'Publié', color: 'blue' },
    { id: 8, semaine: 'Semaine 15', niveau: 'Niveau 2', promotion: 'Physique L2', statut: 'En attente', color: 'green' },
    { id: 9, semaine: 'Semaine 15', niveau: 'Niveau 3', promotion: 'Physique L3', statut: 'Mis à jour', color: 'purple' },
    { id: 10, semaine: 'Semaine 15', niveau: 'Niveau 1', promotion: 'Chimie L1', statut: 'En attente', color: 'blue' },
  ];

  const stats = {
    totalEmplois: 42,
    emploisDefinis: 65,
    promotionsSansEDT: 12
  };

  const filteredEmplois = emplois.filter(emploi =>
    emploi.promotion.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLevel === 'Tous les niveaux' || emploi.niveau === selectedLevel)
  );

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'Publié': return 'bg-green-100 text-green-700 border-green-200';
      case 'En attente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Mis à jour': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNiveauColor = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
        <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
            <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
            <span>gestion des emplois de temps</span>
        </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Semaine actuelle</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">Semaine 15</p>
                <p className="text-xs text-slate-500 mt-1">Du 10 avril au 16 avril 2023</p>
              </div>
              <div className="bg-cyan-100 p-3 rounded-xl">
                <FaCalendarAlt className="text-cyan-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total des emplois du temps</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalEmplois}</p>
                <p className="text-xs text-slate-500 mt-1">emplois du temps</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl">
                <FaClock className="text-slate-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Emplois du temps définis</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.emploisDefinis}%</p>
                <p className="text-xs text-slate-500 mt-1">des promotions</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FaUsers className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.promotionsSansEDT}</p>
                <p className="text-xs text-slate-500 mt-1">promotions sans EDT</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <FaExclamationCircle className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <FaChevronLeft className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
                <span className="bg-slate-100 px-4 py-2 rounded-lg font-medium text-slate-700">Semaine actuelle</span>
                <FaChevronRight className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
              </div>
              
              <select
                className="border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option>Tous les niveaux</option>
                <option>Niveau 1</option>
                <option>Niveau 2</option>
                <option>Niveau 3</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une promotion..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 w-full lg:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                <FaFilter size={18} />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Table Desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Semaine</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Promotion</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut de l'EDT</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmplois.map((emploi, index) => (
                  <tr key={emploi.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{emploi.semaine}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getNiveauColor(emploi.color)}`}>
                        {emploi.niveau}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{emploi.promotion}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(emploi.statut)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          emploi.statut === 'Publié' ? 'bg-green-500' :
                          emploi.statut === 'En attente' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        {emploi.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {emploi.statut === 'Publié' || emploi.statut === 'Mis à jour' ? (
                          <button className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                            <FaEye />
                          </button>
                        ) : null}
                        <button className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                          <FaEdit />
                        </button>
                        {emploi.statut === 'En attente' ? (
                          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                            Ajouter l'EDT
                          </button>
                        ) : (
                          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                            Mettre à jour l'EDT
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Desktop */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Affichage de 1 à 10 sur {filteredEmplois.length} résultats
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors duration-150">
                  <FaChevronLeft />
                </button>
                {[1, 2, 3, 4, 5].map(page => (
                  <button
                    key={page}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      page === 1
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors duration-150">
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vue mobile (cartes) */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {filteredEmplois.map((emploi) => (
              <div key={emploi.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-900 truncate">
                        {emploi.promotion}
                      </h3>
                      <div className="flex space-x-2">
                        {emploi.statut === 'Publié' || emploi.statut === 'Mis à jour' ? (
                          <button className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                            <FaEye />
                          </button>
                        ) : null}
                        <button className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-600">
                        {emploi.semaine}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getNiveauColor(emploi.color)}`}>
                        {emploi.niveau}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(emploi.statut)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          emploi.statut === 'Publié' ? 'bg-green-500' :
                          emploi.statut === 'En attente' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        {emploi.statut}
                      </span>
                      {emploi.statut === 'En attente' ? (
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                          Ajouter l'EDT
                        </button>
                      ) : (
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                          Mettre à jour l'EDT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredEmplois.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-2">
                  <FaCalendarAlt className="text-5xl mx-auto" />
                </div>
                <p className="text-slate-500 text-sm">Aucun emploi du temps trouvé.</p>
              </div>
            )}
          </div>

          {/* Pagination Mobile */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {filteredEmplois.length} résultats
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors duration-150">
                  <FaChevronLeft />
                </button>
                <span className="px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg">1</span>
                <button className="px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors duration-150">
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableList; // L'exportation du composant a également été mise à jour