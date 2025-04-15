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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateSerialNumber = (value) => {
    const regex = /^[A-Z0-9]*$/;
    const hasLetters = /[A-Z]/.test(value);
    const hasNumbers = /\d/.test(value);
    return regex.test(value) && hasLetters && hasNumbers;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero_serie") {
      const upperCaseValue = value.toUpperCase();

      if (!/^[A-Z0-9]*$/.test(upperCaseValue)) {
        setSerialError("Seules les majuscules et les chiffres sont autorisés.");
      } else if (!/[A-Z]/.test(upperCaseValue) || !/\d/.test(upperCaseValue)) {
        setSerialError(
          "Le numéro de série doit contenir au moins une lettre et un chiffre."
        );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateSerialNumber(formData.numero_serie)) {
      if (
        !/[A-Z]/.test(formData.numero_serie) ||
        !/\d/.test(formData.numero_serie)
      ) {
        setSerialError(
          "Le numéro de série doit contenir des lettres et des chiffres."
        );
      } else {
        setSerialError("Seules les majuscules et les chiffres sont autorisés.");
      }
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      return;
    }

    try {
      if (editEquipment) {
        await onEdit(formData);
      } else {
        await onAdd(formData);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="py-12 px-4 sm:px-6 lg:px-8  "
    >
      <div className="max-w-6xl mx-auto">

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white bg-opacity-95 rounded-b-xl shadow-lg overflow-hidden border border-gray-200 backdrop-blur-sm"
        >
          {/* En-tête du formulaire */}
          <motion.div
            className="bg-gradient-to-r from-red-700 to-red-900 p-6 text-white relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url('https://previews.123rf.com/images/nete/nete1609/nete160900014/63560280-mosa%C3%AFque-blanche-et-noire-zellige-moroccan-transparente.jpg')",
                backgroundSize: "300px",
                backgroundRepeat: "repeat",
              }}
            ></div>
            <motion.h2
              className="text-2xl font-bold text-center relative z-10"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {editEquipment
                ? "Modifier un Équipement"
                : "Ajouter un Équipement"}
            </motion.h2>
            <motion.p
              className="text-center text-red-100 mt-2 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Veuillez remplir tous les champs obligatoires{" "}
              <span className="text-white">*</span>
            </motion.p>
          </motion.div>

          {/* Corps du formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {/* Direction */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Direction <span className="text-red-600">*</span>
                </label>
                <motion.select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Sélectionner une direction</option>
                  {directions.map((direction, index) => (
                    <motion.option
                      key={direction}
                      value={direction}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {direction}
                    </motion.option>
                  ))}
                </motion.select>
              </motion.div>

              {/* Type */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-600">*</span>
                </label>
                <motion.select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                >
                  <option value="">Sélectionner un type</option>
                  {Object.keys(equipmentModels).map((type, index) => (
                    <motion.option
                      key={type}
                      value={type}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      {type}
                    </motion.option>
                  ))}
                </motion.select>
              </motion.div>

              {/* Marque */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Marque <span className="text-red-600">*</span>
                </label>
                <motion.select
                  name="marque"
                  value={formData.marque}
                  onChange={handleMarqueChange}
                  required
                  disabled={!formData.type}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                    !formData.type ? "bg-gray-100" : "bg-white"
                  }`}
                  whileHover={{ scale: !formData.type ? 1 : 1.01 }}
                >
                  <option value="">Sélectionner une marque</option>
                  {formData.type &&
                    Object.keys(equipmentModels[formData.type]).map(
                      (marque, index) => (
                        <motion.option
                          key={marque}
                          value={marque}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {marque}
                        </motion.option>
                      )
                    )}
                </motion.select>
              </motion.div>

              {/* Modèle */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Modèle <span className="text-red-600">*</span>
                </label>
                <motion.select
                  name="modele"
                  value={formData.modele}
                  onChange={handleChange}
                  required
                  disabled={!formData.marque}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                    !formData.marque ? "bg-gray-100" : "bg-white"
                  }`}
                  whileHover={{ scale: !formData.marque ? 1 : 1.01 }}
                >
                  <option value="">Sélectionner un modèle</option>
                  {formData.marque &&
                    equipmentModels[formData.type][formData.marque].map(
                      (model, index) => (
                        <motion.option
                          key={model}
                          value={model}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                        >
                          {model}
                        </motion.option>
                      )
                    )}
                </motion.select>
              </motion.div>

              {/* Numéro de série */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Numéro de série <span className="text-red-600">*</span>
                </label>
                <motion.input
                  name="numero_serie"
                  value={formData.numero_serie}
                  onChange={handleChange}
                  placeholder="Ex: ABC123456"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.02 }}
                />
                <AnimatePresence>
                  {serialError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-600 text-sm overflow-hidden"
                    >
                      {serialError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bureau */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Bureau <span className="text-red-600">*</span>
                </label>
                <motion.input
                  name="bureau"
                  value={formData.bureau}
                  onChange={handleChange}
                  placeholder="Ex: Bureau 205, Bâtiment A"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Statut */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Statut <span className="text-red-600">*</span>
                </label>
                <motion.select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="Fonctionnel">Fonctionnel</option>
                  <option value="Réformé en bureau">Réformé en bureau</option>
                  <option value="Réformé en stock">Réformé en stock</option>
                </motion.select>
              </motion.div>

              {/* Date */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-600">*</span>
                </label>
                <motion.input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                  whileHover={{ scale: 1.01 }}
                />
              </motion.div>
            </motion.div>

            {/* Bouton de soumission */}
            <motion.div
              className="flex justify-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                type="submit"
                className={`px-8 py-3 rounded-lg transition flex items-center gap-2 text-lg font-medium ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-md"
                }`}
                whileHover={
                  !isSubmitting
                    ? {
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(185, 28, 28, 0.3)",
                      }
                    : {}
                }
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {editEquipment
                      ? "Modifier l'équipement"
                      : "Ajouter l'équipement"}
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EquipmentForm;
