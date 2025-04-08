// 1. Import des dépendances externes
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// 2. Import des composants locaux
import Header from "./components/Header";
import EquipmentForm from "./components/EquipmentForm";
import EquipmentTable from "./components/EquipmentTable";
import Footer from "./components/Footer";
import Container from "./components/Container";
import EquipmentStatistics from "./components/Pages/Dashboard/EquipmentStatistics";
import Accueil from "./components/Pages/Accueil/Accueil";
import EquipmentDocumentation from "./components/Pages/EquipmentDocumentation/EquipmentDocumentation";
import Login from "./components/Pages/Login/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 3. Import des services Firebase
import { db, serverTimestamp, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { addHistoryRecord } from "./historyService";

function MainApp() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [user, setUser] = useState(null); // État pour suivre l'utilisateur connecté
  const location = useLocation(); // Obtenez l'emplacement actuel

  // Vérifier l'état de l'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Equipments (using Firestore Timestamps)
  const fetchEquipments = async () => {
    const querySnapshot = await getDocs(collection(db, "equipments"));
    const equipments = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let dateAdded = null;
      let date = null;

      if (data.dateAdded && data.dateAdded instanceof Timestamp) {
        dateAdded = data.dateAdded.toDate();
      } else {
        dateAdded = new Date("1970-01-01T00:00:00Z");
      }

      if (data.date && data.date instanceof Timestamp) {
        date = data.date.toDate();
      } else if (typeof data.date === "string") {
        date = new Date(data.date);
      }

      return {
        id: doc.id,
        ...data,
        dateAdded: dateAdded,
        date: date,
      };
    });

    equipments.sort((a, b) => b.dateAdded - a.dateAdded);
    setEquipmentList(equipments);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const [editEquipment, setEditEquipment] = useState(null);

  const handleEdit = (equipment) => {
    setEditEquipment(equipment);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet équipement ?"
    );

    if (confirmDelete) {
      try {
        const equipmentToDelete = equipmentList.find((e) => e.id === id);
        // Ajouter à l'historique avant suppression
        await addHistoryRecord(equipmentToDelete, "delete", user?.email);

        await deleteDoc(doc(db, "equipments", id));

        setEquipmentList((prev) =>
          prev.filter((equipment) => equipment.id !== id)
        );

        // Notification de suppression réussie
        toast.success(
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#ff4444",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                animation: "scaleIn 0.3s ease-out",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "15px",
                }}
              >
                Équipement supprimé
              </p>
              <p
                style={{ margin: "4px 0 0 0", color: "#555", fontSize: "14px" }}
              >
                Type:{" "}
                <strong style={{ color: "#ff4444" }}>
                  {equipmentToDelete.type}
                </strong>
              </p>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            icon: false,
            style: {
              background: "white",
              borderLeft: "4px solid #ff4444",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              padding: "16px",
            },
            bodyStyle: {
              padding: 0,
            },
          }
        );
      } catch (error) {
        console.error("Erreur de suppression :", error);

        // Notification d'erreur
        toast.error(
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#ff4444",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "15px",
                }}
              >
                Échec de la suppression
              </p>
              <p
                style={{ margin: "4px 0 0 0", color: "#555", fontSize: "14px" }}
              >
                {error.message}
              </p>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            icon: false,
            style: {
              background: "white",
              borderLeft: "4px solid #ff4444",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              padding: "16px",
            },
          }
        );
      }
    }
  };

  const handleAdd = async (newEquipment) => {
    try {
      const docRef = await addDoc(collection(db, "equipments"), {
        ...newEquipment,
        dateAdded: serverTimestamp(),
        date: new Date(newEquipment.date),
      });
      // Ajouter à l'historique
      await addHistoryRecord(
        { ...newEquipment, id: docRef.id },
        "add",
        user?.email
      );

      const newDoc = await getDocs(collection(db, "equipments"));
      const newEquipmentData = newDoc.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const addedEquipment = newEquipmentData.find(
        (item) => item.id === docRef.id
      );
      const dateAdded = addedEquipment.dateAdded
        ? addedEquipment.dateAdded.toDate()
        : null;
      const date = addedEquipment.date ? addedEquipment.date.toDate() : null;
      setEquipmentList((prevList) => [
        { id: docRef.id, ...newEquipment, dateAdded: dateAdded, date: date },
        ...prevList,
      ]);

      toast.success(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#4BB543",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              animation: "scaleIn 0.3s ease-out",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <path
                d="M5 12l5 5L20 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: "15px",
              }}
            >
              Nouvel équipement enregistré
            </p>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#555",
                fontSize: "14px",
              }}
            >
              Type:{" "}
              <strong style={{ color: "#4BB543" }}>{newEquipment.type}</strong>
            </p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          icon: false,
          style: {
            background: "white",
            borderLeft: "4px solid #4BB543",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            padding: "16px",
          },
          bodyStyle: {
            padding: 0,
          },
        }
      );
    } catch (error) {
      console.error("Erreur d'ajout :", error);
      toast.error("Erreur lors de l'ajout de l'équipement", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleUpdate = async (updatedEquipment) => {
    try {
      const equipmentRef = doc(db, "equipments", updatedEquipment.id);
      const updatedData = {
        ...updatedEquipment,
        date: new Date(updatedEquipment.date),
      };
      delete updatedData.dateAdded;

      await updateDoc(equipmentRef, updatedData);
      // Ajouter à l'historique
      await addHistoryRecord(updatedEquipment, "edit", user?.email);

      setEquipmentList((prev) =>
        prev.map((item) => {
          if (item.id === updatedEquipment.id) {
            return {
              ...updatedEquipment,
              date: new Date(updatedEquipment.date),
              dateAdded: item.dateAdded,
            };
          }
          return item;
        })
      );

      // Notification de modification réussie
      toast.success(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
          }}
        >
          <div
            style={{
              background: "rgba(76, 175, 80, 0.1)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              animation: "pulse 1.5s infinite",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#2E7D32",
                fontSize: "15px",
                marginBottom: "4px",
              }}
            >
              Modification enregistrée
            </div>
            <div
              style={{
                color: "#616161",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  background: "#E8F5E9",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  color: "#2E7D32",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: "4px" }}
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {updatedEquipment.type}
              </span>
              a été mis à jour
            </div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          icon: false,
          style: {
            background: "white",
            borderLeft: "4px solid #4CAF50",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            padding: "16px",
            backdropFilter: "blur(2px)",
          },
          bodyStyle: {
            padding: 0,
          },
        }
      );

      setEditEquipment(null);
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
      // Notification d'erreur
      toast.error(`Échec de la modification: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  return (
    <div>
      <ToastContainer />
      {/* Afficher le Header uniquement si l'utilisateur n'est pas sur la page de login */}
      {location.pathname !== "/login" && <Header user={user} />}
      <Container>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/Accueil" /> : <Login />}
          />
          <Route
            path="/Accueil"
            element={
              user ? (
                <Accueil equipmentList={equipmentList} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Statistiques"
            element={
              user ? (
                <EquipmentStatistics equipmentList={equipmentList} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Equipment-Documentation"
            element={
              user ? (
                <EquipmentDocumentation equipmentList={equipmentList} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/Gestion-Des-Équipements"
            element={
              user ? (
                <>
                  <EquipmentForm
                    onAdd={handleAdd}
                    onEdit={handleUpdate}
                    editEquipment={editEquipment}
                    equipmentList={equipmentList}
                  />
                  <EquipmentTable
                    equipmentList={equipmentList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    user={user}
                  />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Container>
      {/* Afficher le Footer uniquement si l'utilisateur n'est pas sur la page de login */}
      {location.pathname !== "/login" && <Footer />}
    </div>
  );
}

export default MainApp;
