import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* -------------------------------------------------- */
/* Données mock (à remplacer par vos appels API)      */
/* -------------------------------------------------- */
const coursesData = [
  {
    id: 1,
    name: "Introduction à l'Informatique",
    description: "Ce cours présente les concepts fondamentaux de l'informatique, y compris l'architecture des ordinateurs...",
    teacher: "Dr. Thomas Martin",
    level: "Niveau 1",
    levelColor: "bg-blue-100 text-blue-700"
  },
  {
    id: 2,
    name: "Algorithmes et Structures de Données",
    description: "Étude approfondie des algorithmes et des structures de données fondamentales utilisées en programmation...",
    teacher: "Dr. Marie Laurent",
    level: "Niveau 2",
    levelColor: "bg-green-100 text-green-700"
  },
  {
    id: 3,
    name: "Bases de Données Relationnelles",
    description: "Introduction aux concepts des bases de données relationnelles, au langage SQL et à la conception de...",
    teacher: "Prof. Philippe Dubois",
    level: "Niveau 2",
    levelColor: "bg-green-100 text-green-700"
  },
  {
    id: 4,
    name: "Programmation Orientée Objet",
    description: "Principes et pratiques de la programmation orientée objet, avec des exemples en Java et C++...",
    teacher: "Dr. Sophie Bernard",
    level: "Niveau 1",
    levelColor: "bg-blue-100 text-blue-700"
  },
  {
    id: 5,
    name: "Réseaux Informatiques",
    description: "Étude des principes fondamentaux des réseaux informatiques, des protocoles et des architectures.",
    teacher: "Prof. Lucas Petit",
    level: "Niveau 3",
    levelColor: "bg-purple-100 text-purple-700"
  },
  {
    id: 6,
    name: "Intelligence Artificielle",
    description: "Introduction aux concepts et techniques de l'intelligence artificielle, y compris l'apprentissage automatique...",
    teacher: "Dr. Emma Leroy",
    level: "Niveau 3",
    levelColor: "bg-purple-100 text-purple-700"
  },
  {
    id: 7,
    name: "Développement Web",
    description: "Conception et développement d'applications web modernes utilisant HTML, CSS, JavaScript et des frameworks...",
    teacher: "Prof. Hugo Moreau",
    level: "Niveau 2",
    levelColor: "bg-green-100 text-green-700"
  },
  {
    id: 8,
    name: "Sécurité Informatique",
    description: "Principes et pratiques de la sécurité informatique, y compris la cryptographie, la sécurité des réseaux...",
    teacher: "Dr. Chloé Simon",
    level: "Niveau 3",
    levelColor: "bg-purple-100 text-purple-700"
  }
];

const Courses = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("Tous les niveaux");
  const [teacherFilter, setTeacherFilter] = useState("Tous les enseignants");

  const filtered = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === "Tous les niveaux" || course.level === levelFilter;
      const matchesTeacher = teacherFilter === "Tous les enseignants" || course.teacher === teacherFilter;

      return matchesSearch && matchesLevel && matchesTeacher;
    });
  }, [search, levelFilter, teacherFilter]);

  // Statistiques
  const totalCourses = coursesData.length;
  const level1Courses = coursesData.filter(c => c.level === "Niveau 1").length;
  const level2Courses = coursesData.filter(c => c.level === "Niveau 2").length;
  const level3Courses = coursesData.filter(c => c.level === "Niveau 3").length;
  const totalTeachers = [...new Set(coursesData.map(c => c.teacher))].length;

  return (
    <div className="space-y-6 min-h-screen">
      {/* ——— Header ——— */}
      <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
          <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
          <span>gestion des cours</span>
      </div>

      {/* ——— Cards statistiques ——— */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre total de cours</p>
              <p className="text-2xl font-bold text-teal-600">{totalCourses}</p>
              <p className="text-sm text-gray-500">cours enregistrés</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Répartition par niveau</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Niveau 1</span>
                <span className="font-medium text-teal-600">{level1Courses} cours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Niveau 2</span>
                <span className="font-medium text-teal-600">{level2Courses} cours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Niveau 3</span>
                <span className="font-medium text-teal-600">{level3Courses} cours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enseignants assignés</p>
              <p className="text-2xl font-bold text-teal-600">{totalTeachers}</p>
              <p className="text-sm text-gray-500">enseignants</p>
            </div>
          </div>
        </div>
      </div>

      {/* ——— Outils (Recherche / Filtres / Actions) ——— */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Bloc gauche */}
        <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-4">

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Tous les niveaux</option>
              <option>Niveau 1</option>
              <option>Niveau 2</option>
              <option>Niveau 3</option>
            </select>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="text-sm border bg-white border-gray-300 rounded-md px-3 py-2"
            >
              <option>Tous les enseignants</option>
              {[...new Set(coursesData.map(c => c.teacher))].map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bloc actions */}
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2">
            <i className="fas fa-redo"></i> Réinitialiser
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 inline-flex items-center gap-2">
            <i className="fas fa-plus"></i> Ajouter un cours
          </button>
        </div>
      </div>

      {/* ——— Vue mobile (cartes) ——— */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {filtered.map((course) => (
            <div key={course.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {course.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                        <i className="fas fa-eye text-sm"></i>
                      </button>
                      <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {course.teacher}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.levelColor}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm">Aucun cours trouvé.</p>
          )}
        </div>
      </div>

      {/* ——— Vue desktop (tableau) ——— */}
      <div className="hidden lg:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Nom du cours</th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-left">Enseignant</th>
              <th className="px-6 py-4 text-left">Niveau</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {course.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="max-w-xs truncate" title={course.description}>
                    {course.description.substring(0, 70)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {course.teacher}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.levelColor}`}>
                    {course.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4 text-gray-600">
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
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  Aucun cours trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ——— Pagination ——— */}
      <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between text-sm text-gray-700">
        <span>
          Affichage de 1 à {filtered.length} sur {coursesData.length} résultats
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50">
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="px-3 py-1 bg-teal-600 text-white rounded-md">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;