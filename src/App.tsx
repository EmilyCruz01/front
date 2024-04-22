import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import "./App.css"

interface FormData {
  id_orden: number;
  descripcion: string;
  total: number;
}

interface PagoInfo {
  descripcion: string;
  total: number;
}

export default function Home(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    id_orden: 0,
    descripcion: "",
    total: 0
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [pagoaInfo, setPagoInfo] = useState<PagoInfo | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("https://event-driven-order.onrender.com/ordenes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    console.log(result)
    
    toast.info('Processing orden, status: pending')
    console.log("se ha mandado la orden")
  };

  useEffect(() => {
    if (!socket) {
      const newSocket = io("https://event-driven-socket.onrender.com");
      newSocket.on("orden-procesada", (orden: PagoInfo) => {
        console.log(orden);
        setPagoInfo(orden);
        toast.success('orden confirmed!')
        console.log("Se ha realizado la orden")
      });
      setSocket(newSocket);
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <h1>Datos</h1>
        <div className="campo">
          <label>
            ID orden
          </label>
          <input
            type="number"
            name="id_orden"
            value={formData.id_orden}
            onChange={handleInputChange}
            />
        </div>
        
        <div className="campo" >
          <label>
            Descripcion
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="campo">
          <label>
            Total
          </label>
          <input
            type="number"
            name="total"
            value={formData.total}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
        >
          Enviar
        </button>
      </form>
      {pagoaInfo && (
        <div>
          <h2>Orden Confirmada:</h2>
          <p>orden: {pagoaInfo.descripcion}</p>
          <p>total:{pagoaInfo.total}</p>
          
        </div>
      )}
    </main>
  );
}