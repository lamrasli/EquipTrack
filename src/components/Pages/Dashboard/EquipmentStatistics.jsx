import React, { useState, useMemo, useCallback } from "react";
import { Bar, Pie } from "react-chartjs-2";
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
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  RiBuilding2Line,
  RiArrowDownSLine,
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiDoorOpenLine,
  RiArchiveLine,
  RiArrowRightLine,
  RiSearchLine,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiBox3Fill,
  RiCloseLine,
  RiHome3Line as RiOfficeFill, // Pour bureau
  RiFolder2Line as RiFolderOpenLine, // Pour dossier ouvert
  RiSearchLine as RiSearchEyeLine, // Pour recherche
} from "react-icons/ri";
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

const EquipmentStatistics = ({ equipmentList }) => {
  const [dateFilter, setDateFilter] = useState("year");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [isDirectionDropdownOpen, setIsDirectionDropdownOpen] = useState(false);
  const [selectedDirectionForBureau, setSelectedDirectionForBureau] =
    useState(null);
  const [selectedBureauInDirection, setSelectedBureauInDirection] =
    useState(null); // For expanding bureaus in Direction details
  const handleDirectionSelect = useCallback((direction) => {
    setSelectedDirection(direction);
    setSelectedBureauInDirection(null); // Reset bureau expansion when direction changes
    setIsDirectionDropdownOpen(false); // Close dropdown after selection
  }, []);
  const [globalBureauSearch, setGlobalBureauSearch] = useState("");
  const [foundBureau, setFoundBureau] = useState(null);
  const [bureauSearchTerm, setBureauSearchTerm] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  // Fonction de recherche globale
  const searchBureau = () => {
    if (!globalBureauSearch.trim()) {
      setFoundBureau(null);
      setShowNoResults(false);
      return;
    }

    let result = null;

    // Parcourir toutes les directions
    Object.entries(directionStats).forEach(([directionName, directionData]) => {
      Object.entries(directionData.bureaux).forEach(
        ([bureauName, equipments]) => {
          if (
            bureauName.toLowerCase().includes(globalBureauSearch.toLowerCase())
          ) {
            result = {
              directionName,
              bureauName,
              equipments,
            };
          }
        }
      );
    });

    if (result) {
      setFoundBureau(result);
      setShowNoResults(false);
    } else {
      setFoundBureau(null);
    }
  };

  // Couleurs thématiques marocaines
  const colors = {
    primary: "#671B1E", // Rouge marocain
    secondary: "#0E3B25", // Vert marocain
    accent: "#F7D417", // Jaune marocain
    dark: "#1A1A1A",
    light: "#F5F5F5",
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
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
  const sortedDirectionEntries = useMemo(
    () =>
      Object.entries(directionStats).sort((a, b) => {
        // Sort by highest reform rate first, then alphabetically
        const tauxA =
          a[1].total > 0
            ? (a[1].reformedInBureauCount + a[1].reformedInStockCount) /
              a[1].total
            : 0;
        const tauxB =
          b[1].total > 0
            ? (b[1].reformedInBureauCount + b[1].reformedInStockCount) /
              b[1].total
            : 0;
        if (tauxB !== tauxA) return tauxB - tauxA;
        return a[0].localeCompare(b[0]);
      }),
    [directionStats]
  );

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
        backgroundColor: "rgba(193, 39, 45, 0.2)", // Rouge marocain avec transparence
        borderColor: colors.primary,
        borderWidth: 2,
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

  // Préparation des données - tri par date de réforme décroissante
  const reformedEquipments = equipmentList
    .filter((equipment) => {
      const statut = equipment.statut
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return statut.includes("reforme");
    })
    .sort(
      (a, b) =>
        new Date(b.date_reforme || b.date) - new Date(a.date_reforme || a.date)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reformedEquipments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(reformedEquipments.length / itemsPerPage);
  const getFilteredBureauChartData = () => {
    // Filtrer les équipements selon la direction sélectionnée
    const filteredEquipments = selectedDirectionForBureau
      ? equipmentList.filter(
          (equipment) =>
            equipment.direction === selectedDirectionForBureau &&
            equipment.statut === "Réformé en bureau"
        )
      : equipmentList.filter(
          (equipment) => equipment.statut === "Réformé en bureau"
        );

    // Compter par bureau
    const bureauCounts = filteredEquipments.reduce((acc, equipment) => {
      const bureau = equipment.bureau;
      acc[bureau] = (acc[bureau] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(bureauCounts),
      datasets: [
        {
          label: "Équipements réformés en bureau",
          data: Object.values(bureauCounts),
          backgroundColor: "rgba(193, 39, 45, 0.6)",
          borderColor: colors.primary,
          borderWidth: 1,
        },
      ],
    };
  };
  return (
    <div className="min-h-screen  justify-center relative overflow-hidden">
      {/* Arrière-plan avec zellige très léger et dégradés */}
      <div className="absolute  z-0">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "url('https://previews.123rf.com/images/nete/nete1609/nete160900014/63560280-mosaïque-blanche-et-noire-zellige-moroccan-transparente.jpg')",
            backgroundSize: "400px",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-red-600">
            Tableau de Bord des Équipements
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Analyse complète du parc d'équipements du Ministère
          </p>
          <div className="mt-4 h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full"></div>
        </motion.div>

        {/* Main Stats Cards - Design marocain */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {[
            {
              title: "Total Équipements",
              value: totalEquipment,
              icon: "📊",
              color: "from-gray-800 to-gray-900",
              tooltip: "Nombre total d'équipements enregistrés",
            },
            {
              title: "Fonctionnels",
              value: functionalEquipment,
              icon: "✅",
              color: "from-green-700 to-green-800",
              tooltip: "Équipements en état de fonctionnement",
            },
            {
              title: "Réformés en Bureau",
              value: reformedEquipmentInBureau.length,
              icon: <PiDeskFill size={35} color="white" />,
              color: "from-red-600 to-red-700",
              tooltip: "Équipements réformés mais encore en bureau",
            },
            {
              title: "Réformés en Stock",
              value: reformedEquipmentInStock.length,
              icon: "📦",
              color: "from-yellow-500 to-yellow-600",
              tooltip: "Équipements réformés et stockés",
            },
            {
              title: "Total Réformés",
              value: totalReformedEquipment,
              icon: "⚠️",
              color: "from-red-700 to-yellow-600",
              tooltip: "Total des équipements réformés",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    delay: index * 0.1,
                  },
                },
              }}
              className={`relative bg-gradient-to-br ${stat.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
              title={stat.tooltip}
              whileHover={{
                y: -5,
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Motif de zellige en arrière-plan */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "url('https://previews.123rf.com/images/nete/nete1609/nete160900014/63560280-mosa%C3%AFque-blanche-et-noire-zellige-moroccan-transparente.jpg')",
                  backgroundSize: "200px",
                }}
              ></div>

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">
                    {stat.title}
                  </h3>
                  <motion.p
                    className="text-3xl font-bold mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.p>
                </div>

                <motion.div
                  className="p-2 rounded-lg bg-black bg-opacity-20"
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {typeof stat.icon === "string" ? (
                    <span className="text-4xl">{stat.icon}</span>
                  ) : (
                    stat.icon
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistiques des Directions - Version Ministérielle */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8"
          whileHover={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            y: -2,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <motion.h3
                className="text-2xl font-bold text-white mb-4 md:mb-0"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Statistiques par Direction
                <motion.span
                  className="block text-sm font-normal text-white/90 mt-1"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  Analyse détaillée des équipements par direction ministérielle
                </motion.span>
              </motion.h3>

              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  className="text-xs font-medium px-2 py-1 bg-white/20 text-white rounded-full"
                  animate={{
                    backgroundColor: [
                      "rgba(255,255,255,0.2)",
                      "rgba(255,255,255,0.3)",
                      "rgba(255,255,255,0.2)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                >
                  {Object.keys(directionStats).length} Directions
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* Cartes statistiques modernes avec animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            {/* Carte 1 - Directions actives */}
            <motion.div
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Directions actives
                  </p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900 mt-1"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {Object.keys(directionStats).length}
                  </motion.p>
                </div>
                <motion.div
                  className="p-3 bg-red-100 rounded-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <svg
                    className="w-6 h-6 text-red-600"
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
                </motion.div>
              </div>
            </motion.div>
            {/* Carte 3 - Équipements fonctionnels (version modifiée) */}
            <motion.div
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
              whileHover={{
                scale: 1.01,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Équipements fonctionnels
                  </p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900 mt-1"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    {(
                      (Object.values(directionStats).reduce(
                        (acc, dir) => acc + dir.functionalCount,
                        0
                      ) /
                        Object.values(directionStats).reduce(
                          (acc, dir) => acc + dir.total,
                          0
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </motion.p>
                </div>
                <motion.div
                  className="p-3 bg-green-100 rounded-lg"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
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
                </motion.div>
              </div>
            </motion.div>
            {/* Nouvelle Carte 4 - Équipements en stock */}
            <motion.div
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Équipements en stock
                  </p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900 mt-1"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {(
                      (Object.values(directionStats).reduce(
                        (acc, dir) =>
                          acc +
                          (dir.total -
                            dir.functionalCount -
                            dir.reformedInBureauCount),
                        0
                      ) /
                        Object.values(directionStats).reduce(
                          (acc, dir) => acc + dir.total,
                          0
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </motion.p>
                </div>
                <motion.div
                  className="p-3 bg-blue-100 rounded-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
            {/* Carte 2 - Taux de réforme en bureau (version corrigée) */}
            <motion.div
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Taux de réforme en bureau
                  </p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {(
                      (Object.values(directionStats).reduce(
                        (acc, dir) => acc + dir.reformedInBureauCount,
                        0
                      ) /
                        Object.values(directionStats).reduce(
                          (acc, dir) => acc + dir.total,
                          0
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </motion.p>
                </div>
                <motion.div
                  className="p-3 bg-yellow-100 rounded-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    className="w-6 h-6 text-yellow-600"
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
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Tableau amélioré */}
          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    Taux Réforme En Bureau
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(directionStats)
                  .sort((a, b) => {
                    const tauxA = a[1].reformedInBureauCount / a[1].total;
                    const tauxB = b[1].reformedInBureauCount / b[1].total;
                    return tauxB - tauxA;
                  })
                  .slice((currentPage - 1) * 5, currentPage * 5) // Afficher seulement 5 directions par page
                  .map(([direction, data]) => (
                    <motion.tr
                      key={direction}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="cursor-pointer transition-colors"
                      onClick={() => setSelectedDirection(direction)}
                    >
                      <td className="px-6 py-4 text-center whitespace-nowrap">
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
                        {data.functionalCount + data.reformedInBureauCount}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-semibold mb-1 ${
                              data.functionalCount / data.total > 0.3
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(
                              (data.functionalCount / data.total) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                data.functionalCount / data.total > 0.3
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  (data.functionalCount / data.total) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {data.functionalCount} en bureau
                          </span>
                        </div>
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
                          <div className="w-1/2 bg-gray-200 rounded-full h-1.5">
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

          {/* Pagination améliorée */}
          <div className="mt-4 px-6 pb-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage des directions {(currentPage - 1) * 5 + 1} à{" "}
              {Math.min(currentPage * 5, Object.keys(directionStats).length)}{" "}
              sur {Object.keys(directionStats).length}
            </div>

            <div className="flex space-x-1">
              {currentPage > 1 && (
                <motion.button
                  onClick={() => setCurrentPage(1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  &laquo;
                </motion.button>
              )}

              {currentPage > 1 && (
                <motion.button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  &lsaquo;
                </motion.button>
              )}

              {Array.from(
                { length: Math.ceil(Object.keys(directionStats).length / 5) },
                (_, i) => {
                  const page = i + 1;
                  // Afficher seulement les premières pages, la page actuelle et les dernières pages
                  if (
                    page === 1 ||
                    page === 2 ||
                    page === currentPage ||
                    page ===
                      Math.ceil(Object.keys(directionStats).length / 5) - 1 ||
                    page ===
                      Math.ceil(Object.keys(directionStats).length / 5) ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-md ${
                          page === currentPage
                            ? "bg-red-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 &&
                      currentPage <
                        Math.ceil(Object.keys(directionStats).length / 5) - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 py-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}

              {currentPage <
                Math.ceil(Object.keys(directionStats).length / 5) && (
                <motion.button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  &rsaquo;
                </motion.button>
              )}

              {currentPage <
                Math.ceil(Object.keys(directionStats).length / 5) && (
                <motion.button
                  onClick={() =>
                    setCurrentPage(
                      Math.ceil(Object.keys(directionStats).length / 5)
                    )
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  &raquo;
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Charts Grid - Enhanced Design */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Équipements par Période */}
          <motion.div
            variants={slideInLeft}
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col items-center relative overflow-hidden"
          >
            {/* Effets décoratifs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-100 rounded-full opacity-20"></div>

            <div
              className="cursor-pointer w-full max-w-3xl relative z-10"
              onClick={() => setShowOffcanvas("period")}
            >
              {/* En-tête avec icône et sélecteur */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="mr-3 p-2 bg-blue-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Équipements par Période
                    </h3>
                    <p className="text-sm text-blue-400 mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Cliquez pour agrandir
                    </p>
                  </div>
                </div>

                {/* Sélecteur amélioré */}
                <div className="relative min-w-[120px]">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="year">Année</option>
                    <option value="month">Mois</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
              </div>

              {/* Graphique avec effet de hover */}
              <div className="h-64 flex justify-center group">
                <div
                  className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ maxWidth: "550px" }}
                >
                  <Bar
                    data={dateChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                          },
                        },
                        tooltip: {
                          backgroundColor: "rgba(0,0,0,0.8)",
                          titleFont: { size: 14 },
                          bodyFont: { size: 12 },
                          padding: 10,
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: "#6B7280",
                          },
                        },
                        y: {
                          grid: {
                            color: "rgba(0,0,0,0.05)",
                          },
                          ticks: {
                            color: "#6B7280",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Offcanvas amélioré */}
            {showOffcanvas === "period" && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
                >
                  <button
                    onClick={() => setShowOffcanvas(false)}
                    className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 text-gray-600 hover:text-gray-800"
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

                  <div className="p-8 w-full overflow-auto">
                    <div className="flex items-center mb-6">
                      <div className="mr-4 p-3 bg-blue-100 rounded-lg">
                        <svg
                          className="w-8 h-8 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Vue détaillée - Équipements par Période
                      </h3>
                    </div>

                    {/* Sélecteur centré */}
                    <div className="flex justify-center mb-8">
                      <div className="relative min-w-[200px]">
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                        >
                          <option value="year">Affichage par Année</option>
                          <option value="month">Affichage par Mois</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-6 h-6 text-gray-400"
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
                        </div>
                      </div>
                    </div>

                    {/* Graphique agrandi */}
                    <div className="h-[500px] w-full">
                      <Bar
                        data={dateChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                font: {
                                  size: 14,
                                },
                                padding: 20,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              backgroundColor: "rgba(0,0,0,0.9)",
                              titleFont: { size: 16 },
                              bodyFont: { size: 14 },
                              padding: 12,
                              cornerRadius: 10,
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                font: {
                                  size: 13,
                                },
                                color: "#6B7280",
                              },
                            },
                            y: {
                              grid: {
                                color: "rgba(0,0,0,0.05)",
                              },
                              ticks: {
                                font: {
                                  size: 13,
                                },
                                color: "#6B7280",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowOffcanvas(false)}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
          {/* Bureau Chart with Offcanvas - Version centrée complète */}
          <motion.div
            variants={slideInRight}
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col items-center relative overflow-hidden"
          >
            {/* Effet décoratif */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>

            <div className="w-full max-w-3xl relative z-10">
              {/* En-tête avec icône */}
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg mb-3">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Équipements réformés en bureau
                </h3>
                <p className="text-sm text-red-400 mt-1 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Cliquez sur le graphique pour agrandir
                </p>
              </div>

              {/* Sélecteur avec style amélioré */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Filtrer par direction
                </label>
                <div className="relative">
                  <select
                    value={selectedDirectionForBureau || ""}
                    onChange={(e) =>
                      setSelectedDirectionForBureau(e.target.value || null)
                    }
                    className="w-full p-3 pl-4 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 bg-white appearance-none shadow-sm transition-all"
                  >
                    <option value="">Toutes les directions</option>
                    {Object.keys(directionStats).map((direction) => (
                      <option key={direction} value={direction}>
                        {direction}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
              </div>

              {/* Graphique avec effet de hover */}
              <div
                className="h-64 flex justify-center cursor-pointer group"
                onClick={() => setShowOffcanvas("bureau")}
              >
                <div
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  style={{ maxWidth: "550px" }}
                >
                  <Bar
                    data={getFilteredBureauChartData()}
                    options={{
                      ...bureauChartOptions,
                      plugins: {
                        ...bureauChartOptions.plugins,
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Offcanvas amélioré */}
            {showOffcanvas === "bureau" && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
                >
                  <button
                    onClick={handleCloseOffcanvas}
                    className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 text-gray-600 hover:text-gray-800"
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

                  <div className="p-8 w-full overflow-auto">
                    <div className="flex items-center mb-6">
                      <div className="mr-4 p-3 bg-red-100 rounded-lg">
                        <svg
                          className="w-8 h-8 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Vue détaillée - Équipements réformés en bureau
                      </h3>
                    </div>

                    {/* Sélecteur avec style cohérent */}
                    <div className="mb-8 max-w-md mx-auto">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Filtrer par direction
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDirectionForBureau || ""}
                          onChange={(e) =>
                            setSelectedDirectionForBureau(
                              e.target.value || null
                            )
                          }
                          className="w-full p-3 pl-4 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 bg-white appearance-none shadow-sm"
                        >
                          <option value="">Toutes les directions</option>
                          {Object.keys(directionStats).map((direction) => (
                            <option key={direction} value={direction}>
                              {direction}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                        </div>
                      </div>
                    </div>

                    <div className="h-[500px] w-full">
                      <Bar
                        data={getFilteredBureauChartData()}
                        options={{
                          ...bureauChartOptions,
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...bureauChartOptions.plugins,
                            title: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleCloseOffcanvas}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
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
          {/* Répartition par Marque - Version Premium avec total déplacé */}
          <motion.div
            variants={slideInLeft}
            className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            {/* En-tête avec le total déplacé */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Répartition par Marque
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Proportion des équipements par constructeur
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                  {Object.keys(equipmentByBrand).length} marques
                </span>
                <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-700">
                    {Object.values(equipmentByBrand).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total équipements</div>
                </div>
              </div>
            </div>

            {/* Graphique sans le total au centre */}
            <div className="relative h-72">
              <Pie
                data={{
                  labels: Object.keys(equipmentByBrand),
                  datasets: [
                    {
                      data: Object.values(equipmentByBrand),
                      backgroundColor: [
                        "rgba(193, 39, 45, 0.8)",
                        "rgba(0, 98, 51, 0.8)",
                        "rgba(247, 212, 23, 0.8)",
                        "rgba(26, 26, 26, 0.8)",
                        "rgba(245, 245, 245, 0.8)",
                        "rgba(106, 64, 41, 0.8)",
                        "rgba(0, 114, 188, 0.8)",
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
                  cutout: "60%",
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
                      "bg-red-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-gray-800",
                      "bg-gray-200",
                      "bg-yellow-800",
                      "bg-blue-500",
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
                            <span className="text-gray-400">
                              ({percentage}%)
                            </span>
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

          {/* Column 2: Direction Analysis - Version Professionnelle Blanche */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            {/* En-tête élégant avec recherche globale */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-lg bg-red-50 mr-3">
                    <RiBuilding2Line className="text-red-500 text-xl" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">
                    Analyse par Direction
                  </h4>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsDirectionDropdownOpen(!isDirectionDropdownOpen)
                    }
                    className="flex items-center justify-between px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:border-red-300 hover:shadow-md transition-all w-64"
                  >
                    <span
                      className={`truncate ${
                        selectedDirection ? "font-medium" : "text-gray-500"
                      }`}
                    >
                      {selectedDirection || "Choisir une direction"}
                    </span>
                    <RiArrowDownSLine
                      className={`ml-2 text-gray-500 transition-transform ${
                        isDirectionDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown animé */}
                  <AnimatePresence>
                    {isDirectionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="max-h-60 overflow-y-auto">
                          {sortedDirectionEntries.map(([direction, data]) => (
                            <div
                              key={direction}
                              onClick={() => handleDirectionSelect(direction)}
                              className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${
                                selectedDirection === direction
                                  ? "bg-red-50 text-red-600"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <span className="font-medium truncate">
                                {direction}
                              </span>
                              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                                {data.total}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Barre de recherche globale par bureau */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiSearchLine className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Rechercher un bureau (ex: 121)..."
                  value={globalBureauSearch}
                  onChange={(e) => {
                    setGlobalBureauSearch(e.target.value);
                    if (e.target.value === "") {
                      setFoundBureau(null);
                      setShowNoResults(false);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      searchBureau();
                      // Affiche le message seulement si la recherche est vide et qu'on a appuyé sur Entrée
                      if (globalBureauSearch.trim() && !foundBureau) {
                        setShowNoResults(true);
                      }
                    }
                  }}
                />
                {globalBureauSearch && (
                  <button
                    onClick={() => {
                      setGlobalBureauSearch("");
                      setFoundBureau(null);
                      setShowNoResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <RiCloseLine className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {/* Message si recherche sans résultats */}
              {showNoResults && globalBureauSearch && !foundBureau && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 bg-white p-4 rounded-lg border border-gray-200 text-center"
                >
                  <RiSearchLine className="mx-auto text-gray-400 text-2xl mb-2" />
                  <p className="text-gray-600">
                    Aucun bureau trouvé avec "
                    <span className="font-medium">{globalBureauSearch}</span>"
                  </p>
                  <button
                    onClick={() => {
                      setGlobalBureauSearch("");
                      setShowNoResults(false);
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center justify-center mx-auto"
                  >
                    <RiCloseLine className="mr-1" />
                    Réinitialiser la recherche
                  </button>
                </motion.div>
              )}
            </div>

            {/* Afficher les résultats si un bureau est trouvé */}
            {foundBureau && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      Bureau {foundBureau.bureauName} - Direction{" "}
                      {foundBureau.directionName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {foundBureau.equipments.length} équipement(s)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDirection(foundBureau.directionName);
                      setGlobalBureauSearch("");
                      setFoundBureau(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center"
                  >
                    Voir la direction <RiArrowRightLine className="ml-1" />
                  </button>
                </div>

                {/* Statistiques du bureau - Version Professionnelle Améliorée */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                  {/* Carte Fonctionnels */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 mr-3 bg-blue-100 rounded-lg">
                        <RiCheckboxCircleFill className="text-blue-600 text-xl" />
                      </div>
                      <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                        Fonctionnels
                      </h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-bold text-blue-900">
                        {
                          foundBureau.equipments.filter(
                            (e) => e.statut === "Fonctionnel"
                          ).length
                        }
                      </p>
                      <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        {Math.round(
                          (foundBureau.equipments.filter(
                            (e) => e.statut === "Fonctionnel"
                          ).length /
                            foundBureau.equipments.length) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (foundBureau.equipments.filter(
                              (e) => e.statut === "Fonctionnel"
                            ).length /
                              foundBureau.equipments.length) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Carte Réformés Bureau */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 mr-3 bg-red-100 rounded-lg">
                        <RiErrorWarningFill className="text-red-600 text-xl" />
                      </div>
                      <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wider">
                        Réformés Bureau
                      </h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-bold text-red-900">
                        {
                          foundBureau.equipments.filter(
                            (e) => e.statut === "Réformé en bureau"
                          ).length
                        }
                      </p>
                      <div className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                        {Math.round(
                          (foundBureau.equipments.filter(
                            (e) => e.statut === "Réformé en bureau"
                          ).length /
                            foundBureau.equipments.length) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-red-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (foundBureau.equipments.filter(
                              (e) => e.statut === "Réformé en bureau"
                            ).length /
                              foundBureau.equipments.length) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-red-600 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Carte Réformés Stock */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 mr-3 bg-amber-100 rounded-lg">
                        <RiBox3Fill className="text-amber-600 text-xl" />
                      </div>
                      <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wider">
                        Réformés Stock
                      </h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-bold text-amber-900">
                        {
                          foundBureau.equipments.filter(
                            (e) => e.statut === "Réformé en stock"
                          ).length
                        }
                      </p>
                      <div className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                        {Math.round(
                          (foundBureau.equipments.filter(
                            (e) => e.statut === "Réformé en stock"
                          ).length /
                            foundBureau.equipments.length) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (foundBureau.equipments.filter(
                              (e) => e.statut === "Réformé en stock"
                            ).length /
                              foundBureau.equipments.length) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Contenu principal */}
            {selectedDirection && directionStats[selectedDirection] ? (
              <motion.div
                key={selectedDirection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      title: "Total Équipements",
                      value: directionStats[selectedDirection].total,
                      icon: (
                        <RiFileList3Line
                          className="text-indigo-600"
                          size={20}
                        />
                      ),
                      bg: "bg-indigo-50",
                      border: "border-indigo-100",
                      text: "text-indigo-700",
                      progress: "bg-indigo-500",
                    },
                    {
                      title: "Fonctionnels",
                      value: directionStats[selectedDirection].functionalCount,
                      percentage: Math.round(
                        (directionStats[selectedDirection].functionalCount /
                          directionStats[selectedDirection].total) *
                          100
                      ),
                      icon: (
                        <RiCheckboxCircleLine
                          className="text-emerald-600"
                          size={20}
                        />
                      ),
                      bg: "bg-emerald-50",
                      border: "border-emerald-100",
                      text: "text-emerald-700",
                      progress: "bg-emerald-500",
                    },
                    {
                      title: "Réformés Bureau",
                      value:
                        directionStats[selectedDirection].reformedInBureauCount,
                      percentage: Math.round(
                        (directionStats[selectedDirection]
                          .reformedInBureauCount /
                          directionStats[selectedDirection].total) *
                          100
                      ),
                      icon: <PiDeskFill className="text-rose-600" size={20} />,
                      bg: "bg-rose-50",
                      border: "border-rose-100",
                      text: "text-rose-700",
                      progress: "bg-rose-500",
                    },
                    {
                      title: "Réformés Stock",
                      value:
                        directionStats[selectedDirection].reformedInStockCount,
                      percentage: Math.round(
                        (directionStats[selectedDirection]
                          .reformedInStockCount /
                          directionStats[selectedDirection].total) *
                          100
                      ),
                      icon: (
                        <RiArchiveLine className="text-amber-600" size={20} />
                      ),
                      bg: "bg-amber-50",
                      border: "border-amber-100",
                      text: "text-amber-700",
                      progress: "bg-amber-500",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${stat.bg} ${stat.border} p-5 rounded-xl border shadow-xs hover:shadow-sm transition-all duration-300 group`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            {stat.title}
                          </p>
                          <p className={`text-3xl font-bold ${stat.text}`}>
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${stat.bg.replace(
                            "-50",
                            "-100"
                          )} group-hover:bg-white transition-colors`}
                        >
                          {stat.icon}
                        </div>
                      </div>

                      {stat.percentage !== undefined && (
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Taux</span>
                            <span className="font-medium">
                              {stat.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full rounded-full ${stat.progress}`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Liste des bureaux avec animation et recherche */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                      <RiDoorOpenLine className="mr-2" />
                      Bureaux (
                      {
                        Object.keys(directionStats[selectedDirection].bureaux)
                          .length
                      }
                      )
                    </h5>

                    {/* Barre de recherche locale */}
                    <div className="relative w-full md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RiSearchLine className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="Rechercher un bureau..."
                        value={bureauSearchTerm}
                        onChange={(e) => setBureauSearchTerm(e.target.value)}
                      />
                      {bureauSearchTerm && (
                        <button
                          onClick={() => setBureauSearchTerm("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <RiCloseLine className="text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {Object.entries(directionStats[selectedDirection].bureaux)
                    .length > 0 ? (
                    <div
                      className={`space-y-2 ${
                        Object.entries(
                          directionStats[selectedDirection].bureaux
                        ).length > 4
                          ? "max-h-[230px] overflow-y-auto"
                          : ""
                      }`}
                    >
                      {(() => {
                        const filteredBureaux = Object.entries(
                          directionStats[selectedDirection].bureaux
                        )
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .filter(([bureau]) =>
                            bureau
                              .toLowerCase()
                              .includes(bureauSearchTerm.toLowerCase())
                          );

                        if (filteredBureaux.length === 0 && bureauSearchTerm) {
                          return (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-6"
                            >
                              <RiSearchLine className="mx-auto text-gray-300 text-3xl mb-2" />
                              <p className="text-gray-500">
                                Aucun bureau trouvé avec "
                                <span className="font-medium">
                                  {bureauSearchTerm}
                                </span>
                                "
                              </p>
                              <button
                                onClick={() => setBureauSearchTerm("")}
                                className="mt-2 text-sm text-red-500 hover:text-red-700"
                              >
                                Réinitialiser la recherche
                              </button>
                            </motion.div>
                          );
                        }

                        return filteredBureaux.map(([bureau, equipments]) => {
                          const hasReformedEquipment = equipments.some(
                            (eq) => eq.statut === "Réformé en bureau"
                          );

                          return (
                            <motion.div
                              key={bureau}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setSelectedBureauInDirection(
                                    selectedBureauInDirection === bureau
                                      ? null
                                      : bureau
                                  )
                                }
                                className={`w-full flex justify-between items-center p-3 ${
                                  hasReformedEquipment
                                    ? "bg-red-50"
                                    : "bg-white"
                                } rounded-lg hover:bg-gray-50 transition-colors text-left shadow-xs hover:shadow-sm border ${
                                  hasReformedEquipment
                                    ? "border-red-100"
                                    : "border-gray-100"
                                }`}
                              >
                                <div className="flex items-center">
                                  <RiOfficeFill
                                    className={`${
                                      hasReformedEquipment
                                        ? "text-red-400"
                                        : "text-gray-400"
                                    } mr-2`}
                                  />
                                  <span
                                    className={`font-medium ${
                                      hasReformedEquipment
                                        ? "text-red-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Bureau {bureau}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span
                                    className={`text-xs ${
                                      hasReformedEquipment
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"
                                    } px-2 py-1 rounded-full mr-2`}
                                  >
                                    {equipments.length} équipement
                                    {equipments.length > 1 ? "s" : ""}
                                  </span>
                                  <RiArrowDownSLine
                                    className={`${
                                      hasReformedEquipment
                                        ? "text-red-400"
                                        : "text-gray-400"
                                    } transition-transform ${
                                      selectedBureauInDirection === bureau
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </button>

                              <AnimatePresence>
                                {selectedBureauInDirection === bureau && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pl-8 pr-2 pt-1"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-2">
                                      {equipments.map((eq, idx) => (
                                        <motion.div
                                          key={eq.id || eq.numero_serie || idx}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className={`p-2 bg-white rounded border ${
                                            eq.statut === "Réformé en bureau"
                                              ? "border-red-100"
                                              : "border-gray-100"
                                          } text-sm`}
                                        >
                                          <div className="flex justify-between">
                                            <span
                                              className={`font-medium ${
                                                eq.statut ===
                                                "Réformé en bureau"
                                                  ? "text-red-700"
                                                  : "text-gray-700"
                                              }`}
                                            >
                                              {eq.type}
                                            </span>
                                            <span
                                              className={`text-xs px-2 py-1 rounded-full ${
                                                eq.statut === "Fonctionnel"
                                                  ? "bg-green-100 text-green-700"
                                                  : eq.statut ===
                                                    "Réformé en bureau"
                                                  ? "bg-red-100 text-red-700"
                                                  : eq.statut ===
                                                    "Réformé en stock"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-gray-100 text-gray-700"
                                              }`}
                                            >
                                              {eq.statut}
                                            </span>
                                          </div>
                                          <p
                                            className={`text-xs ${
                                              eq.statut === "Réformé en bureau"
                                                ? "text-red-500"
                                                : "text-gray-500"
                                            } mt-1`}
                                          >
                                            {eq.marque} {eq.modele} • #
                                            {eq.numero_serie || "N/A"}
                                          </p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <RiFolderOpenLine className="mx-auto text-gray-300 text-3xl mb-2" />
                      <p className="text-gray-500">Aucun bureau enregistré</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <RiSearchEyeLine className="mx-auto text-gray-300 text-4xl mb-4" />
                <h5 className="text-gray-500 font-medium mb-1">
                  Aucune direction sélectionnée
                </h5>
                <p className="text-gray-400 text-sm">
                  Choisissez une direction dans le menu déroulant pour afficher
                  les statistiques
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Reformed Equipment Table */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div
            className="p-6 border-b border-gray-200"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            }}
          >
            <h3 className="text-xl font-bold text-white">
              Liste des Équipements Réformés
              {reformedEquipments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-white/80">
                  ({reformedEquipments.length} équipements, nouveaux en premier)
                </span>
              )}
            </h3>
          </div>

          <div className="p-6">
            {reformedEquipments.length === 0 ? (
              <div className="text-center py-8 text-gray-500"></div>
            ) : (
              <>
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
                          N° Série
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((equipment, index) => {
                        const isReformedInOffice = equipment.statut
                          ?.toLowerCase()
                          .includes("bureau");

                        return (
                          <motion.tr
                            key={equipment.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`${
                              isReformedInOffice
                                ? "bg-red-50 hover:bg-red-100"
                                : "bg-yellow-50 hover:bg-yellow-100"
                            } transition-colors duration-150`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {equipment.type || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {equipment.marque || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {equipment.modele || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {equipment.bureau || "Non attribué"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              {equipment.numero_serie || "NC"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  isReformedInOffice
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {equipment.statut || "Statut inconnu"}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 px-2 py-3 bg-gray-50 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page{" "}
                          <span className="font-medium">{currentPage}</span> sur{" "}
                          <span className="font-medium">{totalPages}</span> -{" "}
                          <span className="font-medium">
                            {reformedEquipments.length}
                          </span>{" "}
                          équipements
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Précédent</span>
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (page) =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1)
                            )
                            .map((page, i, array) => (
                              <React.Fragment key={page}>
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === page
                                      ? "z-10 bg-red-50 border-red-500 text-red-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                                {array[i + 1] && page + 1 < array[i + 1] && (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                )}
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Suivant</span>
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EquipmentStatistics;
