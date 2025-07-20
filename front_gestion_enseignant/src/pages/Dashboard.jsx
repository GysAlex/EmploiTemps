// Pour résoudre les erreurs de compilation "Could not resolve":
// 1. Pour "react-icons/fa": Assurez-vous d'avoir installé le package 'react-icons'.
//    Exécutez la commande suivante dans votre terminal à la racine de votre projet React:
//    npm install react-icons
//    ou
//    yarn add react-icons

// 2. Pour "../components/PromotionsTable": Assurez-vous que le fichier PromotionsTable.jsx existe bien
//    dans le dossier 'src/components/' (si Dashboard.jsx est dans 'src/pages/').
//    Vérifiez que le nom du fichier et son chemin sont corrects.

import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios'; // Import axios for API calls
import {
	FaUserFriends,
	FaChalkboardTeacher,
	FaCalendarAlt,
	FaUserCog,
	FaRegCalendarPlus,
	FaRegEye,
	FaPlus,
	FaSearch,
} from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend as ChartLegend,
} from "chart.js";
import PromotionsTable from "../components/PromotionsTable";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

/**
 * Dashboard.jsx – page « / » (Outlet racine)
 * Palette : accent #0694A2 • surface #FFFFFF • secondaire #9CA3AF
 * Dépendances : chart.js + react-chartjs-2  (npm i chart.js react-chartjs-2)
 */

