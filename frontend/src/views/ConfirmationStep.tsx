import { Check, Edit, MapPin, Clock, Phone, Mail, Tag, AlertCircle, Store } from 'lucide-react';
import type { ExtractedData } from './BusinessOnboarding';

interface ConfirmationStepProps {
  data: ExtractedData;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmationStep({ data, onConfirm, onEdit }: ConfirmationStepProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-4 justify-center text-center">
          <div className="size-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="size-5 text-slate-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              ¡Información Extraída!
            </h2>
            <p className="text-sm text-slate-300 font-light mt-0.5">
              Revisa que todo esté correcto antes de confirmar el registro
            </p>
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden border border-white/10 relative">
        <div className="bg-[#1e2530] h-48 flex items-center justify-center relative">
          {/* Mapa simulado - en producción usar Google Maps */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=24.0277,-104.653&zoom=15&size=800x400&sensor=false')" }}
          />
          <div className="absolute inset-0 bg-slate-900/40" />
          
          <div className="relative z-10 text-center text-white">
            <MapPin className="size-12 mx-auto mb-2 drop-shadow-lg" />
            <p className="text-base font-semibold">
              {data.direccion || 'Sin dirección'}
            </p>
            {data.latitud && data.longitud && (
              <p className="text-xs opacity-70 mt-1 font-mono">
                {data.latitud.toFixed(6)}, {data.longitud.toFixed(6)}
              </p>
            )}
          </div>
          {!data.direccion_completa && (
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-slate-200 border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-medium flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              Dirección parcial
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-lg border border-white/10 p-8 space-y-8">
        <div className="flex items-center gap-2 mb-6">
          <Store className="size-5 text-slate-400" />
          <h3 className="text-lg font-bold text-white">Información del Negocio</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <InfoField
            label="NOMBRE DEL NEGOCIO"
            value={data.nombre_negocio}
          />
          <InfoField
            label="PROPIETARIO"
            value={data.nombre_dueno}
          />
          <InfoField
            label="CATEGORÍA"
            value={
              data.categoria_id === 11 ? 'Antojitos' :
              data.categoria_id === 12 ? 'Mezcalerías' :
              data.categoria_id === 13 ? 'Artesanías' :
              data.categoria_id === 14 ? 'Abarrotes' : 'Desconocido'
            }
          />
          <InfoField
            label="DIRECCIÓN"
            value={data.direccion}
            icon={<MapPin className="size-3.5" />}
          />
          <InfoField
            label="TELÉFONO"
            value={data.telefono}
            icon={<Phone className="size-3.5" />}
          />
          <InfoField
            label="EMAIL"
            value={data.email}
            icon={<Mail className="size-3.5" />}
          />
        </div>

        {/* Horario */}
        {(data.horario.apertura || data.horario.cierre) && (
          <div className="pt-6 border-t border-white/10">
            <InfoField
              label="HORARIO DE ATENCIÓN"
              value={data.horario.apertura && data.horario.cierre
                ? `${data.horario.apertura} - ${data.horario.cierre}`
                : data.horario.apertura || data.horario.cierre || 'No especificado'
              }
              icon={<Clock className="size-3.5" />}
            />
            <p className="text-[11px] text-slate-500 mt-1">{data.horario.dias || 'Días no especificados'}</p>
          </div>
        )}

        {/* Tags */}
        {data.tags_sugeridos.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="size-4 text-slate-400" />
              <span className="font-semibold text-slate-300 text-sm">Etiquetas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags_sugeridos.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        {data.descripcion && (
          <div className="pt-6 border-t border-white/10">
            <span className="font-semibold text-slate-400 text-xs tracking-wider block mb-2">DESCRIPCIÓN</span>
            <p className="text-slate-300 text-sm italic font-light">&quot;{data.descripcion}&quot;</p>
          </div>
        )}
      </div>

      {/* Missing Info Warning */}
      {data.informacion_faltante.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400 text-sm mb-1">Información Incompleta</h4>
              <p className="text-[11px] text-yellow-400/80">
                Falta: {data.informacion_faltante.join(', ')}. Puedes completarla después.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onEdit}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <Edit className="size-4" />
          Editar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Check className="size-4" />
          Confirmar y Registrar
        </button>
      </div>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}

function InfoField({ label, value, icon }: InfoFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 text-slate-500">
        {icon}
        <span className="text-[10px] font-bold tracking-widest">{label}</span>
      </div>
      <p className={`text-sm ${value ? 'text-white font-medium' : 'text-slate-500 italic'}`}>
        {value || 'No especificado'}
      </p>
    </div>
  );
}
