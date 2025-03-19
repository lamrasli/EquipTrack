import React, { useCallback, useState } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { equipmentModels } from "./EquipmentForm"; // Importez equipmentModels
import * as XLSX from "xlsx"; // Importer la bibliothèque xlsx

const EquipmentTable = ({ equipmentList, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    marque: "",
    modele: "",
    numero_serie: "", // Ajout du filtre par numéro de série
    bureau: "", // Ajout du filtre par bureau
  });
  const [dateFilter, setDateFilter] = useState("");
  const [dateSort, setDateSort] = useState(""); // Nouveau state pour le tri par date
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 10; // Nombre d'équipements par page

  // Fonction pour exporter les données en Excel
  const exportToExcel = () => {
    const data = equipmentList.map((equipment) => ({
      Type: equipment.type,
      Marque: equipment.marque,
      Modèle: equipment.modele,
      "Numéro de Série": equipment.numero_serie,
      Bureau: equipment.bureau,
      Statut: equipment.statut,
      Date: new Date(equipment.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Équipements");
    XLSX.writeFile(workbook, "equipements.xlsx");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const upperCaseValue =
      name === "numero_serie" ? value.toUpperCase() : value;

    setFilters({ ...filters, [name]: upperCaseValue });

    if (name === "type") {
      setFilters((prev) => ({
        ...prev,
        marque: "",
        modele: "",
      }));
    }

    if (name === "marque") {
      setFilters((prev) => ({
        ...prev,
        modele: "",
      }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      type: "",
      marque: "",
      modele: "",
      numero_serie: "",
      bureau: "", // Réinitialiser le filtre par bureau
    });
    setDateFilter("");
    setDateSort(""); // Réinitialiser le tri par date
    setCurrentPage(1); // Réinitialiser la pagination
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleDateSortChange = (e) => {
    setDateSort(e.target.value);
  };

  const filteredEquipmentList = equipmentList.filter((equipment) => {
    return (
      (filters.status === "" || equipment.statut === filters.status) &&
      (filters.type === "" || equipment.type === filters.type) &&
      (filters.marque === "" || equipment.marque === filters.marque) &&
      (filters.modele === "" || equipment.modele === filters.modele) &&
      (filters.numero_serie === "" ||
        equipment.numero_serie.includes(filters.numero_serie)) &&
      (filters.bureau === "" || equipment.bureau.includes(filters.bureau)) && // Filtre par bureau
      (dateFilter === "" ||
        new Date(equipment.date).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString())
    );
  });

  // Trier par date si un filtre de date est appliqué
  const sortedEquipmentList = [...filteredEquipmentList].sort((a, b) => {
    if (dateSort === "recent") {
      return new Date(b.date) - new Date(a.date); // Plus récent en premier
    } else if (dateSort === "oldest") {
      return new Date(a.date) - new Date(b.date); // Plus ancien en premier
    }
    return 0; // Pas de tri
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEquipmentList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedEquipmentList.length / itemsPerPage);

  // Fonction pour générer les boutons de pagination
  const renderPaginationButtons = () => {
    const buttons = [];

    // Bouton "Précédent"
    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
    );

    // Boutons de pagination
    if (totalPages <= 5) {
      // Afficher tous les boutons si le nombre total de pages est petit
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
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
    } else {
      // Afficher les premiers boutons, des points de suspension, et les derniers boutons
      if (currentPage <= 3) {
        // Afficher les 3 premiers boutons et "..."
        for (let i = 1; i <= 3; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
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
        buttons.push(
          <span key="dots1" className="px-4 py-2">
            …
          </span>
        );
        buttons.push(
          <button
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
          >
            {totalPages}
          </button>
        );
      } else if (currentPage >= totalPages - 2) {
        // Afficher le premier bouton, "...", et les 3 derniers boutons
        buttons.push(
          <button
            key={1}
            onClick={() => setCurrentPage(1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
          >
            1
          </button>
        );
        buttons.push(
          <span key="dots2" className="px-4 py-2">
            …
          </span>
        );
        for (let i = totalPages - 2; i <= totalPages; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
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
      } else {
        // Afficher le premier bouton, "...", les boutons autour de la page actuelle, "...", et le dernier bouton
        buttons.push(
          <button
            key={1}
            onClick={() => setCurrentPage(1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
          >
            1
          </button>
        );
        buttons.push(
          <span key="dots3" className="px-4 py-2">
            …
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
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
        buttons.push(
          <span key="dots4" className="px-4 py-2">
            …
          </span>
        );
        buttons.push(
          <button
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
          >
            {totalPages}
          </button>
        );
      }
    }

    // Bouton "Suivant"
    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    );

    return buttons;
  };
  const handleEditClick = useCallback(
    (equipment) => {
      return () => {
        onEdit(equipment);
      };
    },
    [onEdit]
  );

  const handleDeleteClick = useCallback(
    (id) => {
      return () => {
        onDelete(id);
      };
    },
    [onDelete]
  );

  const getModelOptions = () => {
    if (filters.type && filters.marque) {
      return equipmentModels[filters.type][filters.marque] || [];
    }
    return [];
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Filtres au-dessus du tableau */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-4 bg-gray-100 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Filtre par Type */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Type :</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">Tous</option>
              {Object.keys(equipmentModels).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par Marque */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Marque :
            </label>
            <select
              name="marque"
              value={filters.marque}
              onChange={handleFilterChange}
              disabled={!filters.type} // Désactiver si aucun type n'est sélectionné
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">Tous</option>
              {filters.type &&
                Object.keys(equipmentModels[filters.type]).map((marque) => (
                  <option key={marque} value={marque}>
                    {marque}
                  </option>
                ))}
            </select>
          </div>

          {/* Filtre par Modèle */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Modèle :
            </label>
            <select
              name="modele"
              value={filters.modele}
              onChange={handleFilterChange}
              disabled={!filters.marque} // Désactiver si aucune marque n'est sélectionnée
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">Tous</option>
              {getModelOptions().map((model, index) => (
                <option key={index} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          {/* Filtre par Date spécifique */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Date :</label>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>

          {/* Boutons de Réinitialisation et d'Exportation */}
          <div className="flex items-end space-x-4">
            <button
              onClick={handleResetFilters}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
            >
              Réinitialiser
            </button>
            <button
              onClick={exportToExcel}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
            >
              Exporter en Excel
            </button>
          </div>
        </div>
      </motion.div>
      {/* Conteneur principal pour les filtres à gauche et le tableau */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Filtres à gauche */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full md:w-1/4 p-4 bg-gray-100 rounded-lg shadow-md"
          style={{ height: "fit-content" }}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Statut :
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">Tous</option>
                <option value="Fonctionnel">Fonctionnel</option>
                <option value="Réformé en bureau">Réformé en bureau</option>
                <option value="Réformé en stock">Réformé en stock</option>
              </select>
            </div>

            {/* Ajout du filtre par numéro de série */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Numéro de série :
              </label>
              <input
                type="text"
                name="numero_serie"
                value={filters.numero_serie}
                onChange={handleFilterChange}
                placeholder="Entrez le numéro de série"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
            {/* Filtre par Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Trier par date :
              </label>
              <select
                name="dateSort"
                value={dateSort}
                onChange={handleDateSortChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">Choisir une option</option>
                <option value="recent">Plus récent</option>
                <option value="oldest">Plus ancien</option>
              </select>
            </div>
            {/* Filtre par Bureau */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bureau :
              </label>
              <input
                type="text"
                name="bureau"
                value={filters.bureau}
                onChange={handleFilterChange}
                placeholder="Entrez le bureau"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Tableau */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex-1 overflow-x-auto rounded-lg shadow-lg"
        >
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-b from-gray-500 to-gray-900">
              <tr className="uppercase text-sm leading-normal">
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Type
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Marque
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Modèle
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Nº de Série
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold w-24">
                  Bureau
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold w-64">
                  Statut
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Date
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <AnimatePresence>
                {currentItems.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="8" className="py-6 text-center text-gray-500">
                      Aucun équipement ne correspond aux filtres sélectionnés.
                    </td>
                  </motion.tr>
                ) : (
                  currentItems.map((equipment, index) => {
                    const rowColorClass =
                      equipment.statut === "Réformé en bureau"
                        ? "bg-red-50 hover:bg-red-100"
                        : equipment.statut === "Réformé en stock"
                        ? "bg-orange-50 hover:bg-orange-100"
                        : "bg-green-50 hover:bg-green-100";

                    return (
                      <motion.tr
                        key={equipment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        className={`border-b border-gray-200   transition-all duration-200 ${rowColorClass}`}
                      >
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {equipment.type}
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {equipment.marque}
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {equipment.modele}
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {equipment.numero_serie}
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {equipment.bureau}
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              equipment.statut === "Réformé en bureau"
                                ? "bg-red-200 text-red-800"
                                : equipment.statut === "Réformé en stock"
                                ? "bg-orange-200 text-orange-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {equipment.statut}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-medium uppercase">
                          {new Date(equipment.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center mt-4 flex justify-center space-x-3">
                          <MdEdit
                            className="cursor-pointer hover:scale-125 transition duration-300 transform"
                            onClick={handleEditClick(equipment)}
                            size={24}
                            color="#3674B5"
                          />
                          <MdDeleteForever
                            className="cursor-pointer hover:scale-125 transition duration-300 transform"
                            size={24}
                            color="#D84040"
                            onClick={handleDeleteClick(equipment.id)}
                          />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2">{renderPaginationButtons()}</div>
      </div>
    </div>
  );
};

export default EquipmentTable;
