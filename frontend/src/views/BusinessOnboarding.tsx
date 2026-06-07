import { useState } from 'react';
import { ArrowLeft, Mic, CheckCircle, Store } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { ConfirmationStep } from './ConfirmationStep';
import { saveBusiness } from '../services/businessService';

interface BusinessOnboardingProps {
  onBack: () => void;
}

export interface ExtractedData {
  nombre_negocio: string | null;
  nombre_dueno: string | null;
  categoria_id: number | null;
  direccion: string | null;
  direccion_completa: boolean;
  telefono: string | null;
  email: string | null;
  horario: {
    apertura: string | null;
    cierre: string | null;
    dias: string | null;
  };
  descripcion: string | null;
  tags_sugeridos: string[];
  informacion_faltante: string[];
  preguntas_sugeridas: string[];
  latitud?: number;
  longitud?: number;
}

export function BusinessOnboarding({ onBack }: BusinessOnboardingProps) {
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleDataExtracted = (data: ExtractedData) => {
    setExtractedData(data);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!extractedData) return;

    try {
      // Map ExtractedData fields to Business fields
      const businessPayload = {
        nombre_negocio: extractedData.nombre_negocio || 'Negocio sin nombre',
        nombre_dueno: extractedData.nombre_dueno || null,
        categoria_id: extractedData.categoria_id || 14, // Default abarrotes
        direccion: extractedData.direccion || 'Durango, Dgo.',
        horario: `${extractedData.horario.apertura || '08:00'} - ${extractedData.horario.cierre || '18:00'}`,
        telefono: extractedData.telefono || undefined,
        tags: extractedData.tags_sugeridos || [],
        latitud: extractedData.latitud || 24.027729,
        longitud: extractedData.longitud || -104.653027,
        descripcion: extractedData.descripcion || undefined
      };

      await saveBusiness(businessPayload);
      alert('¡Negocio registrado exitosamente! 🎉');
      onBack();
    } catch (e) {
      console.error('Error al guardar negocio:', e);
      alert('Hubo un error al registrar el negocio. Intente de nuevo.');
    }
  };

  const handleEdit = () => {
    setStep('input');
  };

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="bg-[#1e2530]/95 backdrop-blur border-b border-white/10 px-6 py-6 z-10 shrink-0 relative">
        <button
          onClick={onBack}
          className="absolute left-6 top-6 size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="size-5 text-slate-400" />
        </button>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Registrar Negocio</h1>
            <p className="text-sm text-slate-400 mt-1">
              {step === 'input' ? 'Cuéntanos sobre tu negocio' : 'Revisa y confirma la información'}
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center max-w-xl mx-auto">
            <div className={`flex items-center gap-2 ${step === 'input' ? 'text-white' : 'text-slate-400'}`}>
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'input' ? 'bg-white text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                <Mic className="size-3.5" />
              </div>
              <span className="text-xs font-medium">Cuéntanos</span>
            </div>
            
            <div className="flex-1 h-px bg-white/10 mx-4"></div>
            
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-white' : 'text-slate-500'}`}>
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'confirm' ? 'bg-white text-slate-900' : 'border border-slate-600'}`}>
                <CheckCircle className="size-3.5" />
              </div>
              <span className="text-xs font-medium">Confirmar</span>
            </div>
            
            <div className="flex-1 h-px bg-white/10 mx-4"></div>
            
            <div className="flex items-center gap-2 text-slate-500 opacity-50">
              <div className="size-6 rounded-full border border-slate-600 flex items-center justify-center text-xs font-bold">
                <Store className="size-3.5" />
              </div>
              <span className="text-xs font-medium">¡Listo!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {step === 'input' && (
          <VoiceInput onDataExtracted={handleDataExtracted} />
        )}
        {step === 'confirm' && extractedData && (
          <ConfirmationStep
            data={extractedData}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
