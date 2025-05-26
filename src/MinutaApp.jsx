// MinutaApp.jsx
import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import emailjs from "emailjs-com";

export default function MinutaApp() {
  const [empresa, setEmpresa] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [correoExtra, setCorreoExtra] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const firmaTecnicoRef = useRef();
  const firmaClienteRef = useRef();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
  };

  const generarPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MINUTA DE TRABAJO", 20, 20);

    doc.setFontSize(12);
    doc.text(`Empresa: ${empresa}`, 20, 30);
    doc.text(`Técnico: ${tecnico}`, 20, 40);
    doc.text(`Descripción:`, 20, 50);
    doc.text(descripcion, 20, 60);

    let yOffset = 80;
    for (const img of imagenes) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          doc.addImage(e.target.result, "JPEG", 20, yOffset, 100, 75);
          yOffset += 80;
          resolve();
        };
        reader.readAsDataURL(img);
      });
    }

    const firmaTecnico = firmaTecnicoRef.current.getCanvas().toDataURL("image/png");
    const firmaCliente = firmaClienteRef.current.getCanvas().toDataURL("image/png");

    doc.text("Firma Técnico:", 20, yOffset);
    doc.addImage(firmaTecnico, "PNG", 20, yOffset + 5, 50, 20);
    doc.text("Firma Cliente:", 20, yOffset + 30);
    doc.addImage(firmaCliente, "PNG", 20, yOffset + 35, 50, 20);

    const pdfBase64 = doc.output("datauristring").split(",")[1];

    emailjs.send("service_9020hqs", "template_z19byac", {
      empresa,
      tecnico,
      descripcion,
      to_email: correoExtra,
      reply_to: "made.l@smartjobscl.com",
      attachment: pdfBase64
    }, "bqbgFQ4HEDP0LKT1B").then(
      (result) => {
        alert("Correo enviado correctamente con el PDF adjunto.");
      },
      (error) => {
        alert("Error al enviar el correo: " + error.text);
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
      <h1 className="text-2xl font-bold text-center text-blue-700">Minuta de Trabajo</h1>

      <div className="grid grid-cols-1 gap-4">
        <input type="text" placeholder="Empresa" className="w-full p-3 border rounded" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
        <input type="text" placeholder="Técnico" className="w-full p-3 border rounded" value={tecnico} onChange={(e) => setTecnico(e.target.value)} />
        <textarea placeholder="Descripción del trabajo" className="w-full p-3 border rounded" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
        <input type="email" placeholder="Correo adicional (opcional)" className="w-full p-3 border rounded" value={correoExtra} onChange={(e) => setCorreoExtra(e.target.value)} />
        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full border rounded p-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold mb-1">Firma Técnico:</p>
          <SignatureCanvas ref={firmaTecnicoRef} penColor="black" canvasProps={{ className: "border w-30% h-100
    rounded" }} />
        </div>
        <div>
          <p className="font-semibold mb-1">Firma Cliente:</p>
          <SignatureCanvas ref={firmaClienteRef} penColor="black" canvasProps={{ className: "border w-30% h-32 rounded" }} /> {/* Botón para limpiar solo la firma del cliente */}
    <button
      type="button"
      onClick={() => firmaClienteRef.current.clear()}
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
    >
      Limpiar firma
    </button>
        </div>
      </div>

      <div className="text-center">
        <button onClick={generarPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded">
          Generar y Enviar PDF
        </button>
      </div>
    </div>
  );
}

