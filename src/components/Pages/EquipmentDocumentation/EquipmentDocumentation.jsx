import React, { useState, useEffect } from "react";
import { useParams,} from "react-router-dom"; // Ajout de useParams et Link
import {
  FaMicrochip,
  FaDesktop,
  FaPrint,
  FaServer,
  FaMobileAlt,
  FaNetworkWired,
} from "react-icons/fa";
import equipmentData from "./equipmentData"; // Import des données

const EquipmentDocumentation = () => {
  const { equipmentId } = useParams(); // Récupérer l'ID de l'équipement depuis l'URL
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Filtrer les équipements par catégorie et marque
  const filteredEquipment = equipmentData.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    return matchesCategory && matchesBrand;
  });

  // Afficher la fiche technique d'un équipement
  const handleEquipmentClick = (equipment) => {
    setSelectedEquipment(equipment);
  };

  // Retour à la liste des équipements
  const handleBackToList = () => {
    setSelectedEquipment(null);
  };

  // Liste des catégories et marques uniques
  const categories = [...new Set(equipmentData.map((item) => item.category))];
  const brands = [...new Set(equipmentData.map((item) => item.brand))];

  // Icônes pour les catégories
  const categoryIcons = {
    Imprimante: <FaPrint className="text-blue-500" />,
    Scanner: <FaDesktop className="text-green-500" />,
    "PC Mini": <FaMicrochip className="text-purple-500" />,
    "Unité Centrale": <FaServer className="text-red-500" />,
    Écran: <FaDesktop className="text-yellow-500" />,
    "Imprimante Mobile": <FaMobileAlt className="text-pink-500" />,
    "Switch KVM": <FaNetworkWired className="text-indigo-500" />,
  };

  // Si un equipmentId est présent dans l'URL, afficher directement les détails de l'équipement
  useEffect(() => {
    if (equipmentId) {
      const equipment = equipmentData.find((item) => item.id === equipmentId);
      setSelectedEquipment(equipment);
    }
  }, [equipmentId]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Documentation des Équipements
      </h1>

      {!selectedEquipment ? (
        <>
          {/* Filtrage par catégorie et marque */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* Boutons de catégorie */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === ""
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Tous
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu déroulant pour les marques */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les marques</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
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
              </div>
            </div>
          </div>

          {/* Liste des équipements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((equipment) => (
              <div
                key={equipment.id}
                onClick={() => handleEquipmentClick(equipment)}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={equipment.image}
                  alt={equipment.model}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold">
                  {equipment.brand} {equipment.model}
                </h2>
                <p className="text-gray-600">{equipment.category}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Fiche technique de l'équipement */
        <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
          <button
            onClick={handleBackToList}
            className="mb-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out"
          >
            &larr; Retour à la liste
          </button>

          {/* Conteneur pour l'image */}
          <div className="w-full h-80 flex items-center justify-center overflow-hidden rounded-md mb-6">
            <img
              src={selectedEquipment.image}
              alt={selectedEquipment.model}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold mb-4">
            {selectedEquipment.brand} {selectedEquipment.model}
          </h2>
          <div className="space-y-4">
            {/* Catégorie */}
            <div className="flex items-center space-x-2">
              {categoryIcons[selectedEquipment.category]}
              <p className="text-lg font-semibold">
                {selectedEquipment.category}
              </p>
            </div>

            {/* Spécifications */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(selectedEquipment.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-gray-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className="text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {/* Fiche Technique */}
            <h3 className="text-xl font-semibold mt-6">Fiche Technique</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(selectedEquipment.ficheTechnique).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </p>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDocumentation;
