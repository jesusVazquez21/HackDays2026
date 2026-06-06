import { Check, Edit, MapPin, Clock, Phone, Mail, Tag, AlertCircle } from 'lucide-react';
import type { ExtractedData } from './BusinessOnboarding';

interface ConfirmationStepProps {
  data: ExtractedData;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmationStep({ data, onConfirm, onEdit }: ConfirmationStepProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Información Extraída!
            </h2>
            <p className="text-gray-600">
              Revisa que todo esté correcto antes de confirmar el registro
            </p>
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-purple-600 to-orange-600 h-64 flex items-center justify-center relative">
          {/* Mapa simulado - en producción usar Google Maps */}
          <div className="absolute inset-0 bg-gray-200 opacity-50" />
          <div className="relative z-10 text-center text-white">
            <MapPin className="size-16 mx-auto mb-4 drop-shadow-lg" />
            <p className="text-lg font-semibold">
              {data.direccion || 'Sin dirección'}
            </p>
            {data.latitud && data.longitud && (
              <p className="text-sm opacity-90 mt-2">
                {data.latitud.toFixed(6)}, {data.longitud.toFixed(6)}
              </p>
            )}
          </div>
          {!data.direccion_completa && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4" />
              Dirección incompleta
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Información del Negocio</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <InfoField
            label="Nombre del Negocio"
            value={data.nombre_negocio}
            icon={<Tag className="size-5" />}
          />
          <InfoField
            label="Propietario"
            value={data.nombre_dueno}
            icon={<Tag className="size-5" />}
          />
          <InfoField
            label="Categoría"
            value={
              data.categoria_id === 11 ? 'Antojitos' :
              data.categoria_id === 12 ? 'Mezcalerías' :
              data.categoria_id === 13 ? 'Artesanías' :
              data.categoria_id === 14 ? 'Abarrotes' : 'Desconocido'
            }
            icon={<Tag className="size-5" />}
          />
          <InfoField
            label="Dirección"
            value={data.direccion}
            icon={<MapPin className="size-5" />}
          />
          <InfoField
            label="Teléfono"
            value={data.telefono}
            icon={<Phone className="size-5" />}
          />
          <InfoField
            label="Email"
            value={data.email}
            icon={<Mail className="size-5" />}
          />
        </div>

        {/* Horario */}
        {(data.horario.apertura || data.horario.cierre) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="size-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Horario de Atención</span>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-gray-900">
                {data.horario.apertura && data.horario.cierre
                  ? `${data.horario.apertura} - ${data.horario.cierre}`
                  : data.horario.apertura || data.horario.cierre || 'No especificado'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{data.horario.dias || 'Días no especificados'}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {data.tags_sugeridos.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Tag className="size-5 text-orange-600" />
              <span className="font-semibold text-gray-900">Categorías Sugeridas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags_sugeridos.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        {data.descripcion && (
          <div className="pt-4 border-t border-gray-200">
            <span className="font-semibold text-gray-900 block mb-2">Descripción</span>
            <p className="text-gray-600 italic">&quot;{data.descripcion}&quot;</p>
          </div>
        )}
      </div>

      {/* Missing Info Warning */}
      {data.informacion_faltante.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Información Incompleta</h4>
              <p className="text-sm text-yellow-700">
                Falta: {data.informacion_faltante.join(', ')}. Puedes completarla después desde tu perfil.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onEdit}
          className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <Edit className="size-5" />
          Editar Información
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Check className="size-5" />
          Confirmar y Registrar
        </button>
      </div>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}

function InfoField({ label, value, icon }: InfoFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={`text-base ${value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
        {value || 'No especificado'}
      </p>
    </div>
  );
}
