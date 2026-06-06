import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedData } from './BusinessOnboarding';

interface VoiceInputProps {
  onDataExtracted: (data: ExtractedData) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function VoiceInput({ onDataExtracted }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente para registrar tu negocio. Puedes hablarme o escribirme. Por ejemplo: "Hola, soy Don Pedro, tengo una mezcalería llamada El Alambique en la calle Constitución 112..."'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Keep track of the accumulated extracted business data
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    categoria_id: null,
    nombre_negocio: null,
    nombre_dueno: null,
    direccion: null,
    direccion_completa: false,
    telefono: null,
    email: null,
    horario: {
      apertura: null,
      cierre: null,
      dias: null
    },
    descripcion: null,
    tags_sugeridos: [],
    informacion_faltante: ['nombre_negocio', 'categoria_id', 'direccion'],
    preguntas_sugeridas: ['¿Cómo se llama tu negocio?', '¿Qué tipo de negocio es?', '¿Cuál es su dirección?']
  });

  // Manage temporary Gemini API Key in sessionStorage for easy hackathon evaluation
  const [tempGeminiKey, setTempGeminiKey] = useState(() => {
    return sessionStorage.getItem('temp_gemini_api_key') || '';
  });

  const activeGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || tempGeminiKey;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'es-MX';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor usa Google Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Safe Gemini API Caller
  const callGeminiAPI = async (
    userMessage: string,
    history: Message[]
  ): Promise<{ reply: string; data: ExtractedData }> => {
    if (!activeGeminiKey) throw new Error('API Key missing');

    const genAI = new GoogleGenerativeAI(activeGeminiKey);
    // Use gemini-2.5-flash for fast, structured responses
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
      systemInstruction: `
Eres un asistente de inteligencia artificial experto de Durango, México, encargado de registrar pequeños comercios locales para el Hackathon Durango 2026.
Tu objetivo es interactuar amablemente en español con el usuario (usando modismos de Durango/México de forma sutil y cálida) para recopilar los datos de su negocio.

Categorías maestras disponibles para asignar el "categoria_id":
11 = Antojitos (gorditas, comida rápida local, garnachas)
12 = Mezcalerías (ventas de mezcal, cantinas pequeñas)
13 = Artesanías (recuerdos, productos locales, ropa típica)
14 = Abarrotes (tienditas de la esquina, misceláneas, fruterías)

Debes responder SIEMPRE con un objeto JSON válido con el siguiente formato estricto:
{
  "reply": "Tu respuesta conversacional en texto al usuario. Si ya recopilaste todo, agradécele y dile que procedemos a confirmar la información.",
  "extractedData": {
    "nombre_negocio": "Nombre del negocio comercial (ej. 'La Esquina', 'El Alambique') o null si no se conoce",
    "nombre_dueno": "Nombre del dueño o comerciante o null si no se conoce",
    "categoria_id": Número del 11 al 14 basado en las categorías maestras, o null si no se conoce,
    "direccion": "Dirección completa en Durango (calle, número, colonia, etc.) o null si no se conoce",
    "direccion_completa": false, // true si tiene calle, número y opcionalmente colonia, false si está incompleta
    "telefono": "Teléfono de 10 dígitos o null",
    "email": "Correo electrónico o null",
    "horario": {
      "apertura": "Hora de apertura en formato de 24 horas 'HH:MM' (ej: '08:00', '14:00') o null",
      "cierre": "Hora de cierre en formato de 24 horas 'HH:MM' (ej: '17:00', '23:00') o null",
      "dias": "Días que abre, ej. 'Lunes a Domingo', 'Lunes a Sábado', o null"
    },
    "descripcion": "Una breve descripción comercial redactada por ti de forma atractiva basada en lo que contó el usuario, o null",
    "tags_sugeridos": ["tags", "cortos", "en", "minúsculas", "relacionados"],
    "informacion_faltante": ["campo1", "campo2"], // Listar qué campos críticos de esta lista AÚN FALTAN: 'nombre_negocio', 'categoria_id', 'direccion', 'horario'
    "preguntas_sugeridas": ["¿Cómo se llama tu negocio?", "¿Cuál es el giro principal?", "¿En qué calle se ubica?", "¿Cuál es el horario?"], // Preguntas para lo que falte
    "latitud": 24.027729, // Estima latitud en Durango Centro (entre 24.015 y 24.040) basándote en la calle o usa 24.027729 por defecto
    "longitud": -104.653027 // Estima longitud en Durango Centro (entre -104.640 y -104.670) basándote en la calle o usa -104.653027 por defecto
  }
}

Notas importantes sobre geolocalización en Durango:
- Si mencionan calles populares (Juárez, Constitución, 20 de Noviembre, 5 de Febrero, Negrete, Aquiles Serdán, Hidalgo), ubícalas con coordenadas cercanas al Centro Histórico.
- Si no mencionan coordenadas o calles específicas, mantén el centro de Durango (24.027729, -104.653027) con pequeñas desviaciones aleatorias para que no se empalmen.

Analiza el historial de chat provisto y la última declaración del usuario para rellenar de manera acumulativa el objeto "extractedData".
`
    });

    const chatHistoryFormatted = history
      .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
      .join('\n');

    const promptText = `
Historial acumulativo de la conversación:
${chatHistoryFormatted}

Último mensaje del usuario: "${userMessage}"

Analiza la conversación, extrae los datos nuevos y mantén o actualiza los datos previamente extraídos de forma consistente. Responde estrictamente con el JSON.
`;

    const result = await model.generateContent(promptText);
    const rawText = result.response.text();
    
    // Clean JSON response (remove potential markdown wrappers like ```json ... ```)
    const cleanJsonString = rawText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const jsonParsed = JSON.parse(cleanJsonString);
    return {
      reply: jsonParsed.reply,
      data: jsonParsed.extractedData
    };
  };

  // Local regex-based fallback in case Gemini API key is missing
  const processWithMock = async (userMessage: string): Promise<ExtractedData> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updated = { ...extractedData };
    
    // Match name
    const nameMatch = userMessage.match(/(?:llamado|se llama|mi negocio es|tienda|nombre es)\s+["']?([^"',.]+)["']?/i);
    if (nameMatch) updated.nombre_negocio = nameMatch[1].trim();

    // Match owner
    const ownerMatch = userMessage.match(/(?:soy|me llamo|mi nombre es)\s+([A-ZÁ-Ú][a-zá-ú]+)/i);
    if (ownerMatch) updated.nombre_dueno = ownerMatch[1];

    // Match giro (now categoria_id fallback)
    const tipos_antojitos = ['antojito', 'comida', 'gordita', 'tacos'];
    const tipos_mezcal = ['mezcal', 'cantina'];
    const tipos_artesanias = ['artesanía', 'recuerdo', 'ropa'];
    const tipos_abarrotes = ['abarrotes', 'tiendita', 'miscelánea'];
    
    if (tipos_antojitos.some(t => userMessage.toLowerCase().includes(t))) updated.categoria_id = 11;
    else if (tipos_mezcal.some(t => userMessage.toLowerCase().includes(t))) updated.categoria_id = 12;
    else if (tipos_artesanias.some(t => userMessage.toLowerCase().includes(t))) updated.categoria_id = 13;
    else if (tipos_abarrotes.some(t => userMessage.toLowerCase().includes(t))) updated.categoria_id = 14;

    // Match address
    const addressMatch = userMessage.match(/(?:en|calle|ubicado en)\s+(?:la\s+)?([A-ZÁ-Ú0-9][a-zá-ú0-9\s]+#?\d*)/i);
    if (addressMatch) {
      updated.direccion = addressMatch[1].trim() + ', Durango';
      updated.direccion_completa = true;
    }

    // Match phone
    const phoneMatch = userMessage.match(/\d{10}/);
    if (phoneMatch) updated.telefono = phoneMatch[0];

    // Match opening & closing hours
    const openMatch = userMessage.match(/(?:abro|desde|apertura)\s+(?:a\s+las\s+)?(\d{1,2})/i);
    if (openMatch) {
      updated.horario.apertura = openMatch[1].padStart(2, '0') + ':00';
    }
    const closeMatch = userMessage.match(/(?:cierro|hasta|cierre)\s+(?:a\s+las\s+)?(\d{1,2})/i);
    if (closeMatch) {
      const hr = parseInt(closeMatch[1]);
      updated.horario.cierre = (hr < 12 ? hr + 12 : hr).toString().padStart(2, '0') + ':00';
    }
    updated.horario.dias = 'Lunes a Sábado';

    // Description & coordinates
    updated.descripcion = `Comercio local registrado. ${userMessage}`;
    updated.tags_sugeridos = [updated.giro?.toLowerCase() || 'comercio_local'];
    
    // Recalculate missing information
    updated.informacion_faltante = [];
    updated.preguntas_sugeridas = [];

    if (!updated.nombre_negocio) {
      updated.informacion_faltante.push('nombre_negocio');
      updated.preguntas_sugeridas.push('¿Cómo se llama tu negocio?');
    }
    if (!updated.categoria_id) {
      updated.informacion_faltante.push('categoria_id');
      updated.preguntas_sugeridas.push('¿Cuál es el tipo de negocio principal (ej. antojitos, abarrotes, artesanías, etc)?');
    }
    if (!updated.direccion) {
      updated.informacion_faltante.push('direccion');
      updated.preguntas_sugeridas.push('¿En qué calle y número se encuentra ubicado?');
    }
    if (!updated.horario.apertura || !updated.horario.cierre) {
      updated.informacion_faltante.push('horario');
      updated.preguntas_sugeridas.push('¿Cuáles son las horas de apertura y de cierre de tu negocio?');
    }

    // Set coordinates relative to Durango center
    const indexOffset = Math.random() * 0.01 - 0.005;
    updated.latitud = 24.027729 + indexOffset;
    updated.longitud = -104.653027 + indexOffset;

    return updated;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      if (activeGeminiKey) {
        // Run real Gemini API registration
        const result = await callGeminiAPI(userMessage, [
          ...messages,
          { role: 'user', content: userMessage }
        ]);
        
        // Update local state with latest extracted data
        setExtractedData(result.data);

        // Append assistant's conversational response
        setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);

        // If no critical information is missing, proceed to confirmation step
        if (result.data.informacion_faltante.length === 0) {
          setTimeout(() => {
            onDataExtracted(result.data);
          }, 3000);
        }
      } else {
        // Fallback to deterministic regex extractor
        const updatedData = await processWithMock(userMessage);
        setExtractedData(updatedData);

        if (updatedData.informacion_faltante.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: '¡Perfecto! He extraído toda la información del negocio correctamente. Redirigiendo para confirmar...'
            }
          ]);
          setTimeout(() => onDataExtracted(updatedData), 2000);
        } else {
          const followUpQuestion = updatedData.preguntas_sugeridas[0] || '¿Podrías darme más detalles?';
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `Entendido. Para el registro, ${followUpQuestion.toLowerCase()}` }
          ]);
        }
      }
    } catch (error) {
      console.error('Error during AI processing:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un problema procesando tu mensaje con Gemini. Revisa tu API Key o intenta de nuevo.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const forceFinish = () => {
    // Allows the user to jump directly to the confirmation screen even with incomplete fields
    const finishedData: ExtractedData = {
      ...extractedData,
      nombre_negocio: extractedData.nombre_negocio || 'Negocio sin nombre',
      categoria_id: extractedData.categoria_id || 14, // Default a abarrotes
      direccion: extractedData.direccion || 'Durango Centro, Dgo.',
      latitud: extractedData.latitud || 24.027729,
      longitud: extractedData.longitud || -104.653027,
      tags_sugeridos: extractedData.tags_sugeridos.length > 0 ? extractedData.tags_sugeridos : ['comercio_local'],
      informacion_faltante: []
    };
    onDataExtracted(finishedData);
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col p-6 relative">
      
      {/* API Key Configuration Banner */}
      {!import.meta.env.VITE_GEMINI_API_KEY && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-orange-800 font-semibold">
            <Sparkles className="size-4 text-orange-600" />
            <span>Asistente de Registro con Gemini 2.5 Flash</span>
          </div>
          <p className="text-gray-600">
            Define la variable <code className="bg-white px-1 py-0.5 rounded font-mono text-purple-600">VITE_GEMINI_API_KEY</code> en tu archivo <code className="bg-white px-1 py-0.5 rounded font-mono">.env</code> para habilitar la conversación con IA de Gemini. También puedes ingresar una clave temporal para pruebas:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="API Key de Gemini..."
              value={tempGeminiKey}
              onChange={(e) => {
                setTempGeminiKey(e.target.value);
                sessionStorage.setItem('temp_gemini_api_key', e.target.value);
              }}
              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-xl outline-none focus:border-purple-600 text-gray-900 bg-white"
            />
            {tempGeminiKey && (
              <button
                onClick={() => {
                  setTempGeminiKey('');
                  sessionStorage.removeItem('temp_gemini_api_key');
                }}
                className="text-red-500 font-medium px-1"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400 italic">
            {!activeGeminiKey && '⚠️ Ejecutando en Modo Simulación local por falta de API Key.'}
            {activeGeminiKey && '✅ Clave temporal configurada correctamente.'}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-4 mb-6 pr-2">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-100 text-gray-900'
              }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-purple-600">
                    <Sparkles className="size-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Asistente Durango IA</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="size-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">Procesando conversación...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating progress and bypass */}
      <div className="flex justify-between items-center px-2 py-1 mb-3 bg-purple-50 rounded-xl border border-purple-100/50">
        <div className="text-xs text-purple-800">
          <span className="font-semibold">Campos extraídos:</span>{' '}
          {[
            extractedData.nombre_negocio && 'Nombre',
            extractedData.categoria_id && 'Categoría',
            extractedData.direccion && 'Dirección',
            extractedData.horario.apertura && 'Horario'
          ].filter(Boolean).join(', ') || 'Ninguno aún'}
        </div>
        <button
          onClick={forceFinish}
          className="text-xs font-medium text-purple-600 hover:text-purple-800 underline transition-colors"
        >
          Confirmar con datos actuales ➔
        </button>
      </div>

      {/* Input controls */}
      <div className="space-y-4">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-3 flex items-center justify-center">
                  <div className="absolute size-3 bg-red-500 rounded-full animate-ping" />
                  <div className="size-2 bg-red-600 rounded-full" />
                </div>
                <span className="text-red-800 text-xs font-medium">Grabando voz... Habla de tu negocio ahora.</span>
                <Volume2 className="size-4 text-red-500 ml-auto animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-3xl shadow-md border border-gray-200/80 p-2 flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe o presiona el micrófono para hablar..."
            className="flex-1 px-4 py-3 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 max-h-32"
            rows={1}
          />

          <button
            onClick={toggleRecording}
            className={`size-12 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
            title="Grabar por voz"
          >
            {isRecording ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="size-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-md"
            title="Enviar mensaje"
          >
            <Send className="size-5" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Tip: Dile al asistente el nombre, tipo de negocio, dirección y horario de tu local comercial.
        </p>
      </div>
    </div>
  );
}
