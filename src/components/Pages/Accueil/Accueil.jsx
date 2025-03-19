import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import EcranImage from "../../../assets/images/ecran.png";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Importations pour le graphique
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

// Importer les données d'équipement
import equipmentData from "../EquipmentDocumentation/equipmentData"; // Assurez-vous que le chemin est correct

// Enregistrer les composants nécessaires de Chart.js
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
  });

  useEffect(() => {
    const animateNumbers = async () => {
      await controls.start({ opacity: 1, y: 0 });

      const targetCounts = {
        equipments: equipmentList.length,
        availability: 95,
        offices: 1445,
        support: 24,
      };

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

      Object.entries(targetCounts).forEach(([key, target]) => {
        incrementCount(target, key);
      });
    };

    animateNumbers();
  }, [controls, equipmentList]);

  // Filtrer les équipements fonctionnels
  const functionalEquipments = equipmentList.filter(
    (equipment) => equipment.statut === "Fonctionnel"
  );

  // Calculer le nombre d'équipements fonctionnels par catégorie
  const equipmentByCategory = functionalEquipments.reduce((acc, equipment) => {
    acc[equipment.type] = (acc[equipment.type] || 0) + 1;
    return acc;
  }, {});

  // Données pour le graphique en barres
  const chartData = {
    labels: Object.keys(equipmentByCategory),
    datasets: [
      {
        label: "Nombre d'équipements fonctionnels par catégorie",
        data: Object.values(equipmentByCategory),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Répartition des équipements fonctionnels par catégorie",
      },
    },
  };

  const recentEquipments = equipmentList.slice(0, 5); // Récupérer les 5 premiers éléments

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Section Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Gestion Centralisée des{" "}
          <span className="text-blue-600">Équipements</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Gérez vos équipements de manière efficace et professionnelle.
        </p>
      </div>

      {/* Section Statistiques */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="text-blue-600 text-3xl font-bold">
            {counts.equipments}+
          </div>
          <div className="mt-2 text-gray-600">Équipements enregistrés</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="text-blue-600 text-3xl font-bold">
            {counts.availability}%
          </div>
          <div className="mt-2 text-gray-600">Taux de disponibilité</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="text-blue-600 text-3xl font-bold">
            {counts.offices}+
          </div>
          <div className="mt-2 text-gray-600">Bureaux équipés</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="text-blue-600 text-3xl font-bold">
            {counts.support}/7
          </div>
          <div className="mt-2 text-gray-600">Support technique</div>
        </motion.div>
      </div>

      {/* Section Graphique pour les équipements fonctionnels */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Répartition des équipements fonctionnels par catégorie
        </h2>
        <div className="w-full flex justify-center h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Section Tableau des équipements récents */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Équipements récemment ajoutés
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full">
            <thead className="bg-gray-200">
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
            <tbody className="divide-y divide-gray-200">
              {recentEquipments.map((equipment) => (
                <motion.tr
                  key={equipment.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.marque}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.modele}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-sm font-semibold ${
                        equipment.statut === "Réformé en bureau"
                          ? "bg-red-200 text-red-800"
                          : equipment.statut === "Réformé en stock"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-green-200 text-green-800"
                      } rounded-full`}
                    >
                      {equipment.statut}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Bouton pour accéder au tableau des équipements */}
        <div className="mt-6 text-center">
          <Link to="/Gestion-Des-Équipements">
            <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
              Voir le tableau des équipements
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Section Galerie d'images avec Slideshow */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Galerie d'équipements
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 1500,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
          }}
          className="w-full h-96"
        >
          {equipmentData.map(
            (
              item // Utiliser equipmentData ici
            ) => (
              <SwiperSlide key={item.id}>
                <div className="relative h-full">
                  <img
                    src={item.image}
                    alt={item.title || item.model} // Utiliser le titre ou le modèle comme alternative
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-6 rounded-b-lg">
                    <h3 className="text-xl font-bold">
                    {item.brand} {item.title || item.model}
                      {/* Afficher le titre ou le modèle */}
                    </h3>
                    <p className="mt-2">
                      {item.description || item.category}{" "}
                      {/* Afficher la description ou la catégorie */}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </motion.div>
    </div>
  );
};

export default Accueil;
