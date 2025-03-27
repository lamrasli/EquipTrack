import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const equipmentModels = {
  Imprimante: {
    HP: [
      "Color LaserJet Pro M452",
      "LaserJet Pro M426",
      "LaserJet Pro M402dn",
      "LaserJet Pro MFP 4102fdw",
      "LaserJet Enterprise M406dn",
      "LaserJet Pro M428fdn",
    ],
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
    HP: ["Scanjet Pro 2000 s2", "Scanjet Pro 2500 f1"],
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
export const directions = [
  "DRH",
  "DAFG",
  "DSI",
  "DCOM",
  "DQ",
  "DAJ",
  "DSE",
  "DDE",
  "DAC",
  "DP",
];

const EquipmentForm = ({ onAdd, onEdit, editEquipment, equipmentList }) => {
  const [formData, setFormData] = useState({
    type: "",
    marque: "",
    modele: "",
    direction: "",
    numero_serie: "",
    bureau: "",
    statut: "",
    date: "",
  });
  const [serialError, setSerialError] = useState("");

  useEffect(() => {
    if (editEquipment) {
      setFormData({ ...editEquipment });
    } else {
      setFormData({
        direction: "",
        type: "",
        marque: "",
        modele: "",
        numero_serie: "",
        bureau: "",
        statut: "",
        date: "",
      });
    }
    setSerialError("");
  }, [editEquipment]);

  // Fonction pour valider le numéro de série
  const validateSerialNumber = (value) => {
    const regex = /^[A-Z0-9]*$/;
    return regex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero_serie") {
      const upperCaseValue = value.toUpperCase();
      if (!validateSerialNumber(upperCaseValue)) {
        setSerialError("Seules les majuscules et les chiffres sont autorisés.");
      } else {
        setSerialError("");
      }
      setFormData({ ...formData, [name]: upperCaseValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      type: value,
      marque: "",
      modele: "",
    });
    setSerialError("");
  };

  const handleMarqueChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, marque: value, modele: "" });
    setSerialError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données soumises:", formData);
    if (!validateSerialNumber(formData.numero_serie)) {
      setSerialError("Seules les majuscules et les chiffres sont autorisés.");
      return;
    }

    const isDuplicate = equipmentList.some(
      (item) =>
        item.numero_serie === formData.numero_serie &&
        item.numero_serie !==
          (editEquipment ? editEquipment.numero_serie : null)
    );

    if (isDuplicate) {
      setSerialError("Ce numéro de série existe déjà.");
      return;
    }

    if (editEquipment) {
      onEdit(formData);
    } else {
      onAdd(formData);
    }
    setFormData({
      direction: "",
      type: "",
      marque: "",
      modele: "",
      numero_serie: "",
      bureau: "",
      statut: "",
      date: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        {/* En-tête du formulaire */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">
            {editEquipment ? "Modifier un Équipement" : "Ajouter un Équipement"}
          </h2>
        </div>

        {/* Corps du formulaire - Structure conservée mais style amélioré */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Direction */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Direction <span className="text-red-500">*</span>
              </label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Sélectionner une direction</option>
                {directions.map((direction) => (
                  <option key={direction} value={direction}>
                    {direction}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Sélectionner un type</option>
                {Object.keys(equipmentModels).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Marque */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Marque <span className="text-red-500">*</span>
              </label>
              <select
                name="marque"
                value={formData.marque}
                onChange={handleMarqueChange}
                required
                disabled={!formData.type}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  !formData.type ? "bg-gray-100" : ""
                }`}
              >
                <option value="">Sélectionner une marque</option>
                {formData.type &&
                  Object.keys(equipmentModels[formData.type]).map((marque) => (
                    <option key={marque} value={marque}>
                      {marque}
                    </option>
                  ))}
              </select>
            </div>

            {/* Modèle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Modèle <span className="text-red-500">*</span>
              </label>
              <select
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                required
                disabled={!formData.marque}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  !formData.marque ? "bg-gray-100" : ""
                }`}
              >
                <option value="">Sélectionner un modèle</option>
                {formData.marque &&
                  equipmentModels[formData.type][formData.marque].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
              </select>
            </div>

            {/* Numéro de série */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Numéro de série <span className="text-red-500">*</span>
              </label>
              <input
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                placeholder="Ex: ABC123456"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <AnimatePresence>
                {serialError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm"
                  >
                    {serialError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Bureau */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bureau <span className="text-red-500">*</span>
              </label>
              <input
                name="bureau"
                value={formData.bureau}
                onChange={handleChange}
                placeholder="Ex: Bureau 205, Bâtiment A"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Sélectionner un statut</option>
                <option value="Fonctionnel">Fonctionnel</option>
                <option value="Réformé en bureau">Réformé en bureau</option>
                <option value="Réformé en stock">Réformé en stock</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {editEquipment ? "Modifier l'équipement" : "Ajouter l'équipement"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EquipmentForm;