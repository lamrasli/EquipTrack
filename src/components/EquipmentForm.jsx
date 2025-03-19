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

const EquipmentForm = ({ onAdd, onEdit, editEquipment, equipmentList }) => {
  const [formData, setFormData] = useState({
    type: "",
    marque: "",
    modele: "",
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
    const regex = /^[A-Z0-9]*$/; // Seules les majuscules et les chiffres sont autorisés
    return regex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero_serie") {
      // Convertir en majuscules et valider
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
      type: value,
      marque: "",
      modele: "",
      numero_serie: "",
      bureau: "",
      statut: "",
      date: "",
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

    // Vérifier si le numéro de série est valide
    if (!validateSerialNumber(formData.numero_serie)) {
      setSerialError("Seules les majuscules et les chiffres sont autorisés.");
      return;
    }

    // Vérifier si le numéro de série existe déjà
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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="bg-white mt-6 mb-6 p-8 rounded-lg shadow-xl border border-gray-200"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-2xl font-bold text-gray-800 text-center uppercase p-4 rounded-lg bg-gradient-to-b from-gray-500 to-gray-800 text-white shadow-md mb-6"
      >
        {editEquipment ? "Modifier un Équipement" : "Ajouter un Équipement"}
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="">Sélectionner un type</option>
            {Object.keys(equipmentModels).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Marque
          </label>
          <select
            name="marque"
            value={formData.marque}
            onChange={handleMarqueChange}
            required
            disabled={!formData.type}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="">Sélectionner une marque</option>
            {formData.type &&
              Object.keys(equipmentModels[formData.type]).map((marque) => (
                <option key={marque} value={marque}>
                  {marque}
                </option>
              ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Modèle
          </label>
          <select
            name="modele"
            value={formData.modele}
            onChange={handleChange}
            required
            disabled={!formData.marque}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="">Sélectionner un modèle</option>
            {formData.marque &&
              equipmentModels[formData.type][formData.marque].map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Numéro de série
          </label>
          <input
            name="numero_serie"
            value={formData.numero_serie}
            onChange={handleChange}
            placeholder="Numéro de série"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Bureau
          </label>
          <input
            name="bureau"
            value={formData.bureau}
            onChange={handleChange}
            placeholder="Bureau"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="">Sélectionner un statut</option>
            <option value="Fonctionnel">Fonctionnel</option>
            <option value="Réformé en bureau">Réformé en bureau</option>
            <option value="Réformé en stock">Réformé en stock</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
        className="flex justify-center mt-8"
      >
        <button
          type="submit"
          className="bg-gradient-to-b from-gray-500 to-gray-800 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          {editEquipment ? "Modifier" : "Ajouter"}
        </button>
      </motion.div>
    </motion.form>
  );
};

export default EquipmentForm;