export default function Dashboard() {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const response = await axios.get('/api/dashboard-stats'); // Appel de votre route API
				setDashboardData(response.data);
			} catch (err) {
				console.error("Erreur lors de la récupération des données du tableau de bord :", err);
				setError("Échec du chargement des données du tableau de bord.");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []); // Le tableau de dépendances vide signifie que cela s'exécute une fois au montage

	// Données statistiques mémorisées pour le rendu
	const stats = useMemo(() => {
		if (!dashboardData) return [];
		return [
			{ title: "Étudiants", value: dashboardData.stats.students, icon: FaUserFriends, tint: "#E0F7FA" },
			{ title: "Enseignants", value: dashboardData.stats.teachers, icon: FaChalkboardTeacher, tint: "#E7FAF0" },
			{ title: "Emplois du temps", value: dashboardData.stats.timetables, icon: FaCalendarAlt, tint: "#F4F1FF" },
			{ title: "Administrateurs", value: dashboardData.stats.administrators, icon: FaUserCog, tint: "#FFF9E7" },
		];
	}, [dashboardData]);

	// Données du graphique en anneau (absences)
	const absenceChartData = useMemo(() => {
		if (!dashboardData) return { labels: [], datasets: [] };
		return {
			labels: ["Justifiées", "Non justifiées"],
			datasets: [
				{
					data: [dashboardData.absence_chart_data.justified, dashboardData.absence_chart_data.unjustified],
					backgroundColor: ["#0694A2", "#9CA3AF"],
					borderWidth: 0,
				},
			],
		};
	}, [dashboardData]);

	const absenceChartOptions = {
		cutout: "70%",
		plugins: { legend: { display: false } },
	};

	if (error) {
		return (
			<div className="text-center text-red-600 p-8">
				<p>{error}</p>
				<p>Veuillez réessayer plus tard.</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* ─────────── Cartes de Statistiques ─────────── */}
			<div className="my-2 text-md text-[#0694A2]">
				Informations générales
			</div>
			<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{loading ? (
					// Skeleton loader pour les cartes de statistiques
					Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-lg shadow-sm animate-pulse">
							<div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
							<div>
								<div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
								<div className="h-6 bg-gray-200 rounded w-16"></div>
							</div>
						</div>
					))
				) : (
					stats.map(({ title, value, icon: Icon, tint }) => (
						<div key={title} className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
							<div className="p-3 rounded-full" style={{ backgroundColor: tint }}>
								<Icon className="w-6 h-6 text-[#0694A2]" />
							</div>
							<div>
								<p className="text-sm text-gray-500 font-medium">{title}</p>
								<p className="text-2xl font-bold text-[#0694A2]">{value}</p>
							</div>
						</div>
					))
				)}
			</section>

			{/* ─────────── Ligne d'Insights ─────────── */}
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{loading ? (
					// Skeleton loader pour les cartes d'insights
					Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<div className="animate-pulse">
								<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
								<div className="h-40 bg-gray-200 rounded mb-4"></div>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							</div>
						</Card>
					))
				) : (
					<>
						{/* Graphique en anneau des absences */}
						<Card title="Absences des enseignants">
							<div className="h-60">
								<Doughnut data={absenceChartData} options={absenceChartOptions} />
							</div>
							<Legend items={[{ name: "Justifiées", color: "#0694A2" }, { name: "Non justifiées", color: "#9CA3AF" }]} />
						</Card>

						{/* Progression des emplois du temps */}
						<Card title="Emplois du temps">
							<ProgressLabel
								label="Actifs / Publiés"
								value={dashboardData.timetable_progress.active_published}
								total={dashboardData.timetable_progress.total_for_progress}
								barColor="#0694A2"
							/>
							<ProgressLabel
								label="Planifiés"
								value={dashboardData.timetable_progress.planned}
								total={dashboardData.timetable_progress.total_for_progress}
								barColor="#8B5CF6"
							/>

							<h4 className="font-semibold mt-6 mb-3">Actions rapides</h4>
							<div className="flex gap-4 flex-wrap">
								<button className="inline-flex items-center gap-2 bg-[#0694A2] text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90">
									<FaRegCalendarPlus className="w-4 h-4" /> Créer un emploi
								</button>
								<button className="inline-flex items-center gap-2 border border-[#0694A2] text-[#0694A2] px-4 py-2 rounded-lg hover:bg-[#0694A2]/5">
									<FaRegEye className="w-4 h-4" /> Voir tous
								</button>
							</div>
						</Card>

						{/* Disponibilité des salles */}
						<Card title="Salles de classe">
							<div className="flex justify-between flex-wrap gap-2 mb-4">
								<StatBox label="Total" value={dashboardData.classrooms.total} />
								<StatBox label="Occupées" value={dashboardData.classrooms.occupied} valueClass="text-red-500" />
								<StatBox label="Disponibles" value={dashboardData.classrooms.available} valueClass="text-green-600" />
							</div>
							<ProgressLabel
								label="Disponibilité"
								value={dashboardData.classrooms.available}
								total={dashboardData.classrooms.total}
								barColor="#0694A2"
								showLabel={false}
							/>
							<p className="mt-2 text-center text-sm text-gray-500">
								{((dashboardData.classrooms.available / dashboardData.classrooms.total) * 100).toFixed(0)}% de disponibilité
							</p>
						</Card>
					</>
				)}
			</section>

			{/* ─────────── Tableau des Promotions ─────────── */}
			{loading ? (
				<Card>
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
						<div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
						<div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
						<div className="h-10 bg-gray-200 rounded w-full"></div>
					</div>
				</Card>
			) : (
				<PromotionsTable />
			)}
		</div>
	);
}

// ─────────── Fonctions utilitaires réutilisables ───────────
function Card({ title, children }) {
	return <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">{title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}{children}</div>;
}

function ProgressLabel({ label, value, total, barColor, showLabel = true }) {
	const percent = (value / total) * 100;
	return (
		<div className="mb-4">
			{showLabel && (
				<div className="flex justify-between text-sm mb-1">
					<span className="text-gray-600">{label}</span>
					<span className="text-[#0694A2] font-medium">{value}</span>
				</div>
			)}
			<div className="h-2 rounded-full bg-gray-200 overflow-hidden">
				<div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: barColor }} />
			</div>
		</div>
	);
}

function Legend({ items }) {
	return (
		<ul className="mt-4 space-y-1 text-sm">
			{items.map((item) => (
				<li key={item.name} className="flex items-center gap-2 text-gray-600">
					<span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
					{item.name}
				</li>
			))}
		</ul>
	);
}

function StatBox({ label, value, valueClass = "text-gray-800" }) {
	return (
		<div className="flex flex-col min-w-[95px] flex-grow items-center gap-1 bg-gray-50 rounded-lg px-3 py-2 text-sm">
			<span className="text-gray-500">{label}</span>
			<span className={`font-semibold ${valueClass}`}>{value}</span>
		</div>
	);
}
