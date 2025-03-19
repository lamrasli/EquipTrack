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
  visible: { opacity: 1, y: 0, transition: { duration: 1.65 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.65 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.65 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.65 } },
};

const EquipmentStatistics = ({ equipmentList }) => {
  const [dateFilter, setDateFilter] = useState("year");
  const [bureauInput, setBureauInput] = useState("");
  const [bureauStats, setBureauStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null); //No change: still used for hover effects
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
            acc.reformedInBureau.push(equipment); // Store the whole equipment object
          } else if (equipment.statut === "Réformé en stock") {
            acc.reformedInStock.push(equipment); // Store the whole equipment object
          } else {
            acc.functional.push(equipment); // Store the whole equipment object
          }
        }
        return acc;
      },
      {
        total: 0,
        functional: [], // Array to store functional equipment
        reformedInBureau: [], // Array to store reformed equipment in bureau
        reformedInStock: [], // Array to store reformed equipment in stock
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

  const equipmentByCategory = equipmentList.reduce((acc, equipment) => {
    acc[equipment.type] = (acc[equipment.type] || 0) + 1;
    return acc;
  }, {});

  const equipmentByDivision = equipmentList.reduce((acc, equipment) => {
    acc[equipment.bureau] = (acc[equipment.bureau] || 0) + 1;
    return acc;
  }, {});

  const equipmentByBrand = equipmentList.reduce((acc, equipment) => {
    acc[equipment.marque] = (acc[equipment.marque] || 0) + 1;
    return acc;
  }, {});

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
  };

  const reformedEquipments = equipmentList
    .filter(
      (equipment) =>
        equipment.statut === "Réformé en bureau" ||
        equipment.statut === "Réformé en stock"
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reformedEquipments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(reformedEquipments.length / itemsPerPage);

  // Function to handle hover
  const handleEquipmentHover = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleEquipmentLeave = () => {
    setSelectedEquipment(null);
  };

  // Function to handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Maximum number of page buttons to show

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage reaches totalPages
    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    // Add "Previous" button
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

    // Add numbered buttons
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

    // Add "Next" button
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
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">
        Statistiques des Équipements
      </h2>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6"
      ></motion.div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <label className="text-lg font-semibold text-gray-700 mr-4">
            Filtrer par :
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="year">Année</option>
            <option value="month">Mois</option>
          </select>
          <h3 className="text-lg font-semibold mt-4 mb-4 text-gray-700">
            Équipements par {dateFilter === "year" ? "Année" : "Mois"}
          </h3>
          <Bar data={dateChartData} />
        </motion.div>
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Statut des Équipements
          </h3>
          <Doughnut data={doughnutChartData} />
        </motion.div>
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white mb-6 rounded-lg duration-300 hover: cursor-pointer"
            onClick={handleChartClick} // Gestionnaire de clic
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Équipements par Bureau
            </h3>
            <Bar data={bureauChartData} options={bureauChartOptions} />
          </motion.div>
          {showOffcanvas && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-11/12 max-w-6xl max-h-[70vh] overflow-y-auto relative pt-12">
                {/* Bouton de fermeture fixe et agrandi */}
                <button
                  onClick={handleCloseOffcanvas}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl p-2 bg-white rounded-full shadow-lg"
                >
                  &times; {/* Icône de fermeture */}
                </button>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Équipements par Bureau (Agrandi)
                </h3>
                <Bar
                  data={bureauChartData}
                  options={{
                    ...bureauChartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                  height={250} // Hauteur réduite du graphique
                />
              </div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-700">
            Équipements par Catégorie
          </h3>
          <Bar data={barChartData} />
        </motion.div>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {[
          {
            title: "Total Éq.",
            value: totalEquipment,
            color: "text-blue-800",
          },
          {
            title: "Éq. Réformés en Bureau",
            value: reformedEquipmentInBureau.length,
            color: "text-red-600",
            tooltip: reformedEquipmentInBureau
              .map(
                (e) =>
                  `Type: ${e.type}, Marque: ${e.marque}, Modèle: ${e.modele}, Numéro de Série: ${e.numero_serie}`
              )
              .join("\n"),
            onMouseEnter: () => handleEquipmentHover(reformedEquipmentInBureau),
            onMouseLeave: handleEquipmentLeave,
          },
          {
            title: "Éq. Réformés en Stock",
            value: reformedEquipmentInStock.length,
            color: "text-orange-600",
            tooltip: reformedEquipmentInStock
              .map(
                (e) =>
                  `Type: ${e.type}, Marque: ${e.marque}, Modèle: ${e.modele}, Numéro de Série: ${e.numero_serie}`
              )
              .join("\n"),
            onMouseEnter: () => handleEquipmentHover(reformedEquipmentInStock),
            onMouseLeave: handleEquipmentLeave,
          },
          {
            title: "Total Éq. Réformés",
            value:
              reformedEquipmentInBureau.length +
              reformedEquipmentInStock.length,
            color: "text-purple-600",
            tooltip: "Total des équipements réformés en bureau et en stock",
          },
          {
            title: "Éq. Fonctionnels",
            value: functionalEquipment,
            color: "text-green-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            data-tip={stat.tooltip}
            data-for={`tooltip-${index}`}
            onMouseEnter={stat.onMouseEnter} // Add hover event
            onMouseLeave={stat.onMouseLeave} // Add mouse leave event
          >
            <h3 className="text-lg font-semibold text-gray-700">
              {stat.title}
            </h3>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <h3 className="text-2xl font-bold text-blue-800 mb-6">
          Rechercher des Statistiques de Bureau
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={bureauInput}
            onChange={handleInputChange}
            placeholder="Entrez le numéro de bureau"
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 flex-1"
          />
          <button
            onClick={handleSearchBureau}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Rechercher
          </button>
        </div>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-red-500 text-sm"
          >
            {errorMessage}
          </motion.div>
        )}
        {bureauStats && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-6"
          >
            <h4 className="text-xl font-bold text-gray-700 mb-4">
              Résultats pour le bureau : {bureauInput}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Équipements Fonctionnels */}
              <div className="bg-green-100 p-4 rounded-lg relative group">
                <p className="text-lg font-semibold text-green-800">
                  Équipements Fonctionnels
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {bureauStats.functional.length}
                </p>
                {/* Tooltip Content */}
                <div className="absolute left-0 bottom-full w-64 p-2 mb-1 bg-gray-800 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <table className="min-w-full">
                    <tbody>
                      {bureauStats.functional.map((eq, index) => (
                        <tr key={index}>
                          <td className="text-xs p-2">{eq.type}</td>
                          <td className="text-xs p-2">{eq.marque}</td>
                          <td className="text-xs p-2">{eq.modele}</td>
                          <td className="text-xs p-2">{eq.numero_serie}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Réformé en Bureau */}
              <div className="bg-red-100 p-4 rounded-lg relative group">
                <p className="text-lg font-semibold text-red-800">
                  Réformé en Bureau
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {bureauStats.reformedInBureau.length}
                </p>
                {/* Tooltip Content */}
                <div className="absolute left-0 bottom-full w-64 p-2 mb-1 bg-gray-800 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <table className="min-w-full">
                    <tbody>
                      {bureauStats.reformedInBureau.map((eq, index) => (
                        <tr key={index}>
                          <td className="text-xs p-2">{eq.type}</td>
                          <td className="text-xs p-2">{eq.marque}</td>
                          <td className="text-xs p-2">{eq.modele}</td>
                          <td className="text-xs p-2">{eq.numero_serie}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Réformé en Stock */}
              <div className="bg-orange-100 p-4 rounded-lg relative group">
                <p className="text-lg font-semibold text-orange-800">
                  Réformé en Stock
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {bureauStats.reformedInStock.length}
                </p>
                {/* Tooltip Content */}
                <div className="absolute left-0 bottom-full w-64 p-2 mb-1 bg-gray-800 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <table className="min-w-full">
                    <tbody>
                      {bureauStats.reformedInStock.map((eq, i) => (
                        <tr key={i}>
                          <td className="text-xs p-2">{eq.type}</td>
                          <td className="text-xs p-2">{eq.marque}</td>
                          <td className="text-xs p-2">{eq.modele}</td>
                          <td className="text-xs p-2">{eq.numero_serie}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Équipements */}
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-lg font-semibold text-blue-800">
                  Total Équipements
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {bureauStats.total}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Graphiques et Barres de Progression */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Graphique en Secteurs pour Équipements par Marque */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            Équipements par Marque
          </h3>
          <div className="flex justify-center">
            <Pie
              data={{
                labels: Object.keys(equipmentByBrand),
                datasets: [
                  {
                    label: "Nombre d'équipements par marque",
                    data: Object.values(equipmentByBrand),
                    backgroundColor: [
                      "rgba(255, 99, 132, 0.2)",
                      "rgba(54, 162, 235, 0.2)",
                      "rgba(255, 206, 86, 0.2)",
                      "rgba(75, 192, 192, 0.2)",
                      "rgba(153, 102, 255, 0.2)",
                      "rgba(255, 159, 64, 0.2)",
                    ],
                    borderColor: [
                      "rgba(255, 99, 132, 1)",
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 206, 86, 1)",
                      "rgba(75, 192, 192, 1)",
                      "rgba(153, 102, 255, 1)",
                      "rgba(255, 159, 64, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              style={{ height: "300px", width: "300px" }}
            />
          </div>
        </motion.div>

        {/* Barres de Progression */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
        >
          <div className="flex flex-col justify-center mt-6">
            <h3 className="text-xl font-bold text-blue-800 mt-8 mb-4">
              Progression Fonctionnelle
            </h3>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${functionalPercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {functionalPercentage}% des équipements sont fonctionnels.
              </p>
            </div>

            <h3 className="text-xl font-bold text-blue-800 mt-8 mb-4">
              Progression Réformée en Bureau
            </h3>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${reformedInBureauPercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {reformedInBureauPercentage}% des équipements sont réformés en
                bureau.
              </p>
            </div>

            <h3 className="text-xl font-bold text-blue-800 mt-8 mb-4">
              Progression Réformée en Stock
            </h3>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${reformedInStockPercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {reformedInStockPercentage}% des équipements sont réformés en
                stock.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Liste des Équipements Réformés */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 p-4 rounded-lg transition-shadow duration-300"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Liste des Équipements Réformés
        </h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Marque</th>
              <th className="py-2 px-4 text-left">Modèle</th>
              <th className="py-2 px-4 text-left">Bureau</th>
              <th className="py-2 px-4 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((equipment, index) => {
              const rowColorClass =
                equipment.statut === "Réformé en bureau"
                  ? "bg-red-100"
                  : "bg-orange-100";

              const tooltipText = `Type: ${equipment.type}, Marque: ${equipment.marque}, Modèle: ${equipment.modele}, Numéro de Série: ${equipment.numero_serie}`;

              return (
                <motion.tr
                  key={equipment.id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-b ${rowColorClass}`}
                  title={tooltipText}
                >
                  <td className="py-2 px-4">{equipment.type}</td>
                  <td className="py-2 px-4">{equipment.marque}</td>
                  <td className="py-2 px-4">{equipment.modele}</td>
                  <td className="py-2 px-4">{equipment.bureau}</td>
                  <td className="py-2 px-4">{equipment.statut}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">{renderPagination()}</div>
        )}
      </motion.div>
    </div>
  );
};

export default EquipmentStatistics;
