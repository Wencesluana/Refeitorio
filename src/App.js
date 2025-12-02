import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserMultiFormatReader } from "@zxing/browser";

function App() {
  const [texto, setTexto] = useState("");
  const [registros, setRegistros] = useState([]);
  const [historico, setHistorico] = useState([]);
  const nomeCompleto = "NOME DA PESSOA AQUI";

  //pega os dados do campo de texto
  const adicionarRegistro = (e) => {
    if (e.key === "Enter" && texto.trim() !== "") {
      const novo = texto.trim();

      setHistorico((prev) => [...prev, novo]);

      setRegistros((prev) => {
        const novos = [...prev, novo];
        return novos.slice(-7);
      });

      setTexto("");
    }
  };

  //ação para exportar os dados
  const exportarHistorico = () => {
    if (historico.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const conteudo = historico.join("\n");
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historico_registros.txt";
    link.click();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F3") {
        exportarHistorico();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historico]);

//bipe da camera e registro automatico 

  useEffect(() => {
    let controls = null;
    let podeLer = true;

    const iniciarCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");

        if (cameras.length === 0) {
          console.error("Nenhuma câmera encontrada!");
          return;
        }

        const cameraID = cameras[cameras.length - 1].deviceId;

        const reader = new BrowserMultiFormatReader();

        controls = await reader.decodeFromVideoDevice(
          cameraID,
          "videoPreview",
          (result, error) => {
            if (result && podeLer) {
              podeLer = false;

              const codigo = result.getText();

              const agora = new Date();
              const data = agora.toLocaleDateString("pt-BR");
              const horario = agora.toLocaleTimeString("pt-BR");

              const registro = ` ${nomeCompleto} — ${codigo} — ${data} ${horario}`;

              setHistorico((prev) => [...prev, registro]);

              setRegistros((prev) => {
                const novos = [...prev, registro];
                return novos.slice(-7);
              });

              // bloqueia leituras seguidas
              //lembrar de validar se um usuario ja foi bipado naquele dia, que nao pode bipar novamente
              setTimeout(() => (podeLer = true), 1500);
            }
          }
        );
      } catch (erro) {
        console.error("Erro ao iniciar câmera:", erro);
      }
    };

    iniciarCamera();

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, []);

  return (
    <div className="App">

      {/* logo */}
      <header className="top-bar">
        <img src="/logo.png" alt="Logo" className="logo" />
      </header>

      <main>
        <h1>Bem-vindo!</h1>
        <p>Bipe seu crachá no leitor.</p>
      </main>

      {/* Caixa de texto (caso precise digitar manualmente) */}
      <div className="bipe">
        <input
          type="text"
          placeholder="Digite algo..."
          className="text-box"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={adicionarRegistro}
        />
      </div>

      {/* guarda os ultimos 7 */}
      <div className="historico">
        <h3>Últimos registros:</h3>
        <ul>
          {registros.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <p>Bom apetite!</p>

      {/* Exportação */}
      <div className="Bd">Para exportar o banco de dados, pressione F3</div>

      {/* Contador total */}
      <div className="contador">Total de registros: {historico.length}</div>

      {/* Câmera */}
      <div style={{ marginTop: 30 }}>
        <h2>Leitura pela Câmera</h2>
        <video
          id="videoPreview"
          style={{ width: "350px", border: "2px solid #444", borderRadius: "8px" }}
        ></video>
      </div>
    </div>
  );
}

export default App;
