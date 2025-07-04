import { useState, useMemo } from "react";
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
  // ─────────── Stats cards (dummy data) ───────────
  const stats = [
    { title: "Étudiants", value: 1245, icon: FaUserFriends, tint: "#E0F7FA" },
    { title: "Enseignants", value: 87, icon: FaChalkboardTeacher, tint: "#E7FAF0" },
    { title: "Emplois du temps", value: 42, icon: FaCalendarAlt, tint: "#F4F1FF" },
    { title: "Administrateurs", value: 8, icon: FaUserCog, tint: "#FFF9E7" },
  ];

  // ─────────── Doughnut (absences) ───────────
  const absenceChartData = {
    labels: ["Justifiées", "Non justifiées"],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ["#0694A2", "#9CA3AF"],
        borderWidth: 0,
      },
    ],
  };
  const absenceChartOptions = {
    cutout: "70%",
    plugins: { legend: { display: false } },
  };


  return (
    <div className="space-y-8">
      {/* ─────────── Stat Cards ─────────── */}
      <div className="my-2 text-md text-[#0694A2]">
        informations générales
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ title, value, icon: Icon, tint }) => (
          <div key={title} className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="p-3 rounded-full" style={{ backgroundColor: tint }}>
              <Icon className="w-6 h-6 text-[#0694A2]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{title}</p>
              <p className="text-2xl font-bold text-[#0694A2]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─────────── Insights Row ─────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Absence donut */}
        <Card title="Absences des enseignants">
          <div className="h-60">
            <Doughnut data={absenceChartData} options={absenceChartOptions} />
          </div>
          <Legend items={[{ name: "Justifiées", color: "#0694A2" }, { name: "Non justifiées", color: "#9CA3AF" }]} />
        </Card>

        {/* Schedule progress */}
        <Card title="Emplois du temps">
          <ProgressLabel label="Actifs / Publiés" value={28} total={100} barColor="#0694A2" />
          <ProgressLabel label="Planifiés" value={14} total={100} barColor="#8B5CF6" />

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

        {/* Room availability */}
        <Card title="Salles de classe">
          <div className="flex justify-between gap-2 mb-4">
            <StatBox label="Total" value={45} />
            <StatBox label="Occupées" value={28} valueClass="text-red-500" />
            <StatBox label="Disponibles" value={17} valueClass="text-green-600" />
          </div>
          <ProgressLabel label="Disponibilité" value={17} total={45} barColor="#0694A2" showLabel={false} />
          <p className="mt-2 text-center text-sm text-gray-500">38% de disponibilité</p>
        </Card>
      </section>

      {/* ─────────── Promotions Table ─────────── */}
        <PromotionsTable />

    </div>
  );
}

// ─────────── Reusable helpers ───────────
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
    <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg px-3 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
