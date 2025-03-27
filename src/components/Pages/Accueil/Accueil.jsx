import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import equipmentData from "../EquipmentDocumentation/equipmentData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Accueil = ({ equipmentList }) => {
  const controls = useAnimation();
  const [counts, setCounts] = useState({
    equipments: 0,
    availability: 0,
    offices: 0,
    support: 0,
    uniqueOffices: 0,
    equipmentsPerOffice: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      const totalEquipment = equipmentList.length;
      const uniqueOffices = [...new Set(equipmentList.map((e) => e.bureau))]
        .length;
      const officeCounts = {};
      equipmentList.forEach((e) => {
        officeCounts[e.bureau] = (officeCounts[e.bureau] || 0) + 1;
      });
      const avgEquipmentPerOffice = Math.round(totalEquipment / uniqueOffices);

      return {
        totalEquipment,
        uniqueOffices,
        equipmentsPerOffice: avgEquipmentPerOffice,
        support: 24,
        availability: 95,
      };
    };

    const stats = calculateStats();

    const animateNumbers = async () => {
      await controls.start({ opacity: 1, y: 0 });

      const incrementCount = (target, key) => {
        let count = 0;
        const interval = setInterval(() => {
          if (count < target) {
            count++;
            setCounts((prevCounts) => ({ ...prevCounts, [key]: count }));
          } else {
            clearInterval(interval);
          }
        }, 10);
      };

      incrementCount(stats.totalEquipment, "equipments");
      incrementCount(stats.uniqueOffices, "uniqueOffices");
      incrementCount(stats.availability, "availability");
      incrementCount(stats.support, "support");
      setCounts((prev) => ({
        ...prev,
        equipmentsPerOffice: stats.equipmentsPerOffice,
      }));
    };

    animateNumbers();
  }, [controls, equipmentList]);

  const functionalEquipments = equipmentList.filter(
    (equipment) => equipment.statut === "Fonctionnel"
  );

  const equipmentByCategory = functionalEquipments.reduce((acc, equipment) => {
    acc[equipment.type] = (acc[equipment.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(equipmentByCategory),
    datasets: [
      {
        label: "Nombre d'équipements fonctionnels par catégorie",
        data: Object.values(equipmentByCategory),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#111827",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Répartition des équipements fonctionnels par catégorie",
        color: "#111827",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#6B7280",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
    },
  };

  const recentEquipments = equipmentList.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            EquipTrack Pro
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          La solution ultime pour une gestion optimisée de votre parc
          d'équipements
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/Gestion-Des-Équipements"
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:shadow-xl"
          >
            Explorer
          </Link>
          <Link
            to="/Equipment-Documentation"
            className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:bg-gray-50 transition-all duration-300 border border-indigo-100"
          >
            Documentation
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          {
            value: counts.equipments,
            label: "Équipements enregistrés",
            icon: "📊",
            color: "from-purple-600 to-indigo-600",
          },
          {
            value: `${counts.availability}%`,
            label: "Taux de disponibilité",
            icon: "✅",
            color: "from-green-500 to-teal-500",
          },
          {
            value: counts.uniqueOffices,
            label: "Bureaux équipés",
            sublabel: `${counts.equipmentsPerOffice} équipements/bureau`,
            icon: "🏢",
            color: "from-blue-500 to-cyan-500",
          },
          {
            value: `${counts.support}/7`,
            label: "Support technique",
            icon: "🛠️",
            color: "from-orange-500 to-amber-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={`bg-gradient-to-br ${stat.color} text-white flex items-center justify-center gap-3 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-4xl font-bold mb-1">{stat.value}</div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-medium">{stat.label}</div>
              {stat.sublabel && (
                <div className="text-sm opacity-80 mt-1">{stat.sublabel}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Graphique - Prend 2/3 de l'espace sur grand écran */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white flex flex-col justify-center p-6 rounded-2xl shadow-lg lg:col-span-2"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Analyse des équipements
          </h2>
          <div className="w-full h-96 ">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Nouvelles statistiques - Prend 1/3 de l'espace sur grand écran */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Statistiques clés
          </h2>

          <div className="space-y-6">
            {/* Stat 1 - Équipements par statut */}
            {/* Stat 1 - Équipements par statut - Version alternative */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Répartition par statut
              </h3>
              <div className="space-y-3">
                {(() => {
                  const statusCounts = equipmentList.reduce(
                    (acc, equipment) => {
                      acc[equipment.statut] = (acc[equipment.statut] || 0) + 1;
                      return acc;
                    },
                    {}
                  );

                  return [
                    "Fonctionnel",
                    "Réformé en bureau",
                    "Réformé en stock",
                  ]
                    .filter((statut) => statusCounts[statut])
                    .map((statut) => {
                      const count = statusCounts[statut];
                      const percentage = Math.round(
                        (count / equipmentList.length) * 100
                      );

                      return (
                        <div key={statut} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-600">
                              {statut}
                            </span>
                            <span className="text-gray-500">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                statut === "Fonctionnel"
                                  ? "bg-green-500"
                                  : statut === "Réformé en bureau"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* Stat 2 - Top catégories */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Top catégories</h3>
              <ul className="space-y-3">
                {Object.entries(equipmentByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <li key={category} className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                        {count}
                      </span>
                      <span className="text-gray-600">{category}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Stat 3 - Dernière mise à jour */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Dernière activité
              </h3>
              {recentEquipments.length > 0 && (
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Dernier ajout:{" "}
                      <span className="font-medium">
                        {recentEquipments[0].type}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Equipment Table */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Équipements récents
          </h2>
          <Link
            to="/Gestion-Des-Équipements"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            Voir tout <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modèle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEquipments.map((equipment, index) => (
                  <motion.tr
                    key={equipment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {equipment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {equipment.marque}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {equipment.modele}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          equipment.statut === "Réformé en bureau"
                            ? "bg-red-100 text-red-800"
                            : equipment.statut === "Réformé en stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {equipment.statut}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Equipment Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Notre parc d'équipements
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 2500,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
          }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          {equipmentData.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="relative h-80 group">
                <img
                  src={item.image}
                  alt={item.title || item.model}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {item.brand} {item.title || item.model}
                    </h3>
                    <p className="text-gray-200 mt-1">
                      {item.description || item.category}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </div>
  );
};

export default Accueil;
