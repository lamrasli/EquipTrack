import React, { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";
import { MdOutlineAdfScanner } from "react-icons/md";
import { GrServer } from "react-icons/gr";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import equipmentData from "./equipmentData";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EquipmentDocumentation = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  // Charger les disponibilités depuis Firestore
  useEffect(() => {
    const loadAvailability = async () => {
      const availabilityMap = {};
      try {
        for (const equipment of equipmentData) {
          if (
            typeof equipment.id !== "string" &&
            typeof equipment.id !== "number"
          ) {
            console.error("Invalid equipment ID:", equipment.id);
            continue;
          }

          const docRef = doc(
            db,
            "equipmentAvailability",
            equipment.id.toString()
          );
          const docSnap = await getDoc(docRef);
          availabilityMap[equipment.id] = docSnap.exists()
            ? docSnap.data().available
            : true;
        }
        setAvailability(availabilityMap);
      } catch (error) {
        console.error("Error loading availability:", error);
        const defaultAvailability = {};
        equipmentData.forEach((equipment) => {
          defaultAvailability[equipment.id] = true;
        });
        setAvailability(defaultAvailability);
        toast.error("Erreur de chargement des disponibilités");
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  // Initialiser les équipements avec disponibilité
  useEffect(() => {
    if (!loading) {
      setEquipments(
        equipmentData.map((item) => ({
          ...item,
          specs: {
            ...item.specs,
            statut: availability[item.id] ? "Disponible" : "Indisponible",
          },
        }))
      );
    }
  }, [loading, availability]);

  // Basculer la disponibilité
  const toggleAvailability = async (equipmentId, e) => {
    if (e) e.stopPropagation();

    if (updatingIds.has(equipmentId)) return;

    try {
      setUpdatingIds((prev) => new Set(prev).add(equipmentId));
      const newAvailability = !availability[equipmentId];

      await setDoc(
        doc(db, "equipmentAvailability", equipmentId.toString()),
        {
          equipmentId: equipmentId.toString(),
          available: newAvailability,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      setAvailability((prev) => ({
        ...prev,
        [equipmentId]: newAvailability,
      }));

      toast.success(
        `Équipement marqué comme ${
          newAvailability ? "disponible" : "indisponible"
        }`,
        { autoClose: 2000 }
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(equipmentId);
        return newSet;
      });
    }
  };

  // Composant Switch amélioré
  const AvailabilitySwitch = ({ equipment }) => {
    const isAvailable = availability[equipment.id] ?? true;
    const isUpdating = updatingIds.has(equipment.id);

    return (
      <div className="flex items-center">
        <button
          type="button"
          className={`${
            isAvailable ? "bg-green-500" : "bg-red-500"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isUpdating ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={(e) => toggleAvailability(equipment.id, e)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaSpinner className="animate-spin text-white text-xs" />
            </div>
          ) : (
            <span
              className={`${
                isAvailable ? "translate-x-1" : "translate-x-6"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          )}
        </button>
        <span
          className={`ml-2 text-sm font-medium ${
            isAvailable ? "text-green-600" : "text-red-600"
          }`}
        >
          {isAvailable ? "Disponible" : "Indisponible"}
        </span>
      </div>
    );
  };

  // Filtrage des équipements
  const filteredEquipment = equipments.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    const matchesAvailability =
      availabilityFilter === "all"
        ? true
        : availabilityFilter === "available"
        ? availability[item.id]
        : !availability[item.id];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                {/* Filtre Catégorie */}
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
                  {/* Filtre Marque */}
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

                  {/* Filtre Disponibilité */}
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
              </div>
            </div>

            {/* Liste des équipements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((equipment) => {
                const isAvailable = availability[equipment.id] ?? true;
                return (
                  <div
                    key={equipment.id}
                    onClick={() => handleEquipmentClick(equipment)}
                    className="relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] group border border-gray-100"
                    style={{
                      boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    {/* Conteneur image */}
                    <div className="relative h-48 overflow-hidden">
                      {/* Image avec effet */}
                      <img
                        src={equipment.image}
                        alt={equipment.model}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 ${
                          !isAvailable
                            ? "grayscale-[30%] contrast-90 brightness-90"
                            : ""
                        }`}
                      />

                      {/* Grande croix rouge pour indisponible - Position centrale */}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-16 h-16">
                            {/* Croix rouge épaisse avec ombre */}
                            <div
                              className="absolute w-full h-2 bg-red-600 rounded-full transform rotate-45 shadow-md"
                              style={{
                                top: "50%",
                                marginTop: "-1px",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                              }}
                            ></div>
                            <div
                              className="absolute w-full h-2 bg-red-600 rounded-full transform -rotate-45 shadow-md"
                              style={{
                                top: "50%",
                                marginTop: "-1px",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Bandeau de catégorie */}
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                          isAvailable
                            ? "bg-blue-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {equipment.category}
                      </div>
                    </div>

                    {/* Contenu texte */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {equipment.brand} {equipment.model}
                      </h3>

                      {/* Statut avec icône */}
                      <div
                        className={`flex items-center text-sm mb-4 ${
                          isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isAvailable ? (
                          <FaCheckCircle className="mr-2" />
                        ) : (
                          <FaTimesCircle className="mr-2" />
                        )}
                        {isAvailable ? "Disponible" : "Indisponible"}
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex justify-between items-center">
                        <AvailabilitySwitch equipment={equipment} />

                        <button
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipmentClick(equipment);
                          }}
                        >
                          Détails
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Fiche technique détaillée */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
            <div className="relative">
              {/* Banner Image */}
              <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden relative">
                <img
                  src={selectedEquipment.image}
                  alt={selectedEquipment.model}
                  className={`w-full h-full object-cover ${
                    !availability[selectedEquipment.id]
                      ? "opacity-50"
                      : "opacity-70"
                  }`}
                />

                {/* Red diagonal bars for unavailable */}
                {!availability[selectedEquipment.id] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-full h-2 bg-red-600 transform rotate-45 origin-center opacity-90"></div>
                    <div className="absolute w-full h-2 bg-red-600 transform -rotate-45 origin-center opacity-90"></div>
                  </div>
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={handleBackToList}
                className="absolute top-4 left-4 px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition-all duration-200 ease-in-out flex items-center gap-2 shadow-md"
              >
                <FaArrowLeft />
                Retour
              </button>

              {/* Sheet Header */}
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

            {/* Indisponible Alert */}
            {!availability[selectedEquipment.id] && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <FaTimesCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Cet équipement est actuellement indisponible
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Main Specifications */}
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

              {/* Full Technical Sheet */}
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

              {/* Status Toggle */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Gestion de disponibilité
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      Statut actuel:{" "}
                      <span
                        className={`font-medium ${
                          availability[selectedEquipment.id]
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {availability[selectedEquipment.id]
                          ? "Disponible"
                          : "Indisponible"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliquez sur le switch pour changer le statut
                    </p>
                  </div>
                  <AvailabilitySwitch equipment={selectedEquipment} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDocumentation;
