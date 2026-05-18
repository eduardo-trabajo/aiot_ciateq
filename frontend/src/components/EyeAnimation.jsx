import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import chart from "../assets/icons/chart.svg";
import up from "../assets/icons/up.svg";
import voice from "../assets/icons/voice.svg";
import micro from "../assets/icons/micro.svg";
import "../assets/styles/eyeanimation.css";
import {config }from "../utils/config.js";

const PROVIDERS = ['openai', 'deepseek', 'mistral'];
const COLORS = {
    openai: '#00B48C',
    deepseek: '#090979',
    mistral: '#833AB4'
};

const EyeAnimation = () => {
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [providerIndex, setProviderIndex] = useState(0);
    const provider = PROVIDERS[providerIndex];
    const [listening, setListening] = useState(false);
    const [voiceReady, setVoiceReady] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voices, setVoices] = useState([]);
    const isMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;


        let isBlinking = false;
        let blinkDuration = 0;
        let animationFrameId;
        let offsetX = 0;
        let offsetY = 0;

        const drawEye = (baseX, baseY, radius, blinkLevel, offsetX, offsetY) => {
            const adjustedX = baseX + offsetX;
            const adjustedY = baseY + offsetY;
            ctx.fillStyle = "white";
            if (blinkLevel > 0) {
                const height = Math.max(2, radius * 2 * (1 - blinkLevel));
                ctx.beginPath();
                ctx.ellipse(adjustedX, adjustedY, radius, height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(adjustedX, adjustedY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!isBlinking && Math.random() < 0.002) {
                isBlinking = true;
                blinkDuration = 12;
            }
            if (isBlinking) {
                blinkDuration--;
                if (blinkDuration <= 0) isBlinking = false;
            }
            const blinkLevel = isBlinking ? Math.abs((blinkDuration - 6) / 6) : 0;

            const maxOffset = 8;
            const relX = (mousePos.x - canvas.width / 2) / (canvas.width / 2);
            const relY = (mousePos.y - canvas.height / 2) / (canvas.height / 2);

            const smoothing = 0.15;
            offsetX += (Math.max(Math.min(relX * maxOffset, maxOffset), -maxOffset) - offsetX) * smoothing;
            offsetY += (Math.max(Math.min(relY * maxOffset, maxOffset), -maxOffset) - offsetY) * smoothing;

            const baseSize = Math.min(canvas.width, canvas.height);
            const radius = baseSize < 600 ? baseSize * 0.10 : baseSize * 0.12;
            const leftX = baseSize < 600 ? canvas.width * 0.35 : canvas.width * 0.42;
            const rightX = baseSize < 600 ? canvas.width * 0.65 : canvas.width * 0.58;
            const centerY = canvas.height * 0.25;

            drawEye(leftX, centerY, radius, blinkLevel, offsetX, offsetY);
            drawEye(rightX, centerY, radius, blinkLevel, offsetX, offsetY);

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePos]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponse("Pensando...");
        try {
            const res = await fetch(`${config.apiUrl}/analyze_${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customPrompt: query }) // ✅ aquí lo envías
            });

            console.log("Request sent to:", `${config}/analyze_${provider}`);
            const data = await res.json();
            console.log("Response received:", data);
            setResponse(data.result || 'Sin respuesta');
            speakText(data.result || 'Sin respuesta');
        } catch (error) {
            console.error(error);
            setResponse("Hubo un error al conectar con la IA.");
            speakText("Hubo un error al conectar con la inteligencia artificial.");
        }
    };


    const getRingGradient = (provider) => {
        switch (provider) {
            case 'openai':
                return 'linear-gradient(359deg,rgba(42, 123, 155, 1) 0%, rgba(0, 180, 140, 1) 35%, rgba(0, 180, 140, 1) 100%)';
            case 'deepseek':
                return 'linear-gradient(6deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)';
            case 'mistral':
                return 'linear-gradient(90deg,rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)';
            default:
                return '#ccc';
        }
    };

    const nextProvider = () => {
        setProviderIndex((prev) => (prev + 1) % PROVIDERS.length);
    };

    const speakText = (text) => {
        if (!selectedVoice || !window.speechSynthesis) {
            console.warn('Voice synthesis not available');
            return;
        }

        // Cancelar cualquier utterance previo
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || 'es-MX';
        utterance.rate = 0.9; // Velocidad ligeramente reducida para mejor claridad

        // Eventos para manejar errores
        utterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
        };

        utterance.onend = () => {
            console.log('Síntesis de voz completada');
        };

        // Intentar hablar (con manejo de errores)
        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error al intentar hablar:', error);

            // Fallback para iOS/móviles que bloquean síntesis de voz
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                alert('Para escuchar respuestas, por favor habilita la voz en configuración de accesibilidad.');
            }
        }
    };




    // Mover la inicialización de voces a un efecto separado
    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            setVoices(v);
            const paulina = v.find(v => v.name === 'Paulina' && v.lang === 'es-MX');
            setSelectedVoice(paulina || v.find(v => v.lang.includes('es')) || v[0]);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            loadVoices();
        }
    }, []);

    // Añadir botón para probar voz
    const testVoice = () => {
        if (!selectedVoice) {
            alert('Voces no cargadas aún. Intenta de nuevo en unos segundos.');
            return;
        }
        speakText("Hola, esta es una prueba de voz.");
    };



    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Tu navegador no soporta reconocimiento de voz.');

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.interimResults = false;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);

        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            setQuery(voiceText);
        };

        recognition.start();
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                className="eye-canvas"
            />

            <div
                onClick={nextProvider}
                title={`IA: ${provider.toUpperCase()}`}
                style={{
                    position: 'absolute',
                    bottom: '55px',
                    right: '55px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: getRingGradient(provider),
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease-in-out'
                }}
            >
                <div
                    style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'black',
                        borderRadius: '50%'
                    }}
                ></div>
            </div>

            <form onSubmit={handleSubmit} className="eye-form">
                <NavLink to="/devices" activeClassName="active">
                    <img src={chart} alt="chart" className="icon-chart" />
                </NavLink>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything..."
                    className="eye-input"
                />
                <button
                    type="button"
                    onClick={startListening}
                    className="eye-button"
                    style={{
                        backgroundColor: listening ? '#fffff' : '',
                        animation: listening ? 'pulse 1s infinite' : 'none'
                    }}
                >
                    <img src={micro} alt="Send" className="icon-chart" />
                </button>
                <button type="submit" className="eye-button">
                    <img src={up} alt="Send" className="icon-chart" />
                </button>
            </form>


            {!voiceReady && (
                <button className="voiceButton gradient-animated" onClick={() => {
                    const u = new SpeechSynthesisUtterance("Hola, ¿en qué puedo ayudarte?");
                    u.voice = selectedVoice;
                    u.lang = selectedVoice?.lang || 'es-MX';
                    window.speechSynthesis.speak(u);
                    setVoiceReady(true);
                }}>
                    <img src={voice} alt="Send" className="icon-chart" />
                </button>
            )}





            {response && (
                <div className="eye-response">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Respuesta:</strong>
                        <button
                            onClick={() => setResponse("")}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: 'white',
                                marginLeft: '10px'
                            }}
                            aria-label="Cerrar respuesta"
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ marginTop: '8px' }}>{response}</div>
                </div>
            )}


        </div>
    );
};

export default EyeAnimation;
