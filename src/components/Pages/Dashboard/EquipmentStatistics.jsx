import React, { useState } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

// Register necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

// Animation variants for framer-motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const EquipmentStatistics = ({ equipmentList }) => {
  const [dateFilter, setDateFilter] = useState("year");
  const [bureauInput, setBureauInput] = useState("");
  const [bureauStats, setBureauStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleChartClick = () => {
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setBureauInput(value);

    if (!value.trim()) {
      setBureauStats(null);
    }
  };

  // Function to search for office statistics
  const handleSearchBureau = () => {
    const bureau = bureauInput.trim();
    if (!bureau) {
      setBureauStats(null);
      setErrorMessage("Veuillez entrer un numéro de bureau.");
      return;
    }
    const stats = equipmentList.reduce(
      (acc, equipment) => {
        if (equipment.bureau === bureau) {
          acc.total++;
          if (equipment.statut === "Réformé en bureau") {
            acc.reformedInBureau.push(equipment);
          } else if (equipment.statut === "Réformé en stock") {
            acc.reformedInStock.push(equipment);
          } else {
            acc.functional.push(equipment);
          }
        }
        return acc;
      },
      {
        total: 0,
        functional: [],
        reformedInBureau: [],
        reformedInStock: [],
      }
    );

    if (stats.total === 0) {
      setBureauStats(null);
      setErrorMessage(`Aucun bureau trouvé avec le numéro : ${bureau}`);
    } else {
      setBureauStats(stats);
      setErrorMessage("");
    }
  };

  // Function to handle hover
  const handleEquipmentHover = (equipments) => {
    setSelectedEquipment(equipments);
  };

  const handleEquipmentLeave = () => {
    setSelectedEquipment(null);
  };

  // Function to handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate statistics
  const totalEquipment = equipmentList.length;
  const reformedEquipmentInBureau = equipmentList.filter(
    (equipment) => equipment.statut === "Réformé en bureau"
  );
  const reformedEquipmentInStock = equipmentList.filter(
    (equipment) => equipment.statut === "Réformé en stock"
  );
  const totalReformedEquipment =
    reformedEquipmentInBureau.length + reformedEquipmentInStock.length;
  const functionalEquipment = totalEquipment - totalReformedEquipment;

  const reformedInBureauPercentage = (
    (reformedEquipmentInBureau.length / totalEquipment) *
    100
  ).toFixed(2);

  const reformedInStockPercentage = (
    (reformedEquipmentInStock.length / totalEquipment) *
    100
  ).toFixed(2);

  const functionalPercentage = (
    (functionalEquipment / totalEquipment) *
    100
  ).toFixed(2);

  // Group equipment by various categories
  const equipmentByCategory = equipmentList.reduce((acc, equipment) => {
    acc[equipment.type] = (acc[equipment.type] || 0) + 1;
    return acc;
  }, {});

  const equipmentByDivision = equipmentList.reduce((acc, equipment) => {
    acc[equipment.bureau] = Math.floor((acc[equipment.bureau] || 0) + 1);
    return acc;
  }, {});

  const equipmentByBrand = equipmentList.reduce((acc, equipment) => {
    acc[equipment.marque] = (acc[equipment.marque] || 0) + 1;
    return acc;
  }, {});

  // Group equipment by date
  const groupEquipmentByDate = (equipmentList, period) => {
    const groupedData = {};

    equipmentList.forEach((equipment) => {
      const date = new Date(equipment.date);
      let key;

      switch (period) {
        case "year":
          key = date.getFullYear();
          break;
        case "month":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case "day":
          key = equipment.date;
          break;
        default:
          key = date.getFullYear();
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key]++;
    });

    return groupedData;
  };

  const equipmentByDate = groupEquipmentByDate(equipmentList, dateFilter);

  // Prepare chart data
  const dateChartData = {
    labels: Object.keys(equipmentByDate),
    datasets: [
      {
        label: `Nombre d'équipements par ${
          dateFilter === "year"
            ? "année"
            : dateFilter === "month"
            ? "mois"
            : "jour"
        }`,
        data: Object.values(equipmentByDate),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(equipmentByCategory),
    datasets: [
      {
        label: "Nombre d'équipements par catégorie",
        data: Object.values(equipmentByCategory),
        backgroundColor: "rgba(226, 140, 60, 0.58)",
        borderColor: "rgb(104, 49, 12)",
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Réformé en bureau", "Réformé en stock", "Fonctionnel"],
    datasets: [
      {
        label: "Pourcentage d'équipements",
        data: [
          reformedInBureauPercentage,
          reformedInStockPercentage,
          functionalPercentage,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const bureauChartData = {
    labels: Object.keys(equipmentByDivision),
    datasets: [
      {
        label: "Nombre d'équipements par bureau",
        data: Object.values(equipmentByDivision),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const bureauChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Répartition des équipements par bureau",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: function (value) {
            if (value % 1 === 0) return value;
          },
        },
      },
    },
  };

  // Prepare reformed equipment list for table
  const reformedEquipments = equipmentList
    .filter(
      (equipment) =>
        equipment.statut === "Réformé en bureau" ||
        equipment.statut === "Réformé en stock"
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reformedEquipments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(reformedEquipments.length / itemsPerPage);

  // Generate pagination buttons
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
        >
          Précédent
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-md ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition duration-200`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
        >
          Suivant
        </button>
      );
    }

    return <div className="flex space-x-2">{pageNumbers}</div>;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Tableau de Bord des Équipements
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Analyse complète de votre parc d'équipements
        </p>
      </motion.div>

      {/* Main Stats Cards - Enhanced Design */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        {[
          {
            title: "Total Équipements",
            value: totalEquipment,
            icon: "📊",
            color: "from-blue-500 to-blue-600",
            tooltip: "Nombre total d'équipements enregistrés",
          },
          {
            title: "Fonctionnels",
            value: functionalEquipment,
            icon: "✅",
            color: "from-green-500 to-teal-500",
            tooltip: "Équipements en état de fonctionnement",
          },
          {
            title: "Réformés Bureau",
            value: reformedEquipmentInBureau.length,
            icon: "🏢",
            color: "from-red-500 to-rose-500",
            tooltip: "Équipements réformés mais encore en bureau",
          },
          {
            title: "Réformés Stock",
            value: reformedEquipmentInStock.length,
            icon: "📦",
            color: "from-orange-500 to-amber-500",
            tooltip: "Équipements réformés et stockés",
          },
          {
            title: "Total Réformés",
            value: totalReformedEquipment,
            icon: "⚠️",
            color: "from-purple-500 to-violet-500",
            tooltip: "Total des équipements réformés",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            title={stat.tooltip}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid - Enhanced Design */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        {/* Date Filter Chart */}
        <motion.div
          variants={slideInLeft}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Équipements par Période
            </h3>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="year">Année</option>
              <option value="month">Mois</option>
            </select>
          </div>
          <div className="h-64">
            <Bar
              data={dateChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Status Doughnut Chart */}
        <motion.div
          variants={scaleUp}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Statut des Équipements
          </h3>
          <div className="h-64">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Bureau Chart with Offcanvas */}
        <motion.div
          variants={slideInRight}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <div className="cursor-pointer" onClick={handleChartClick}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Équipements par Bureau
              <span className="ml-2 text-sm text-blue-500">
                (Cliquez pour agrandir)
              </span>
            </h3>
            <div className="h-64">
              <Bar data={bureauChartData} options={bureauChartOptions} />
            </div>
          </div>

          {showOffcanvas && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto relative">
                <button
                  onClick={handleCloseOffcanvas}
                  className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Vue détaillée - Équipements par Bureau
                  </h3>
                  <div className="h-[500px]">
                    <Bar
                      data={bureauChartData}
                      options={{
                        ...bureauChartOptions,
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Additional Charts Row */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Brand Pie Chart */}
        <motion.div
          variants={slideInLeft}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Répartition par Marque
          </h3>
          <div className="h-64">
            <Pie
              data={{
                labels: Object.keys(equipmentByBrand),
                datasets: [
                  {
                    data: Object.values(equipmentByBrand),
                    backgroundColor: [
                      "rgba(255, 99, 132, 0.7)",
                      "rgba(54, 162, 235, 0.7)",
                      "rgba(255, 206, 86, 0.7)",
                      "rgba(75, 192, 192, 0.7)",
                      "rgba(153, 102, 255, 0.7)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Progress Bars */}
        <motion.div
          variants={slideInRight}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Statistiques de Performance
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Fonctionnels
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {functionalPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${functionalPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Réformés Bureau
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {reformedInBureauPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: `${reformedInBureauPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Réformés Stock
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {reformedInStockPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${reformedInStockPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </motion.div>

      {/* Bureau Search Section - Version améliorée */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 mb-8 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        {/* Titre avec icône */}
        <div className="flex items-center mb-6">
          <svg
            className="w-6 h-6 text-blue-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-2xl font-bold text-gray-800">
            Statistiques par Bureau
          </h3>
        </div>

        {/* Champ de recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={bureauInput}
              onChange={handleInputChange}
              placeholder="Entrez le numéro de bureau"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
              />
            </svg>
          </div>
          <button
            onClick={handleSearchBureau}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Rechercher
          </button>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start"
          >
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errorMessage}
          </motion.div>
        )}

        {/* Résultats */}
        {bureauStats && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-6"
          >
            <h4 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Résultats pour le bureau:{" "}
              <span className="font-bold text-blue-600 ml-1">
                {bureauInput}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Carte Total */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Équipements
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {bureauStats.total}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carte Fonctionnels avec tooltip */}
              <div
                className="bg-white p-4 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative group"
                onMouseEnter={() =>
                  handleEquipmentHover(bureauStats.functional)
                }
                onMouseLeave={handleEquipmentLeave}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Fonctionnels
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {bureauStats.functional.length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tooltip amélioré */}
                {selectedEquipment &&
                  selectedEquipment === bureauStats.functional && (
                    <div className="absolute z-10 left-0 bottom-full mb-2 w-72 max-h-80 overflow-auto bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-700">
                          Équipements Fonctionnels
                        </h5>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {bureauStats.functional.length} éléments
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEquipment.map((eq, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-50 rounded-lg"
                          >
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Type:</span>{" "}
                              {eq.type}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="text-gray-400">Série:</span>{" "}
                              {eq.numero_serie}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Carte Réformés Bureau avec tooltip */}
              <div
                className="bg-white p-4 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative group"
                onMouseEnter={() =>
                  handleEquipmentHover(bureauStats.reformedInBureau)
                }
                onMouseLeave={handleEquipmentLeave}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Réformés Bureau
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {bureauStats.reformedInBureau.length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tooltip amélioré */}
                {selectedEquipment &&
                  selectedEquipment === bureauStats.reformedInBureau && (
                    <div className="absolute z-10 left-0 bottom-full mb-2 w-72 max-h-80 overflow-auto bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-700">
                          Équipements Réformés en Bureau
                        </h5>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {bureauStats.reformedInBureau.length} éléments
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEquipment.map((eq, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-50 rounded-lg"
                          >
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Type:</span>{" "}
                              {eq.type}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="text-gray-400">Série:</span>{" "}
                              {eq.numero_serie}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Carte Réformés Stock avec tooltip */}
              <div
                className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative group"
                onMouseEnter={() =>
                  handleEquipmentHover(bureauStats.reformedInStock)
                }
                onMouseLeave={handleEquipmentLeave}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Réformés Stock
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {bureauStats.reformedInStock.length}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tooltip amélioré */}
                {selectedEquipment &&
                  selectedEquipment === bureauStats.reformedInStock && (
                    <div className="absolute z-10 left-0 bottom-full mb-2 w-72 max-h-80 overflow-auto bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-700">
                          Équipements Réformés en Stock
                        </h5>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          {bureauStats.reformedInStock.length} éléments
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEquipment.map((eq, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-50 rounded-lg"
                          >
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Type:</span>{" "}
                              {eq.type}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="text-gray-400">Série:</span>{" "}
                              {eq.numero_serie}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Reformed Equipment Table */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Liste des Équipements Réformés
          </h3>

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
                    Bureau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((equipment, index) => (
                  <motion.tr
                    key={equipment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${
                      equipment.statut === "Réformé en bureau"
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-amber-50 hover:bg-amber-100"
                    } transition-colors duration-150`}
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
                      {equipment.bureau}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          equipment.statut === "Réformé en bureau"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
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

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2 py-3 bg-gray-50 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    à{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, reformedEquipments.length)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">
                      {reformedEquipments.length}
                    </span>{" "}
                    résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EquipmentStatistics;
