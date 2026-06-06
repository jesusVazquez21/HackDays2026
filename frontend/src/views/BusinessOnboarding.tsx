import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registro de Negocio</h1>
            <p className="text-sm text-gray-500">
              {step === 'input' ? 'Cuéntanos sobre tu negocio' : 'Confirma la información'}
            </p>
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
