import React, { useCallback, useState } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion"; // Importez AnimatePresence pour les animations de sortie

const equipmentModels = {
  Imprimante: {
    HP: ["LaserJet Pro 452", "LaserJet Pro 426", "DeskJet 2700"],
    Canon: ["PIXMA TS8320", "imageCLASS LBP6030"],
    Epson: ["EcoTank ET-2720", "Expression Home XP-4100"],
  },
  "PC Mini": {
    Dell: ["XPS 13", "Inspiron 15", "Alienware m15"],
    HP: ["Pavilion x360", "EliteBook 840"],
    Lenovo: ["ThinkPad X1 Carbon", "IdeaPad 3"],
  },
  Écran: {
    LG: ["27UK850-W", "24MP88HV-S"],
    Dell: ["P2419H", "U2718Q"],
    Samsung: ["S27R750Q", "CJ791"],
  },
  Scanner: {
    Canon: ["imageFORMULA R40", "LiDE 300"],
    Fujitsu: ["ScanSnap iX1500", "ScanSnap S1300i"],
    Epson: ["WorkForce ES-50", "DS-320"],
  },
  "Unité Centrale": {
    HP: ["Pavilion Gaming Desktop", "Omen Obelisk"],
    Dell: ["XPS Desktop", "Inspiron Desktop"],
  },
  "Imprimante Mobile": {
    HP: ["Sprocket Select", "Sprocket Studio"],
    Canon: ["Selphy CP1300", "Selphy Square QX10"],
  },
};

const EquipmentTable = ({ equipmentList, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    marque: "",
    modele: "",
    numero_serie: "",
    bureau: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      type: "",
      marque: "",
      modele: "",
      numero_serie: "",
      bureau: "",
    });
  };

  const filteredEquipmentList = equipmentList.filter((equipment) => {
    return (
      (filters.status === "" || equipment.statut === filters.status) &&
      (filters.type === "" || equipment.type === filters.type) &&
      (filters.marque === "" || equipment.marque === filters.marque) &&
      (filters.modele === "" || equipment.modele === filters.modele) &&
      (filters.numero_serie === "" ||
        equipment.numero_serie.includes(filters.numero_serie)) &&
      (filters.bureau === "" || equipment.bureau.includes(filters.bureau))
    );
  });

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

  // Récupérer les modèles disponibles en fonction de la marque sélectionnée
  const getModelOptions = () => {
    if (filters.type && filters.marque) {
      return equipmentModels[filters.type][filters.marque] || [];
    }
    return [];
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Filtres en haut (généraux) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-4 bg-gray-100 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par statut */}
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
              <option value="Réformé">Réformé</option>
              <option value="Fonctionnel">Fonctionnel</option>
            </select>
          </div>

          {/* Filtre par type */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Type :</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">Tous</option>
              <option value="Imprimante">Imprimante</option>
              <option value="Scanner">Scanner</option>
              <option value="Unité Centrale">Unité Centrale</option>
              <option value="PC Mini">PC Mini</option>
              <option value="Écran">Écran</option>
              <option value="Imprimante Mobile">Imprimante Mobile</option>
            </select>
          </div>

          {/* Filtre par marque */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Marque :
            </label>
            <select
              name="marque"
              value={filters.marque}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">Tous</option>
              <option value="HP">HP</option>
              <option value="Canon">Canon</option>
              <option value="Epson">Epson</option>
              <option value="Dell">Dell</option>
              <option value="Lenovo">Lenovo</option>
              <option value="LG">LG</option>
              <option value="Samsung">Samsung</option>
              <option value="Fujitsu">Fujitsu</option>
            </select>
          </div>
        </div>

        {/* Boutons Filtrer et Réinitialiser */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleResetFilters}
            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </motion.div>

      {/* Tableau avec filtres à gauche (spécifiques) */}
      <div className="flex space-x-4">
        {/* Filtres à gauche */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-64 p-4 bg-gray-100 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Filtres Spécifiques</h3>
          <div className="space-y-4">
            {/* Filtre par modèle */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Modèle :
              </label>
              <select
                name="modele"
                value={filters.modele}
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                disabled={!filters.type || !filters.marque} // Désactiver si le type ou la marque n'est pas sélectionné
              >
                <option value="">Tous</option>
                {getModelOptions().map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par numéro de série */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Numéro de Série :
              </label>
              <input
                name="numero_serie"
                type="text"
                value={filters.numero_serie}
                onChange={handleFilterChange}
                placeholder="Numéro de série"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>

            {/* Filtre par bureau */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bureau :
              </label>
              <input
                name="bureau"
                type="text"
                value={filters.bureau}
                onChange={handleFilterChange}
                placeholder="Bureau"
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
                  Numéro de Série
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Bureau
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Statut
                </th>
                <th className="py-4 px-6 text-center text-white font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <AnimatePresence>
                {filteredEquipmentList.length === 0 ? (
                  // Afficher un message si aucun équipement ne correspond aux filtres
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="7" className="py-6 text-center text-gray-500">
                      Aucun équipement ne correspond aux filtres sélectionnés.
                    </td>
                  </motion.tr>
                ) : (
                  // Afficher la liste des équipements filtrés
                  filteredEquipmentList.map((equipment, index) => {
                    const rowColorClass =
                      equipment.statut === "Réformé"
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-green-50 hover:bg-green-100";

                    return (
                      <motion.tr
                        key={equipment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                        className={`border-b border-gray-200 transition-all duration-200 ${rowColorClass}`}
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
                              equipment.statut === "Réformé"
                                ? "bg-red-200 text-red-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {equipment.statut}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center flex justify-center space-x-3">
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
                            onClick={handleDeleteClick(equipment.id)} // Pass the ID to onDelete
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
    </div>
  );
};

export default EquipmentTable;