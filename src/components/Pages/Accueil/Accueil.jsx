import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { PiDeskFill, PiClock, PiChartBar } from "react-icons/pi";
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

  // Animation pour les chiffres qui montent
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
        const increment = target / 30;
        const interval = setInterval(() => {
          if (count < target) {
            count = Math.min(count + increment, target);
            setCounts((prevCounts) => ({
              ...prevCounts,
              [key]: Math.round(count),
            }));
          } else {
            clearInterval(interval);
          }
        }, 20);
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
        label: "Équipements fonctionnels par catégorie",
        data: Object.values(equipmentByCategory),
        backgroundColor: "rgba(36, 194, 84, 0.7)",
        borderColor: "rgba(36, 194, 84, 0.7)",
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
        text: "Répartition des équipements par catégorie",
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
    animation: {
      duration: 2000,
      easing: "easeOutQuart",
      animateScale: true,
    },
  };

  const recentEquipments = equipmentList.slice(0, 5);

  // Animation variants
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Arrière-plan zellige marocain */}
      <div className="absolute inset-0 z-0 opacity-25">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://previews.123rf.com/images/nete/nete1609/nete160900014/63560280-mosa%C3%AFque-blanche-et-noire-zellige-moroccan-transparente.jpg')",
            backgroundSize: "600px",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-red-600">
              Plateforme de Gestion des Équipements
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Système centralisé de traçabilité et suivi temps réel des équipements
          </motion.p>
          <motion.div
            className="mt-8 flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/Gestion-Des-Équipements"
              className="px-8 py-3 bg-red-700 text-white font-medium rounded-lg shadow-lg hover:bg-red-800 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              Gestion des Équipements
            </Link>
            <Link
              to="/Equipment-Documentation"
              className="px-8 py-3 bg-white text-red-700 font-medium rounded-lg shadow-md hover:bg-gray-50 transition-all duration-300 border border-red-200 transform hover:-translate-y-1"
            >
              Documentation Technique
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              value: counts.equipments,
              label: "Équipements enregistrés",
              icon: <PiChartBar size={28} className="text-red" />,
              color: "bg-gradient-to-br from-red-700 to-red-600",
            },
            {
              value: counts.uniqueOffices,
              label: "Bureaux équipés",
              sublabel: `${counts.equipmentsPerOffice} équipements/bureau`,
              icon: <PiDeskFill size={28} className="text-white" />,
              color: "bg-gradient-to-br from-blue-600 to-blue-500",
            },
            {
              value: "24/7", // Support technique modifié (valeur fixe)
              label: "Support technique",
              icon: <PiClock size={28} className="text-white" />,
              color: "bg-gradient-to-br from-amber-600 to-amber-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
              className={`${stat.color} text-white flex flex-col justify-between p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[180px] w-full transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 bg-white/20 rounded-full">{stat.icon}</div>
                <div className="text-4xl font-bold drop-shadow-md">
                  {stat.value}
                </div>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-semibold tracking-wide">
                  {stat.label}
                </h3>
                {stat.sublabel && (
                  <p className="text-sm opacity-90 mt-1 font-light">
                    {stat.sublabel}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Graphique */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
            }}
            viewport={{ once: true }}
            className="bg-white flex flex-col justify-center p-6 rounded-2xl shadow-lg lg:col-span-2 hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-red-600 mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Répartition des équipements
              </h2>
            </div>
            <div className="w-full h-96">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Statistiques clés */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-red-600 mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Statistiques clés
              </h2>
            </div>

            <div className="space-y-6">
              {/* Stat 1 - Équipements par statut */}
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">
                  Répartition par statut
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const statusCounts = equipmentList.reduce(
                      (acc, equipment) => {
                        acc[equipment.statut] =
                          (acc[equipment.statut] || 0) + 1;
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
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  statut === "Fonctionnel"
                                    ? "bg-green-500"
                                    : statut === "Réformé en bureau"
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                                }`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Stat 2 - Top catégories */}
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">
                  Top catégories
                </h3>
                <ul className="space-y-3">
                  {Object.entries(equipmentByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([category, count], index) => (
                      <motion.li
                        key={category}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center mr-3 font-medium">
                          {count}
                        </span>
                        <span className="text-gray-600">{category}</span>
                      </motion.li>
                    ))}
                </ul>
              </div>

              {/* Stat 3 - Dernière mise à jour */}
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">
                  Dernière activité
                </h3>
                {recentEquipments.length > 0 && (
                  <div className="flex items-start">
                    <div className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">
                      <PiClock size={20} />
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
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-red-600 mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Équipements récents
              </h2>
            </div>
            <Link
              to="/Gestion-Des-Équipements"
              className="text-red-700 hover:text-red-900 font-medium flex items-center group"
            >
              <span className="group-hover:underline">Voir tout</span>
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    {["Type", "Marque", "Modèle", "N° Série", "Statut"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEquipments.map((equipment, index) => (
                    <motion.tr
                      key={equipment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {equipment.numero_serie}
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
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-red-600 mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Galerie des Équipements
            </h2>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            autoplay={{
              delay: 2500,
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
            }}
            className="rounded-2xl overflow-hidden shadow-xl border border-gray-200"
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
    </div>
  );
};

export default Accueil;
