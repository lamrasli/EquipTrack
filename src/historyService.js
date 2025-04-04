import {
  db,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "./firebase";

export const addHistoryRecord = async (equipment, action, userEmail) => {
  try {
    await addDoc(collection(db, "history"), {
      equipmentId: equipment.id || null,
      numero_serie: equipment.numero_serie,
      type: equipment.type,
      marque: equipment.marque,
      modele: equipment.modele,
      statut: equipment.statut,
      bureau: equipment.bureau,
      direction: equipment.direction,
      action: action, // 'add', 'edit', 'delete'
      user: userEmail || "anonymous",
      timestamp: serverTimestamp(),
      details: equipment,
    });
  } catch (error) {
    console.error("Error adding history record: ", error);
  }
};

export const getHistoryBySerialNumber = async (numero_serie) => {
  try {
    const q = query(
      collection(db, "history"),
      where("numero_serie", "==", numero_serie),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    // Ajoutez un log pour déboguer
    console.log("Nombre de documents trouvés:", querySnapshot.docs.length);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || null,
    }));
  } catch (error) {
    console.error("Error getting history: ", error);
    return [];
  }
};