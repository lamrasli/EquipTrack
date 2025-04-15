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
import ExcelJS from "exceljs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getHistoryBySerialNumber } from "../historyService";

const EquipmentTable = ({ equipmentList = [], onEdit, onDelete, user }) => {
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
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async (numero_serie) => {
    setLoadingHistory(true);
    try {
      const records = await getHistoryBySerialNumber(numero_serie);
      setHistoryRecords(records);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showOffcanvas && historySearch) {
      fetchHistory(historySearch.toUpperCase());
    }
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
  }, [showOffcanvas, historySearch]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Ministère des Affaires Etrangères";
    workbook.created = new Date();

    // Style marocain avec couleurs rouge et vert
    const colors = {
      headerBg: "FFC1272A", // Rouge marocain
      headerText: "FFFFFFFF",
      titleBg: "FF046A38", // Vert marocain
      titleText: "FFFFFFFF",
      evenRow: "FFF5F5F5",
      oddRow: "FFFFFFFF",
      border: "FFD9D9D9",
      functional: "FF70AD47",
      officeReform: "FFC1272A", // Rouge
      stockReform: "FFFFC000",
      statsBg: "FFE7E6E6",
      totalBg: "FF4472C4",
      totalText: "FFFFFFFF",
    };

    // Création de la feuille principale
    const worksheet = workbook.addWorksheet("Inventaire");

    // ========== EN-TÊTE ==========

    // Titre principal
    worksheet.mergeCells("B1:G3");
    const titleCell = worksheet.getCell("C1");
    titleCell.value =
      "MINISTÈRE DES AFFAIRES ÉTRANGÈRES\nINVENTAIRE DES ÉQUIPEMENTS INFORMATIQUES";
    titleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: colors.titleText },
    };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.titleBg },
    };
    titleCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Date d'export
    worksheet.mergeCells("H1:I3");
    const dateCell = worksheet.getCell("H1");
    dateCell.value = `Export généré le\n${new Date().toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
    dateCell.font = { name: "Arial", size: 10, color: { argb: "FF333333" } };
    dateCell.alignment = {
      vertical: "center",
      horizontal: "center",
      wrapText: true,
    };
    dateCell.border = {
      top: { style: "thin", color: { argb: colors.border } },
      bottom: { style: "thin", color: { argb: colors.border } },
      left: { style: "thin", color: { argb: colors.border } },
      right: { style: "thin", color: { argb: colors.border } },
    };

    // ========== STATISTIQUES ==========
    // Calcul des statistiques
    const stats = {
      total: equipmentList.length,
      functional: equipmentList.filter((e) => e.statut === "Fonctionnel")
        .length,
      officeReform: equipmentList.filter(
        (e) => e.statut === "Réformé en bureau"
      ).length,
      stockReform: equipmentList.filter((e) => e.statut === "Réformé en stock")
        .length,
      byType: {},
      byDirection: {},
    };

    equipmentList.forEach((equip) => {
      stats.byType[equip.type] = (stats.byType[equip.type] || 0) + 1;
      stats.byDirection[equip.direction] =
        (stats.byDirection[equip.direction] || 0) + 1;
    });

    // Section Statistiques
    worksheet.mergeCells("A5:I6");
    const statsTitleCell = worksheet.getCell("A5");
    statsTitleCell.value = "STATISTIQUES GLOBALES";
    statsTitleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: colors.titleText },
    };
    statsTitleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.titleBg },
    };
    statsTitleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Tableau des stats globales
    const globalStatsHeaders = [
      "Total",
      "Fonctionnels",
      "Réformés bureau",
      "Réformés stock",
    ];
    const globalStatsValues = [
      stats.total,
      stats.functional,
      stats.officeReform,
      stats.stockReform,
    ];

    for (let i = 0; i < globalStatsHeaders.length; i++) {
      const headerCell = worksheet.getCell(7, 1 + i * 2);
      headerCell.value = globalStatsHeaders[i];
      headerCell.font = { name: "Calibri", size: 11, bold: true };
      headerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.statsBg },
      };
      headerCell.alignment = { vertical: "middle", horizontal: "center" };
      headerCell.border = {
        top: { style: "thin", color: { argb: colors.border } },
        bottom: { style: "thin", color: { argb: colors.border } },
        left: { style: "thin", color: { argb: colors.border } },
        right: { style: "thin", color: { argb: colors.border } },
      };

      const valueCell = worksheet.getCell(8, 1 + i * 2);
      valueCell.value = globalStatsValues[i];
      valueCell.font = { name: "Calibri", size: 12, bold: true };
      valueCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i === 0 ? colors.totalBg : colors.statsBg },
      };
      valueCell.font.color = { argb: i === 0 ? colors.totalText : "FF000000" };
      valueCell.alignment = { vertical: "middle", horizontal: "center" };
      valueCell.border = {
        top: { style: "thin", color: { argb: colors.border } },
        bottom: { style: "thin", color: { argb: colors.border } },
        left: { style: "thin", color: { argb: colors.border } },
        right: { style: "thin", color: { argb: colors.border } },
      };
    }

    // Stats par type
    const typeStatsStartRow = 10;
    worksheet.mergeCells(`A${typeStatsStartRow}:B${typeStatsStartRow}`);
    const typeStatsTitle = worksheet.getCell(`A${typeStatsStartRow}`);
    typeStatsTitle.value = "Répartition par type";
    typeStatsTitle.font = { name: "Arial", size: 12, bold: true };
    typeStatsTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.statsBg },
    };

    let currentRow = typeStatsStartRow + 1;
    for (const [type, count] of Object.entries(stats.byType)) {
      worksheet.getCell(`A${currentRow}`).value = type;
      worksheet.getCell(`B${currentRow}`).value = count;
      worksheet.getCell(`B${currentRow}`).numFmt = "0";
      currentRow++;
    }

    // Stats par direction
    const dirStatsStartRow = 10;
    worksheet.mergeCells(`D${dirStatsStartRow}:E${dirStatsStartRow}`);
    const dirStatsTitle = worksheet.getCell(`D${dirStatsStartRow}`);
    dirStatsTitle.value = "Équipements par direction";
    dirStatsTitle.font = { name: "Arial", size: 12, bold: true };
    dirStatsTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.statsBg },
    };

    currentRow = dirStatsStartRow + 1;
    for (const [dir, count] of Object.entries(stats.byDirection)) {
      worksheet.getCell(`D${currentRow}`).value = dir;
      worksheet.getCell(`E${currentRow}`).value = count;
      worksheet.getCell(`E${currentRow}`).numFmt = "0";
      currentRow++;
    }

    // ========== DONNÉES DÉTAILLÉES ==========
    const dataStartRow =
      Math.max(
        typeStatsStartRow + Object.keys(stats.byType).length,
        dirStatsStartRow + Object.keys(stats.byDirection).length
      ) + 3;

    worksheet.mergeCells(`A${dataStartRow}:I${dataStartRow + 1}`);
    const dataTitleCell = worksheet.getCell(`A${dataStartRow}`);
    dataTitleCell.value = "DÉTAIL DE L'INVENTAIRE";
    dataTitleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: colors.titleText },
    };
    dataTitleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.titleBg },
    };
    dataTitleCell.alignment = { vertical: "middle", horizontal: "center" };

    // En-têtes de colonnes
    const headers = [
      { name: "N°", width: 20 },
      { name: "Direction", width: 22 },
      { name: "Type", width: 18 },
      { name: "Marque", width: 18 },
      { name: "Modèle", width: 20 },
      { name: "N° Série", width: 18 },
      { name: "Bureau", width: 15 },
      { name: "Statut", width: 20 },
      { name: "Date", width: 16 },
    ];

    const headerRow = worksheet.addRow(headers.map((h) => h.name));
    headerRow.height = 25;

    // Appliquer le style aux en-têtes
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        size: 11,
        bold: true,
        color: { argb: colors.headerText },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.headerBg },
      };
      cell.border = {
        top: { style: "thin", color: { argb: colors.border } },
        bottom: { style: "medium", color: { argb: colors.headerBg } },
        left: { style: "thin", color: { argb: colors.border } },
        right: { style: "thin", color: { argb: colors.border } },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });

    // Ajuster les largeurs de colonnes
    headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = header.width;
    });

    // Ajouter les données
    equipmentList.forEach((equipment, index) => {
      const acquisitionDate = new Date(equipment.date);
      const row = worksheet.addRow([
        index + 1,
        equipment.direction,
        equipment.type,
        equipment.marque,
        equipment.modele,
        equipment.numero_serie,
        equipment.bureau,
        equipment.statut,
        acquisitionDate.toLocaleDateString("fr-FR"),
      ]);

      // Style des cellules de données
      row.eachCell((cell) => {
        cell.font = {
          name: "Calibri",
          size: 10,
          color: { argb: "FF333333" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: colors.border } },
          bottom: { style: "thin", color: { argb: colors.border } },
          left: { style: "thin", color: { argb: colors.border } },
          right: { style: "thin", color: { argb: colors.border } },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: index % 2 === 0 ? colors.evenRow : colors.oddRow },
        };
      });

      // Style conditionnel pour le statut
      const statusCell = row.getCell(8);
      switch (equipment.statut) {
        case "Fonctionnel":
          statusCell.font.color = { argb: colors.functional };
          break;
        case "Réformé en bureau":
          statusCell.font.color = { argb: colors.officeReform };
          break;
        case "Réformé en stock":
          statusCell.font.color = { argb: colors.stockReform };
          break;
        default:
          // statusCell.font.color = { argb: colors.defaultColor };
          break;
      }

      // Alignement spécifique pour certaines colonnes
      row.getCell(1).alignment = { horizontal: "center" }; // N°
      row.getCell(9).alignment = { horizontal: "center" }; // Date
      row.getCell(10).alignment = { horizontal: "center" }; // Âge
    });

    // ========== PIED DE PAGE ==========
    const footerRow = dataStartRow + equipmentList.length + 3;
    worksheet.mergeCells(`A${footerRow}:I${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value =
      "© Ministère des Affaires Étrangères - Direction des Systèmes d'Information";
    footerCell.font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "FF777777" },
    };
    footerCell.alignment = { horizontal: "center" };

    // Génération du fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MAEC_Inventaire_Equipements_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              ? "bg-red-600 text-white"
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
              ? "bg-red-600 text-white"
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
              ? "bg-red-600 text-white"
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
    <div>
      <div className="mb-6">
        {/* Contenu principal */}
        <div className="bg-white bg-opacity-95 rounded-b-xl shadow-lg overflow-hidden border border-gray-200 backdrop-blur-sm">
          {/* Section statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
            {/* Carte Total */}
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

            {/* Carte Fonctionnel */}
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

            {/* Carte Stock */}
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

            {/* Carte Bureau */}
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

          {/* Barre d'actions */}
          <div className="p-6 border-b border-gray-200">
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <MdFileDownload />
                  <span>Exporter Excel</span>
                </button>
              </div>
            </div>

            {/* Panneau de filtres */}
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
                    {/* Filtre Direction */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Direction
                      </label>
                      <select
                        name="direction"
                        value={filters.direction}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Toutes directions</option>
                        {directions.map((direction) => (
                          <option key={direction} value={direction}>
                            {direction}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Tous types</option>
                        {Object.keys(equipmentModels).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Marque */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marque
                      </label>
                      <select
                        name="marque"
                        value={filters.marque}
                        onChange={handleFilterChange}
                        disabled={!filters.type}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 ${
                          !filters.type ? "bg-gray-100" : "bg-white"
                        }`}
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

                    {/* Filtre Modèle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modèle
                      </label>
                      <select
                        name="modele"
                        value={filters.modele}
                        onChange={handleFilterChange}
                        disabled={!filters.marque}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 ${
                          !filters.marque ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <option value="">Tous modèles</option>
                        {getModelOptions().map((model, index) => (
                          <option key={index} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Numéro de série */}
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    {/* Filtre Bureau */}
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    {/* Filtre Statut */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Tous statuts</option>
                        <option value="Fonctionnel">Fonctionnel</option>
                        <option value="Réformé en bureau">
                          Réformé bureau
                        </option>
                        <option value="Réformé en stock">Réformé stock</option>
                      </select>
                    </div>

                    {/* Bouton Filtre Date */}
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

          {/* Tableau des équipements */}
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
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Affichage de{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredEquipmentList.length)}
              </span>{" "}
              sur{" "}
              <span className="font-medium">
                {filteredEquipmentList.length}
              </span>{" "}
              résultats
            </div>
            <div className="flex gap-2">{renderPaginationButtons()}</div>
          </div>
        </div>
      </div>

      {/* Modals et Offcanvas */}
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
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
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Plus récent
                  </button>
                  <button
                    onClick={() => handleDateSortChange("oldest")}
                    className={`flex-1 py-2 text-sm rounded-md ${
                      filters.dateSort === "oldest"
                        ? "bg-red-600 text-white"
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
                  className="flex-1 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historique Offcanvas */}
      <AnimatePresence>
        {showOffcanvas && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowOffcanvas(false);
                setHistorySearch("");
                setHistoryRecords([]);
              }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 border-l border-gray-200"
            >
              <div className="h-full flex flex-col">
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Historique des modifications
                    </h2>
                    <button
                      onClick={() => {
                        setShowOffcanvas(false);
                        setHistorySearch("");
                        setHistoryRecords([]);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MdClose
                        size={24}
                        className="text-gray-500 hover:text-gray-700"
                      />
                    </button>
                  </div>

                  <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Rechercher par numéro de série..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {loadingHistory ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64"
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                      <p className="text-gray-500">
                        Chargement de l'historique...
                      </p>
                    </motion.div>
                  ) : historyRecords.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {historySearch ? (
                        <>
                          <p className="text-gray-500 mb-1">
                            Aucun historique trouvé pour
                          </p>
                          <p className="font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                            {historySearch}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-500 mb-2">
                            Entrez un numéro de série
                          </p>
                          <p className="text-sm text-gray-400">
                            L'historique des modifications apparaîtra ici
                          </p>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {historyRecords.map((record) => (
                        <motion.div
                          key={record.id}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${
                            record.action === "add"
                              ? "border-green-500"
                              : record.action === "edit"
                              ? "border-blue-500"
                              : "border-red-500"
                          } hover:shadow-md transition-shadow`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 flex items-center">
                                {record.type}
                                <span className="mx-2 text-gray-300">/</span>
                                {record.marque}
                                <span className="mx-2 text-gray-300">/</span>
                                {record.modele}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                  #{record.numero_serie}
                                </p>
                                {record.bureau && (
                                  <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded flex items-center">
                                    <svg
                                      className="w-3 h-3 mr-1 text-gray-500"
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
                                    {record.bureau}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                record.action === "add"
                                  ? "bg-green-100 text-green-800"
                                  : record.action === "edit"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.action === "add"
                                ? "Ajout"
                                : record.action === "edit"
                                ? "Modification"
                                : "Suppression"}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Direction</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.direction !==
                                      record.direction
                                      ? "text-blue-600 bg-blue-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.direction || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.direction && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.direction}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <p className="text-gray-500">Type</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.type !==
                                      record.type
                                      ? "text-purple-600 bg-purple-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.type || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.type && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.type}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <p className="text-gray-500">Marque</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.marque !==
                                      record.marque
                                      ? "text-orange-600 bg-orange-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.marque || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.marque && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.marque}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <p className="text-gray-500">Modèle</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.modele !==
                                      record.modele
                                      ? "text-pink-600 bg-pink-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.modele || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.modele && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.modele}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <p className="text-gray-500">Statut</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.statut !==
                                      record.statut
                                      ? "text-blue-600 bg-blue-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.statut || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.statut && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.statut}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <p className="text-gray-500">Bureau</p>
                                <p
                                  className={`font-medium ${
                                    record.action === "edit" &&
                                    record.details?.previousData?.bureau !==
                                      record.bureau
                                      ? "text-blue-600 bg-blue-50 px-2 py-1 rounded"
                                      : ""
                                  }`}
                                >
                                  {record.bureau || "Non spécifié"}
                                </p>
                                {record.action === "edit" &&
                                  record.details?.previousData?.bureau && (
                                    <p className="text-xs text-gray-400 line-through">
                                      {record.details.previousData.bureau}
                                    </p>
                                  )}
                              </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                              <div className="text-xs text-gray-400 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {record.user || "Utilisateur inconnu"}
                              </div>

                              <div className="text-xs text-gray-500">
                                {record.timestamp?.toLocaleString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }) || "Date inconnue"}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-xs text-gray-500">
                  {historyRecords.length > 0 && (
                    <p>{historyRecords.length} entrées trouvées</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentTable;
