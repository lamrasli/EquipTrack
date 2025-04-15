import React, { useState, useEffect, useRef } from "react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import { MdSend, MdHelpOutline, MdFileDownload } from "react-icons/md";

const Chatbot = ({ equipmentList }) => {
  const [messages, setMessages] = useState([
    {
      text: "Bonjour ! Je suis l'assistant des équipements informatiques. Posez-moi des questions ou demandez un rapport Word.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateWordReport = (data, reportType) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Rapport des Équipements Informatiques",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
                  bold: true,
                }),
              ],
            }),
            ...generateReportContent(data, reportType),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(
          blob,
          `rapport_equipements_${reportType || "statistiques"}.docx`
        );
        setMessages((prev) => [
          ...prev,
          {
            text: `Rapport ${reportType || "statistiques"} généré avec succès!`,
            sender: "bot",
          },
        ]);
      })
      .catch((error) => {
        console.error("Erreur lors de la génération du rapport:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Une erreur est survenue lors de la génération du rapport.",
            sender: "bot",
          },
        ]);
      });
  };

  const generateReportContent = (data, reportType) => {
    const content = [];

    const stats = {
      total: data.length,
      functional: data.filter((e) => e.statut === "Fonctionnel").length,
      officeReform: data.filter((e) => e.statut === "Réformé en bureau").length,
      stockReform: data.filter((e) => e.statut === "Réformé en stock").length,
      byType: {},
      byDirection: {},
    };

    data.forEach((equip) => {
      stats.byType[equip.type] = (stats.byType[equip.type] || 0) + 1;
      stats.byDirection[equip.direction] =
        (stats.byDirection[equip.direction] || 0) + 1;
    });

    content.push(
      new Paragraph({
        text: "Statistiques Globales",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun(`• Total: ${stats.total} équipements`),
          new TextRun({ text: "", break: 1 }),
          new TextRun(`• Fonctionnels: ${stats.functional}`),
          new TextRun({ text: "", break: 1 }),
          new TextRun(`• Réformés bureau: ${stats.officeReform}`),
          new TextRun({ text: "", break: 1 }),
          new TextRun(`• Réformés stock: ${stats.stockReform}`),
        ],
      })
    );

    content.push(
      new Paragraph({
        text: "Répartition par type",
        heading: HeadingLevel.HEADING_3,
      })
    );

    Object.entries(stats.byType).forEach(([type, count]) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun(
              `- ${type}: ${count} (${Math.round(
                (count / stats.total) * 100
              )}%)`
            ),
          ],
          indent: { left: 400 },
        })
      );
    });

    content.push(
      new Paragraph({
        text: "Répartition par direction",
        heading: HeadingLevel.HEADING_3,
      })
    );

    Object.entries(stats.byDirection).forEach(([direction, count]) => {
      content.push(
        new Paragraph({
          children: [
            new TextRun(
              `- ${direction}: ${count} (${Math.round(
                (count / stats.total) * 100
              )}%)`
            ),
          ],
          indent: { left: 400 },
        })
      );
    });

    if (reportType === "détail") {
      content.push(
        new Paragraph({
          text: "Détail des Équipements",
          heading: HeadingLevel.HEADING_2,
        })
      );

      data.forEach((equip, index) => {
        content.push(
          new Paragraph({
            text: `Équipement ${index + 1}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Type: ",
                bold: true,
              }),
              new TextRun(equip.type || "Non spécifié"),
              new TextRun({ text: "", break: 1 }),
              new TextRun({
                text: "Marque: ",
                bold: true,
              }),
              new TextRun(equip.marque || "Non spécifié"),
              new TextRun({ text: "", break: 1 }),
              new TextRun({
                text: "Modèle: ",
                bold: true,
              }),
              new TextRun(equip.modele || "Non spécifié"),
              new TextRun({ text: "", break: 1 }),
              new TextRun({
                text: "N° Série: ",
                bold: true,
              }),
              new TextRun(equip.numero_serie || "Non spécifié"),
              new TextRun({ text: "", break: 1 }),
              new TextRun({
                text: "Statut: ",
                bold: true,
              }),
              new TextRun({
                text: equip.statut || "Non spécifié",
                color:
                  equip.statut === "Fonctionnel"
                    ? "2E7D32"
                    : equip.statut === "Réformé en bureau"
                    ? "C62828"
                    : "FF8F00",
              }),
              new TextRun({ text: "", break: 1 }),
              new TextRun({
                text: "Date: ",
                bold: true,
              }),
              new TextRun(
                equip.date
                  ? new Date(equip.date).toLocaleDateString("fr-FR")
                  : "Non spécifié"
              ),
            ],
            indent: { left: 400 },
            spacing: { after: 150 },
          })
        );
      });
    }

    return content;
  };

  const fetchAIResponse = async (question, context) => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `process.env.REACT_APP_OPENAI_API_KEY`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `Tu es un assistant spécialisé dans l'analyse des équipements informatiques. 
              Voici les données: ${JSON.stringify(
                context
              )}. Réponds uniquement en français.`,
              },
              { role: "user", content: question },
            ],
          }),
        }
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erreur API OpenAI:", error);
      return "Désolé, je n'ai pas pu contacter le service d'IA. Voici une réponse basique...";
    }
  };

  const processQuestion = async (question) => {
    const lowerQuestion = question.toLowerCase();
    let response = "";
    let dataToUse = equipmentList;

    // Filtrage des données
    if (lowerQuestion.includes("filtre") || lowerQuestion.includes("filtrer")) {
      if (lowerQuestion.includes("fonctionnel")) {
        dataToUse = equipmentList.filter((e) => e.statut === "Fonctionnel");
        response = `J'ai filtré les équipements fonctionnels. Il y en a ${dataToUse.length}.`;
      } else if (
        lowerQuestion.includes("réformé") &&
        lowerQuestion.includes("bureau")
      ) {
        dataToUse = equipmentList.filter(
          (e) => e.statut === "Réformé en bureau"
        );
        response = `J'ai filtré les équipements réformés en bureau. Il y en a ${dataToUse.length}.`;
      } else if (
        lowerQuestion.includes("réformé") &&
        lowerQuestion.includes("stock")
      ) {
        dataToUse = equipmentList.filter(
          (e) => e.statut === "Réformé en stock"
        );
        response = `J'ai filtré les équipements réformés en stock. Il y en a ${dataToUse.length}.`;
      }
    } else if (
      lowerQuestion.includes("combien") ||
      lowerQuestion.includes("nombre")
    ) {
      if (lowerQuestion.includes("fonctionnel")) {
        const count = dataToUse.filter(
          (e) => e.statut === "Fonctionnel"
        ).length;
        response = `Il y a ${count} équipements fonctionnels.`;
      } else if (
        lowerQuestion.includes("réformé") &&
        lowerQuestion.includes("bureau")
      ) {
        const count = dataToUse.filter(
          (e) => e.statut === "Réformé en bureau"
        ).length;
        response = `Il y a ${count} équipements réformés en bureau.`;
      } else if (
        lowerQuestion.includes("réformé") &&
        lowerQuestion.includes("stock")
      ) {
        const count = dataToUse.filter(
          (e) => e.statut === "Réformé en stock"
        ).length;
        response = `Il y a ${count} équipements réformés en stock.`;
      } else {
        response = `Il y a ${dataToUse.length} équipements au total.`;
      }
    } else if (
      lowerQuestion.includes("liste") ||
      lowerQuestion.includes("lister")
    ) {
      if (lowerQuestion.includes("direction")) {
        const directions = [...new Set(dataToUse.map((e) => e.direction))];
        response = `Directions disponibles: ${directions.join(", ")}`;
      } else if (lowerQuestion.includes("type")) {
        const types = [...new Set(dataToUse.map((e) => e.type))];
        response = `Types d'équipements: ${types.join(", ")}`;
      }
    } else if (
      lowerQuestion.includes("rapport") ||
      lowerQuestion.includes("générer")
    ) {
      const reportType = lowerQuestion.includes("détail")
        ? "détail"
        : "statistiques";
      generateWordReport(dataToUse, reportType);
      response = `Je génère un rapport Word (${reportType}) avec les données actuelles.`;
    } else {
      // Pour les questions complexes, utiliser l'API OpenAI
      try {
        response = await fetchAIResponse(question, dataToUse);
      } catch (error) {
        response =
          "Je peux vous fournir des statistiques sur les équipements, lister les types/directions, ou générer un rapport Word. Par exemple, demandez-moi : 'Combien d'équipements sont fonctionnels ?' ou 'Génère un rapport détaillé'.";
      }
    }

    return response;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const botResponse = await processQuestion(input);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error processing question:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Une erreur est survenue lors du traitement de votre demande.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
          <div
            className="bg-red-600 text-white p-3 flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <h3 className="font-semibold">Assistant Équipements</h3>
            <span className="text-sm">×</span>
          </div>

          <div className="h-64 overflow-y-auto p-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-red-100 text-gray-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                onClick={handleSend}
                className="bg-red-600 text-white p-2 rounded-r-lg hover:bg-red-700 transition"
              >
                <MdSend size={20} />
              </button>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <button
                onClick={() => setMessages([messages[0]])}
                className="flex items-center hover:text-red-600"
              >
                <MdHelpOutline className="mr-1" /> Aide
              </button>
              <button
                onClick={() => generateWordReport(equipmentList, "détail")}
                className="flex items-center hover:text-red-600"
              >
                <MdFileDownload className="mr-1" /> Rapport complet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
