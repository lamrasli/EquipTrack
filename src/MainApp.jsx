import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import EquipmentForm from "./components/EquipmentForm";
import EquipmentTable from "./components/EquipmentTable";
import Footer from "./components/Footer";
import Container from "./components/Container";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import EquipmentStatistics from "./components/Pages/Dashboard/EquipmentStatistics";
import Accueil from "./components/Pages/Accueil/Accueil";
import EquipmentDocumentation from "./components/Pages/EquipmentDocumentation/EquipmentDocumentation";
import Login from "./components/Pages/Login/Login";
import { db, serverTimestamp } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

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
      await deleteDoc(doc(db, "equipments", id));
      setEquipmentList((prev) =>
        prev.filter((equipment) => equipment.id !== id)
      );
    }
  };

  const handleAdd = async (newEquipment) => {
    try {
      const docRef = await addDoc(collection(db, "equipments"), {
        ...newEquipment,
        dateAdded: serverTimestamp(),
        date: new Date(newEquipment.date),
      });

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
    } catch (error) {
      console.error("Erreur d'ajout :", error);
    }
  };

  const handleUpdate = async (updatedEquipment) => {
    const equipmentRef = doc(db, "equipments", updatedEquipment.id);
    const updatedData = {
      ...updatedEquipment,
      date: new Date(updatedEquipment.date),
    };
    delete updatedData.dateAdded;

    await updateDoc(equipmentRef, updatedData);

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
    setEditEquipment(null);
  };

  return (
    <div>
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
