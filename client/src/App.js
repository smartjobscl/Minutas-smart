import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

function App() {
  const [sede, setSede] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [correoJefe, setCorreoJefe] = useState("");
  const [imagenes, setImagenes] = useState([]);

  const firmaTecnicoRef = useRef();
  const firmaClienteRef = useRef();

  const handleImageChange = (e) => {
    setImagenes(Array.from(e.target.files));
  };

  const generarPDF = async () => {
    const doc = new jsPDF();

    // Fecha automática (formato DD-MM-YYYY)
    const fechaActual = new Date();
    const fechaTexto = `${fechaActual.getDate().toString().padStart(2, '0')}-${(fechaActual.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${fechaActual.getFullYear()}`;

    // Agregar logo (con timeout por si no carga)
    const logo = new Image();
    logo.src = process.env.PUBLIC_URL + "/logo.jpg";
    await Promise.race([
      new Promise((resolve) => {
        logo.onload = () => {
          doc.addImage(logo, "jpg", 10, 10, 40, 20);
          resolve();
        };
      }),
      new Promise((resolve) => setTimeout(resolve, 1000)), // máximo 1 seg
    ]);

    doc.setFontSize(16);
    doc.text("MINUTA DE TRABAJO", 70, 20);

    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaTexto}`, 150, 20); // Fecha arriba a la derecha

    doc.setFontSize(12);
    doc.text(`Sede: ${sede}`, 20, 40);
    doc.text(`Técnico: ${tecnico}`, 20, 50);
    doc.text("Descripción:", 20, 60);

    const descripcionLimpia = doc.splitTextToSize(descripcion, 170);
    doc.text(descripcionLimpia, 20, 70);

    let yOffset = 80 + descripcionLimpia.length * 6;

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
    doc.text("Firma de jefe de tienda o responsable:", 100, yOffset);
    doc.addImage(firmaCliente, "PNG", 100, yOffset + 5, 50, 20);

    doc.save(`Minuta_${sede}.pdf`);

    // Abrir Gmail (solo una vez)
    const para = encodeURIComponent(`made.l@smartjobscl.com${correoJefe ? "," + correoJefe : ""}`);
    const asunto = encodeURIComponent(`Minuta de trabajo - ${sede}`);
    const cuerpo = encodeURIComponent(`Sede: ${sede}\nTécnico: ${tecnico}`);
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${para}&su=${asunto}&body=${cuerpo}`;
    window.open(gmailURL, "_blank");
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Minuta de Trabajo</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="text"
          placeholder="Sede"
          value={sede}
          onChange={(e) => setSede(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Técnico"
          value={tecnico}
          onChange={(e) => setTecnico(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción del trabajo"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          required
        />
        <input
          type="email"
          placeholder="Correo de jefe de tienda (opcional)"
          value={correoJefe}
          onChange={(e) => setCorreoJefe(e.target.value)}
        />
        <label><strong>Subir fotografías</strong></label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <p><strong>Firma Técnico:</strong></p>
            <SignatureCanvas
              ref={firmaTecnicoRef}
              penColor="black"
              canvasProps={{
                width: 250,
                height: 100,
                className: "sigCanvas",
                style: { border: "1px solid #000" },
              }}
            />
          </div>

          <div>
            <p><strong>Firma de jefe de tienda o responsable:</strong></p>
            <SignatureCanvas
              ref={firmaClienteRef}
              penColor="black"
              canvasProps={{
                width: 250,
                height: 100,
                className: "sigCanvas",
                style: { border: "1px solid #000" },
              }}
            />
          </div>
        </div>

        <button
          onClick={generarPDF}
          style={{
            padding: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            marginTop: 20,
          }}
        >
          Generar PDF y Abrir Gmail
        </button>
      </div>
    </div>
  );
}

export default App;
