import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  FaMicrochip,
  FaDesktop,
  FaPrint,
  FaMobileAlt,
  FaNetworkWired,
  FaArrowLeft,
  FaFilter,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineAdfScanner } from "react-icons/md";
import { GrServer } from "react-icons/gr";
import equipmentData from "./equipmentData";
const EquipmentDocumentation = () => {
  const { equipmentId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // Nouvel état
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipments, setEquipments] = useState(
    equipmentData.map((item) => ({
      ...item,
      specs: {
        ...item.specs,
        statut: item.specs.statut || "Disponible",
      },
    }))
  );

  // Fonction pour charger le statut depuis Firebase - CORRIGÉE
  const loadEquipmentStatus = async (equipmentId) => {
    try {
      // Assurez-vous que equipmentId est une chaîne de caractères
      const idString = String(equipmentId);
      const docRef = doc(db, "equipments", idString);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().statut || "Disponible"; // Retourne "Disponible" par défaut si non défini
      }
      return "Disponible"; // Retourne "Disponible" par défaut si le document n'existe pas
    } catch (error) {
      console.error("Erreur lors du chargement du statut:", error);
      return "Disponible"; // Retourne "Disponible" en cas d'erreur
    }
  };

  // Fonction pour sauvegarder le statut dans Firebase - CORRIGÉE
  const saveEquipmentStatus = async (equipmentId, statut) => {
    try {
      // Assurez-vous que equipmentId est une chaîne de caractères
      const idString = String(equipmentId);
      await setDoc(doc(db, "equipments", idString), {
        statut,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du statut:", error);
    }
  };
  // Fonction pour basculer le statut
  const toggleAvailability = async (equipmentId, e) => {
    if (e) e.stopPropagation();

    setEquipments((prevEquipments) =>
      prevEquipments.map((item) => {
        if (item.id === equipmentId) {
          const newStatut =
            item.specs.statut === "Disponible" ? "Indisponible" : "Disponible";

          // Sauvegarder le nouveau statut dans Firebase
          saveEquipmentStatus(equipmentId, newStatut);

          return {
            ...item,
            specs: {
              ...item.specs,
              statut: newStatut,
            },
          };
        }
        return item;
      })
    );
  };
  const filteredEquipment = equipments.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    // Filtre par disponibilité
    const matchesAvailability =
      availabilityFilter === "all"
        ? true
        : availabilityFilter === "available"
        ? item.specs.statut === "Disponible"
        : item.specs.statut === "Indisponible";

    return matchesCategory && matchesBrand && matchesAvailability;
  });
  const handleEquipmentClick = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleBackToList = () => {
    setSelectedEquipment(null);
  };

  const categories = [...new Set(equipments.map((item) => item.category))];
  const brands = [...new Set(equipments.map((item) => item.brand))];

  const categoryIcons = {
    Imprimante: <FaPrint className="text-blue-500 text-xl" />,
    Scanner: <MdOutlineAdfScanner className="text-green-500 text-2xl" />,
    "PC Mini": <FaMicrochip className="text-purple-500 text-xl" />,
    "Unité Centrale": <GrServer className="text-red-500 text-xl" />,
    Écran: <FaDesktop className="text-yellow-500 text-xl" />,
    "Imprimante Mobile": <FaMobileAlt className="text-pink-500 text-xl" />,
    "Switch KVM": <FaNetworkWired className="text-indigo-500 text-xl" />,
  };

  // Charger les statuts depuis Firebase au montage du composant
  useEffect(() => {
    const loadAllStatuses = async () => {
      const updatedEquipments = await Promise.all(
        equipments.map(async (equipment) => {
          const firebaseStatus = await loadEquipmentStatus(equipment.id);
          return {
            ...equipment,
            specs: {
              ...equipment.specs,
              statut: firebaseStatus || equipment.specs.statut,
            },
          };
        })
      );
      setEquipments(updatedEquipments);
    };

    loadAllStatuses();
  }, [equipments]);

  useEffect(() => {
    if (equipmentId) {
      const equipment = equipments.find((item) => item.id === equipmentId);
      setSelectedEquipment(equipment);
    }
  }, [equipmentId, equipments]);


  // Composant Switch
  const AvailabilitySwitch = ({ equipment }) => {
    const isAvailable = equipment.specs.statut === "Disponible";

    return (
      <div className="flex items-center">
        <button
          type="button"
          className={`${
            isAvailable ? "bg-green-500" : "bg-red-500"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          onClick={(e) => toggleAvailability(equipment.id, e)}
        >
          <span
            className={`${
              isAvailable ? "translate-x-1" : "translate-x-6"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
        <span
          className={`ml-2 text-sm font-medium ${
            isAvailable ? "text-green-600" : "text-red-600"
          }`}
        >
          {equipment.specs.statut}
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Documentation des Équipements
          <span className="block text-lg font-normal text-blue-600 mt-2">
            Gestion technique et fiches détaillées
          </span>
        </h1>

        {!selectedEquipment ? (
          <>
            {/* Filtres améliorés */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Filtrer les équipements
              </h3>

              <div className="space-y-4">
                {/* Filtre par catégorie */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Catégorie
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${
                        selectedCategory === ""
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Toutes
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {categoryIcons[category]}
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtre par marque */}
                  <div>
                    <label
                      htmlFor="brand-filter"
                      className="block text-sm font-medium text-gray-500 mb-2"
                    >
                      Marque
                    </label>
                    <div className="relative">
                      <select
                        id="brand-filter"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      >
                        <option value="">Toutes les marques</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
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

                  {/* Filtre par disponibilité */}
                  <div>
                    <label
                      htmlFor="status-filter"
                      className="block text-sm font-medium text-gray-500 mb-2"
                    >
                      Statut
                    </label>
                    <div className="relative">
                      <select
                        id="status-filter"
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="available">Disponible</option>
                        <option value="unavailable">Indisponible</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <FaFilter className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton réinitialiser (optionnel) */}
                {(selectedCategory ||
                  selectedBrand ||
                  availabilityFilter !== "all") && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedBrand("");
                        setAvailabilityFilter("all");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Liste des équipements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  onClick={() => handleEquipmentClick(equipment)}
                  className="group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
                >
                  {/* Indicateur d'indisponibilité */}
                  {equipment.specs.statut === "Indisponible" && (
                    <>
                      <div className="absolute inset-0 bg-black/20 z-0"></div>
                    </>
                  )}

                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={equipment.image}
                      alt={equipment.model}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        equipment.specs.statut === "Indisponible"
                          ? "opacity-70"
                          : ""
                      }`}
                    />

                    {/* Barres rouges diagonales */}
                    {equipment.specs.statut === "Indisponible" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-full h-1.5 bg-red-600 transform rotate-45 origin-center opacity-90"></div>
                        <div className="absolute w-full h-1.5 bg-red-600 transform -rotate-45 origin-center opacity-90"></div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md mb-1">
                          {equipment.category}
                        </span>
                        <h2 className="text-white font-bold text-lg">
                          {equipment.brand} {equipment.model}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${
                          equipment.specs.statut === "Indisponible"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {equipment.specs.statut === "Indisponible" ? (
                          <FaTimesCircle className="inline mr-1" />
                        ) : (
                          <FaCheckCircle className="inline mr-1" />
                        )}
                        {equipment.specs.statut}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <AvailabilitySwitch equipment={equipment} />
                      <button
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipmentClick(equipment);
                        }}
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Fiche technique améliorée */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
            <div className="relative">
              {/* Image en bannière */}
              <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden relative">
                <img
                  src={selectedEquipment.image}
                  alt={selectedEquipment.model}
                  className={`w-full h-full object-cover ${
                    selectedEquipment.specs.statut === "Indisponible"
                      ? "opacity-50"
                      : "opacity-70"
                  }`}
                />

                {/* Barres rouges diagonales pour indisponible */}
                {selectedEquipment.specs.statut === "Indisponible" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-full h-2 bg-red-600 transform rotate-45 origin-center opacity-90"></div>
                    <div className="absolute w-full h-2 bg-red-600 transform -rotate-45 origin-center opacity-90"></div>
                  </div>
                )}
              </div>

              {/* Bouton retour */}
              <button
                onClick={handleBackToList}
                className="absolute top-4 left-4 px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition-all duration-200 ease-in-out flex items-center gap-2 shadow-md"
              >
                <FaArrowLeft />
                Retour
              </button>

              {/* En-tête de la fiche */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-3">
                  {categoryIcons[selectedEquipment.category]}
                  <h2 className="text-3xl font-bold text-white">
                    {selectedEquipment.brand} {selectedEquipment.model}
                  </h2>
                </div>
                <p className="text-white/90 mt-1">
                  {selectedEquipment.category}
                </p>
              </div>
            </div>

            {/* Alerte d'indisponibilité */}
            {selectedEquipment.specs.statut === "Indisponible" && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <FaTimesCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Cet équipement est actuellement indisponible
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Date prévisionnelle de disponibilité:{" "}
                        {selectedEquipment.specs.disponibilite ||
                          "Non spécifiée"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Spécifications principales */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Spécifications Techniques
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(selectedEquipment.specs).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Fiche Technique complète */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Fiche Technique Complète
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(selectedEquipment.ficheTechnique).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h4>
                        <p className="text-gray-800">
                          {Array.isArray(value) ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {value.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            value
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Section supplémentaire pour les documents */}
              {selectedEquipment.documents && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Documents Associés
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedEquipment.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-blue-600 font-medium"
                      >
                        <span>{doc.type}</span>
                        <span className="text-xs text-gray-500">(PDF)</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDocumentation;
