import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  MdDeleteForever,
  MdEdit,
  MdCalendarToday,
  MdFilterAlt,
  MdRefresh,
  MdFileDownload,
  MdHistory,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { equipmentModels, directions } from "./EquipmentForm";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EquipmentTable = ({ equipmentList = [], onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    marque: "",
    direction: "",
    modele: "",
    numero_serie: "",
    bureau: "",
    date: "",
    dateSort: "",
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;
  const datePickerRef = useRef(null);
  const filtersRef = useRef(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target) &&
        !event.target.closest(".filter-toggle")
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportToExcel = () => {
    // 1. Préparer les données avec formatage français
    const data = equipmentList.map((equipment) => ({
      Direction: equipment.direction,
      Type: equipment.type,
      Marque: equipment.marque,
      Modèle: equipment.modele,
      "N° Série": equipment.numero_serie,
      Bureau: equipment.bureau,
      Statut: equipment.statut,
      Date: new Date(equipment.date).toLocaleDateString("fr-FR"),
    }));

    // 2. Créer la feuille Excel
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Définir les styles professionnels
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "4472C4" } }, // Bleu corporate
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Styles conditionnels pour les statuts
    const statusStyles = {
      Fonctionnel: {
        fill: { fgColor: { rgb: "C6EFCE" } },
        font: { color: { rgb: "006100" } },
      },
      "Réformé en bureau": {
        fill: { fgColor: { rgb: "FFC7CE" } },
        font: { color: { rgb: "9C0006" } },
      },
      "Réformé en stock": {
        fill: { fgColor: { rgb: "FFEB9C" } },
        font: { color: { rgb: "9C6500" } },
      },
    };

    // 4. Appliquer les styles
    // a. En-têtes
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      ws[headerCell].s = headerStyle;
    }

    // b. Données
    for (let R = 1; R <= range.e.r; ++R) {
      const statusCell = XLSX.utils.encode_cell({ r: R, c: 6 }); // Colonne Statut (G)
      if (ws[statusCell] && statusStyles[ws[statusCell].v]) {
        ws[statusCell].s = statusStyles[ws[statusCell].v];
      }

      // Style de base pour toutes les cellules
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        ws[cell].s = {
          alignment: { vertical: "center" },
          border: {
            left: { style: "thin", color: { rgb: "D9D9D9" } },
            right: { style: "thin", color: { rgb: "D9D9D9" } },
          },
        };
      }
    }

    // 5. Largeurs de colonnes
    ws["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ];

    // 6. Ajouter un titre
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        ["Inventaire des Équipements Informatiques"],
        ["Export du " + new Date().toLocaleDateString("fr-FR")],
        [""], // Ligne vide
      ],
      { origin: "A1" }
    );

    // 7. Fusionner le titre
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];

    // Style du titre
    const titleCell = ws["A1"];
    titleCell.s = {
      font: { bold: true, sz: 16, color: { rgb: "2F5597" } },
      alignment: { horizontal: "center" },
    };

    // 8. Créer le workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Équipements");

    // 9. Exporter avec nom de fichier daté
    XLSX.writeFile(
      wb,
      `Inventaire_Equipements_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const upperCaseValue =
      name === "numero_serie" ? value.toUpperCase() : value;
    setFilters({ ...filters, [name]: upperCaseValue });
    setCurrentPage(1);
  };

  const handleDateChange = (date) => {
    setFilters({
      ...filters,
      date: date ? date.toISOString().split("T")[0] : "",
      startDate: null,
      endDate: null,
      dateSort: "",
    });
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters({
      ...filters,
      startDate: start,
      endDate: end,
      date: "",
      dateSort: "",
    });
    setCurrentPage(1);
  };

  const handleDateSortChange = (sortType) => {
    setFilters({
      ...filters,
      dateSort: sortType,
      date: "",
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters({
      status: "",
      type: "",
      marque: "",
      direction: "",
      modele: "",
      numero_serie: "",
      bureau: "",
      date: "",
      dateSort: "",
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };

  const getModelOptions = () => {
    if (!filters.type || !filters.marque || !equipmentModels?.[filters.type]) {
      return [];
    }
    return equipmentModels[filters.type]?.[filters.marque] || [];
  };

  const filteredEquipmentList = equipmentList.filter((equipment) => {
    const equipmentDate = new Date(equipment.date);
    const matchesDate = filters.date
      ? equipmentDate.toISOString().split("T")[0] === filters.date
      : true;

    const matchesDateRange =
      filters.startDate && filters.endDate
        ? equipmentDate >= filters.startDate && equipmentDate <= filters.endDate
        : true;

    return (
      (filters.status === "" || equipment.statut === filters.status) &&
      (filters.type === "" || equipment.type === filters.type) &&
      (filters.marque === "" || equipment.marque === filters.marque) &&
      (filters.modele === "" || equipment.modele === filters.modele) &&
      (filters.numero_serie === "" ||
        (equipment.numero_serie &&
          String(equipment.numero_serie)
            .toUpperCase()
            .includes(filters.numero_serie.toUpperCase()))) &&
      (filters.bureau === "" ||
        (equipment.bureau && equipment.bureau.includes(filters.bureau))) &&
      (filters.direction === "" || equipment.direction === filters.direction) &&
      matchesDate &&
      matchesDateRange
    );
  });

  const sortedEquipmentList = [...filteredEquipmentList].sort((a, b) => {
    if (filters.dateSort === "recent") {
      return new Date(b.date) - new Date(a.date);
    } else if (filters.dateSort === "oldest") {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEquipmentList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedEquipmentList.length / itemsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        Précédent
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 rounded-md ${
            1 === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="start-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded-md ${
            totalPages === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        Suivant
      </button>
    );

    return buttons;
  };
  const handleEditClick = useCallback(
    (equipment) => () => {
      // Scroll vers le haut avec un léger délai
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);

      onEdit(equipment);
    },
    [onEdit]
  );

  const handleDeleteClick = useCallback(
    (id) => () => {
      onDelete(id);
    },
    [onDelete]
  );

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      {/* Header Section */}
      <div className="mb-8">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Équipements</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredEquipmentList.length}
              </p>
            </div>
          </div>

          {/* Functional Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
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
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fonctionnel</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  filteredEquipmentList.filter(
                    (e) => e.statut === "Fonctionnel"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Réformé Stock</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  filteredEquipmentList.filter(
                    (e) => e.statut === "Réformé en stock"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Office Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Réformé Bureau</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  filteredEquipmentList.filter(
                    (e) => e.statut === "Réformé en bureau"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition filter-toggle"
            >
              <MdFilterAlt className="text-gray-500" />
              <span>Filtres</span>
            </button>

            <button
              onClick={resetAllFilters}
              disabled={Object.values(filters).every((val) => val === "")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                Object.values(filters).every((val) => val === "")
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdRefresh />
              <span>Réinitialiser</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOffcanvas(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <MdHistory />
              <span>Historique</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <MdFileDownload />
              <span>Exporter Excel</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              ref={filtersRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Direction Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <select
                    name="direction"
                    value={filters.direction}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Toutes directions</option>
                    {directions.map((direction) => (
                      <option key={direction} value={direction}>
                        {direction}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous types</option>
                    {Object.keys(equipmentModels).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marque Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque
                  </label>
                  <select
                    name="marque"
                    value={filters.marque}
                    onChange={handleFilterChange}
                    disabled={!filters.type}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Toutes marques</option>
                    {filters.type &&
                      Object.keys(equipmentModels[filters.type]).map(
                        (marque) => (
                          <option key={marque} value={marque}>
                            {marque}
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* Modèle Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <select
                    name="modele"
                    value={filters.modele}
                    onChange={handleFilterChange}
                    disabled={!filters.marque}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Tous modèles</option>
                    {getModelOptions().map((model, index) => (
                      <option key={index} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Numéro de série Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de série
                  </label>
                  <input
                    type="text"
                    name="numero_serie"
                    value={filters.numero_serie}
                    onChange={handleFilterChange}
                    placeholder="Rechercher par N° série"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bureau Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bureau
                  </label>
                  <input
                    type="text"
                    name="bureau"
                    value={filters.bureau}
                    onChange={handleFilterChange}
                    placeholder="Rechercher par bureau"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Statut Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous statuts</option>
                    <option value="Fonctionnel">Fonctionnel</option>
                    <option value="Réformé en bureau">Réformé bureau</option>
                    <option value="Réformé en stock">Réformé stock</option>
                  </select>
                </div>

                {/* Date Filter Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    <MdCalendarToday />
                    <span>Filtrer par date</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            ref={datePickerRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl border border-gray-200"
            style={{ width: "350px" }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date précise
                </label>
                <DatePicker
                  selected={filters.date ? new Date(filters.date) : null}
                  onChange={handleDateChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholderText="Sélectionner une date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <DatePicker
                  selectsRange
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholderText="Du... au..."
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDateSortChange("recent")}
                    className={`flex-1 py-2 text-sm rounded-md ${
                      filters.dateSort === "recent"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Plus récent
                  </button>
                  <button
                    onClick={() => handleDateSortChange("oldest")}
                    className={`flex-1 py-2 text-sm rounded-md ${
                      filters.dateSort === "oldest"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Plus ancien
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setFilters({
                      ...filters,
                      date: "",
                      dateSort: "",
                      startDate: null,
                      endDate: null,
                    });
                    setShowDatePicker(false);
                  }}
                  className="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Marque
                </th>
                <th className="px-6 py-3 text-center text-xs font-medboldium text-gray-500 uppercase tracking-wider">
                  Modèle
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  N° Série
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bureau
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {currentItems.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucun équipement ne correspond aux filtres sélectionnés
                    </td>
                  </motion.tr>
                ) : (
                  currentItems.map((equipment, index) => (
                    <motion.tr
                      key={equipment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${
                        equipment.statut === "Réformé en bureau"
                          ? "bg-red-50"
                          : equipment.statut === "Réformé en stock"
                          ? "bg-amber-50"
                          : "bg-green-50"
                      } hover:bg-opacity-70 transition`}
                    >
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {equipment.direction}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {equipment.type}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {equipment.marque}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {equipment.modele}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900 font-mono">
                        {equipment.numero_serie}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {equipment.bureau}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
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
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                        {new Date(equipment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex rounded-md shadow-sm">
                          <button
                            onClick={handleEditClick(equipment)}
                            className="px-3 py-1 text-sm bg-white text-blue-600 border border-gray-200 rounded-l-md hover:bg-gray-50 transition"
                            title="Modifier"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={handleDeleteClick(equipment.id)}
                            className="px-3 py-1 text-sm bg-white text-red-600 border-t border-b border-r border-gray-200 rounded-r-md hover:bg-gray-50 transition"
                            title="Supprimer"
                          >
                            <MdDeleteForever size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          Affichage de{" "}
          <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
          <span className="font-medium">
            {Math.min(indexOfLastItem, filteredEquipmentList.length)}
          </span>{" "}
          sur{" "}
          <span className="font-medium">{filteredEquipmentList.length}</span>{" "}
          résultats
        </div>
        <div className="flex gap-2">{renderPaginationButtons()}</div>
      </div>
      {/* Historique Offcanvas */}
      <AnimatePresence>
        {showOffcanvas && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Historique des modifications
                </h2>
                <button
                  onClick={() => setShowOffcanvas(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Rechercher par numéro de série"
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                />
                <MdSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Ici vous ajouterez la liste des historiques filtrés */}
                <p className="text-gray-500">
                  Fonctionnalité d'historique à implémenter
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentTable;
