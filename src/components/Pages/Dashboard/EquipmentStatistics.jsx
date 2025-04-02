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
import { PiDeskFill } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

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
  const itemsPerPage = 5;
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedBureau, setSelectedBureau] = useState(null);
  const [isDirectionDropdownOpen, setIsDirectionDropdownOpen] = useState(false);

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

  const groupByDirectionAndBureau = (equipments) => {
    return equipments.reduce((acc, equipment) => {
      if (!equipment.direction || !equipment.bureau) return acc;

      if (!acc[equipment.direction]) {
        acc[equipment.direction] = {
          total: 0,
          functionalCount: 0,
          reformedInBureauCount: 0,
          reformedInStockCount: 0,
          bureaux: {},
        };
      }

      if (!acc[equipment.direction].bureaux[equipment.bureau]) {
        acc[equipment.direction].bureaux[equipment.bureau] = [];
      }

      acc[equipment.direction].bureaux[equipment.bureau].push(equipment);
      acc[equipment.direction].total++;

      // Compter par statut
      if (equipment.statut === "Fonctionnel") {
        acc[equipment.direction].functionalCount++;
      } else if (equipment.statut === "Réformé en bureau") {
        acc[equipment.direction].reformedInBureauCount++;
      } else if (equipment.statut === "Réformé en stock") {
        acc[equipment.direction].reformedInStockCount++;
      }

      return acc;
    }, {});
  };

  const directionStats = groupByDirectionAndBureau(equipmentList);

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
  const reformedInBureauData = equipmentList
    ? equipmentList.filter(
        (equipment) =>
          equipment &&
          equipment.statut === "Réformé en bureau" &&
          equipment.bureau
      )
    : [];
  const bureauCounts = reformedInBureauData.reduce((acc, equipment) => {
    const bureau = equipment.bureau;
    acc[bureau] = (acc[bureau] || 0) + 1;
    return acc;
  }, {});
  const bureauChartData = {
    labels: Object.keys(bureauCounts).filter(
      (bureau) => bureauCounts[bureau] > 0
    ),
    datasets: [
      {
        label: "Équipements réformés en bureau",
        data: Object.values(bureauCounts).filter((count) => count > 0),
        backgroundColor: "rgba(220, 38, 38, 0.6)",
        borderColor: "rgba(220, 38, 38, 1)",
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
            icon: <PiDeskFill size={35} color="white" />,
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

      {/* Statistiques des Directions - Version Professionnelle et Créative */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Statistiques par Direction
              <span className="block text-sm font-normal text-gray-500 mt-1">
                Analyse détaillée des équipements par direction
              </span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(directionStats).length} Directions
              </span>
            </div>
          </div>

          {/* Cartes statistiques modernes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Directions actives
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {Object.keys(directionStats).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 bg-opacity-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Taux de réforme en bureau
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {(
                      (Object.values(directionStats).reduce(
                        (acc, dir) =>
                          acc + dir.reformedInBureauCount / dir.total,
                        0
                      ) /
                        Object.keys(directionStats).length) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-200 bg-opacity-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Équipements fonctionnels
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {Object.values(directionStats).reduce(
                      (acc, dir) => acc + dir.functionalCount,
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-200 bg-opacity-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau amélioré */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bureaux
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipements
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonctionnels
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réformés en bureau
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux Réforme
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(directionStats)
                  .sort((a, b) => {
                    const tauxA = a[1].reformedInBureauCount / a[1].total;
                    const tauxB = b[1].reformedInBureauCount / b[1].total;
                    return tauxB - tauxA; // Pour un tri décroissant
                  })
                  .map(([direction, data]) => (
                    <motion.tr
                      key={direction}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="cursor-pointer transition-colors"
                      onClick={() => setSelectedDirection(direction)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {direction}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {Object.keys(data.bureaux).length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.total}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {data.functionalCount}
                          </span>
                          <span className="text-xs text-green-600 mt-1">
                            {Math.round(
                              (data.functionalCount / data.total) * 100
                            )}
                            % fonctionnels
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.reformedInBureauCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-semibold mb-1 ${
                              data.reformedInBureauCount / data.total > 0.3
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {(
                              (data.reformedInBureauCount / data.total) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                data.reformedInBureauCount / data.total > 0.3
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${
                                  (data.reformedInBureauCount / data.total) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {data.reformedInBureauCount} en bureau
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
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
              Équipements réformés en bureau
              <span className="ml-2 text-sm text-blue-500">
                (Cliquez pour agrandir)
              </span>
            </h3>
            <div className="h-64">
              <Bar
                data={bureauChartData}
                options={{
                  ...bureauChartOptions,
                  plugins: {
                    ...bureauChartOptions.plugins,
                    title: {
                      display: true,
                      text: "Répartition des équipements réformés en bureau",
                    },
                  },
                }}
              />
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
                    Vue détaillée - Équipements réformés en bureau
                  </h3>
                  <div className="h-[500px]">
                    <Bar
                      data={bureauChartData}
                      options={{
                        ...bureauChartOptions,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          ...bureauChartOptions.plugins,
                          title: {
                            display: true,
                            text: "Répartition détaillée des équipements réformés en bureau",
                          },
                        },
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
        {/* Répartition par Marque - Version Premium */}
        <motion.div
          variants={slideInLeft}
          className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Répartition par Marque
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Proportion des équipements par constructeur
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {Object.keys(equipmentByBrand).length} marques
            </span>
          </div>

          <div className="relative h-72">
            <Pie
              data={{
                labels: Object.keys(equipmentByBrand),
                datasets: [
                  {
                    data: Object.values(equipmentByBrand),
                    backgroundColor: [
                      "rgba(79, 70, 229, 0.8)", // Indigo
                      "rgba(220, 38, 38, 0.8)", // Red
                      "rgba(5, 150, 105, 0.8)", // Emerald
                      "rgba(234, 88, 12, 0.8)", // Orange
                      "rgba(139, 92, 246, 0.8)", // Violet
                      "rgba(20, 184, 166, 0.8)", // Teal
                      "rgba(244, 63, 94, 0.8)", // Rose
                    ],
                    borderColor: "white",
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                      },
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                    onHover: (event) => {
                      event.native.target.style.cursor = "pointer";
                    },
                    onLeave: (event) => {
                      event.native.target.style.cursor = "default";
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.7)",
                    titleFont: {
                      size: 14,
                      weight: "bold",
                    },
                    bodyFont: {
                      size: 12,
                    },
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
                cutout: "60%", // Transforme en doughnut chart
                animation: {
                  animateScale: true,
                  animateRotate: true,
                },
                onHover: (event, chartElements) => {
                  if (event.native) {
                    const target = event.native.target;
                    target.style.cursor = chartElements[0]
                      ? "pointer"
                      : "default";
                  }
                },
              }}
            />
            {/* Centre du doughnut pour afficher le total */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-5xl font-light text-gray-700">
                  {Object.values(equipmentByBrand).reduce((a, b) => a + b, 0)}
                </div>
                <div className="w-16 h-px bg-gray-200 mx-auto my-2">
                  Équipements
                </div>
              </div>
            </div>
          </div>

          {/* Liste des marques avec pourcentages - Version Grid */}
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Détail par marque
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(equipmentByBrand)
                .sort((a, b) => b[1] - a[1])
                .map(([brand, count], index) => {
                  const total = Object.values(equipmentByBrand).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = Math.round((count / total) * 100);
                  const colors = [
                    "bg-indigo-500",
                    "bg-red-500",
                    "bg-emerald-500",
                    "bg-orange-500",
                    "bg-violet-500",
                    "bg-teal-500",
                    "bg-rose-500",
                  ];

                  return (
                    <motion.div
                      key={brand}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              colors[index % colors.length]
                            } mr-3`}
                          ></div>
                          <span className="font-medium text-gray-800">
                            {brand}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {count}{" "}
                          <span className="text-gray-400">({percentage}%)</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              colors[index % colors.length]
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          onClick={() => console.log(`Voir détails ${brand}`)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </motion.div>

        {/* Statistiques de Performance par Direction - Version Professionnelle et Créative */}
        <motion.div
          variants={slideInRight}
          className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100"
        >
          {/* Header avec sélecteur stylisé */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Analyse par Direction
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Performances détaillées par direction
              </p>
            </div>

            {/* Sélecteur amélioré */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={selectedDirection || ""}
                onChange={(e) => setSelectedDirection(e.target.value || null)}
                className="block w-full pl-10 pr-8 py-2.5 text-sm text-gray-800 bg-white/90 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
              >
                <option value="">Choisir une direction...</option>
                {Object.keys(directionStats)
                  .sort()
                  .map((direction) => (
                    <option key={direction} value={direction} className="py-2">
                      {direction}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {selectedDirection ? (
            <div className="space-y-6">
              {/* Carte d'identité de la direction */}
              <div className="bg-white/80 p-4 rounded-xl border border-blue-100 shadow-inner">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {selectedDirection}
                </h4>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-center">
                  <div className="bg-blue-50 p-1 rounded">
                    <div className="font-bold text-blue-700">
                      {directionStats[selectedDirection].total}
                    </div>
                    <div className="text-blue-500">Équipements</div>
                  </div>
                  <div className="bg-green-50 p-1 rounded">
                    <div className="font-bold text-green-700">
                      {
                        Object.keys(directionStats[selectedDirection].bureaux)
                          .length
                      }
                    </div>
                    <div className="text-green-500">Bureaux</div>
                  </div>
                  <div className="bg-purple-50 p-1 rounded">
                    <div className="font-bold text-purple-700">
                      {Math.round(
                        (directionStats[selectedDirection].functionalCount /
                          directionStats[selectedDirection].total) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-purple-500">Fonctionnels</div>
                  </div>
                </div>
              </div>

              {/* Indicateurs avancés */}
              {(() => {
                const dirData = directionStats[selectedDirection];
                const stats = [
                  {
                    title: "Fonctionnels",
                    value: dirData.functionalCount,
                    total: dirData.total,
                    color: "green",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Réformés Bureau",
                    value: dirData.reformedInBureauCount,
                    total: dirData.total,
                    color: "red",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Réformés Stock",
                    value: dirData.reformedInStockCount,
                    total: dirData.total,
                    color: "amber",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    ),
                  },
                ];

                return (
                  <div className="space-y-5">
                    {stats.map((stat, index) => {
                      const percentage = Math.round(
                        (stat.value / stat.total) * 100
                      );
                      const colorClasses = {
                        bg: `bg-${stat.color}-100`,
                        text: `text-${stat.color}-700`,
                        bar: `bg-${stat.color}-500`,
                        icon: `text-${stat.color}-600`,
                      };

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg ${colorClasses.bg} group-hover:scale-110 transition-transform`}
                              >
                                <div className={colorClasses.icon}>
                                  {stat.icon}
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {stat.title}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-semibold ${colorClasses.text}`}
                            >
                              {percentage}%
                            </span>
                          </div>

                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, type: "spring" }}
                                className={`h-2.5 rounded-full ${colorClasses.bar}`}
                              />
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-xs text-gray-500">
                                {stat.value} / {stat.total} équipements
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-700">
                Aucune direction sélectionnée
              </h4>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Sélectionnez une direction dans le menu déroulant pour afficher
                ses statistiques détaillées
              </p>
            </motion.div>
          )}
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
                        <h5 className="font-bold text-gray-700">Éq. Fonct.</h5>
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
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Série:</span>{" "}
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
                          Éq. Réf. Bureau
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
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Série:</span>{" "}
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
                          Éq. Réf. Stock
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
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">
                                Marque/Modèle:
                              </span>{" "}
                              {eq.marque} {eq.modele}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="text-gray-500">Série:</span>{" "}
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

      {/* Arborescence des Directions - Design Premium */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-visible relative border border-gray-200 mb-8"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Arborescence des Directions
            </h3>
            {selectedDirection && (
              <button
                onClick={() => {
                  setSelectedDirection(null);
                  setSelectedBureau(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Dropdown Premium */}
          <div className="relative mb-8 z-10">
            <button
              type="button"
              onClick={() =>
                setIsDirectionDropdownOpen(!isDirectionDropdownOpen)
              }
              className={`w-full bg-white px-5 py-3 text-left rounded-xl shadow-md transition-all duration-300 flex justify-between items-center border ${
                isDirectionDropdownOpen
                  ? "border-blue-400 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                  />
                </svg>
                <span className="block truncate font-medium">
                  {selectedDirection || "Sélectionnez une direction"}
                </span>
              </div>
              <svg
                className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                  isDirectionDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Menu déroulant animé */}
            <AnimatePresence>
              {isDirectionDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-20 mt-2 w-full bg-white shadow-2xl rounded-xl py-2 text-base ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none"
                >
                  <div className="max-h-96 overflow-y-auto">
                    {Object.keys(directionStats).map((direction) => (
                      <div
                        key={direction}
                        onClick={() => {
                          setSelectedDirection(direction);
                          setSelectedBureau(null);
                          setIsDirectionDropdownOpen(false);
                        }}
                        className={`px-5 py-3 cursor-pointer transition-colors duration-200 flex justify-between items-center ${
                          selectedDirection === direction
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="font-medium truncate">
                          {direction}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {directionStats[direction].total}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Affichage des bureaux - Design moderne */}
          {selectedDirection && directionStats[selectedDirection] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-5 relative z-0"
            >
              {Object.entries(directionStats[selectedDirection].bureaux).map(
                ([bureau, equipments]) => (
                  <div
                    key={bureau}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                  >
                    <button
                      onClick={() =>
                        setSelectedBureau(
                          selectedBureau === bureau ? null : bureau
                        )
                      }
                      className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-800">
                            Bureau {bureau}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {equipments.length} équipement
                            {equipments.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                          selectedBureau === bureau ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {selectedBureau === bureau && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {equipments.map((equipment) => (
                            <div
                              key={equipment.id}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-blue-200 transition-colors duration-200"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-gray-800 flex items-center">
                                    {equipment.type}
                                    <span
                                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        equipment.statut === "Réformé en bureau"
                                          ? "bg-red-100 text-red-800"
                                          : equipment.statut ===
                                            "Réformé en stock"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {equipment.statut}
                                    </span>
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Marque:</span>{" "}
                                    {equipment.marque}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Modèle:</span>{" "}
                                    {equipment.modele}
                                  </p>
                                </div>
                                <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                  #{equipment.numero_serie}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              )}
            </motion.div>
          )}
        </div>
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
