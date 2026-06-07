import { MapPin, Store, Sparkles, Mic } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: 'register' | 'discover') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="size-full flex flex-col items-center justify-center p-8 z-10 relative">
      <div className="max-w-4xl w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-slate-300 text-sm font-medium border border-white/10 backdrop-blur-sm shadow-sm">
            <Sparkles className="size-4" />
            Hackathon Durango 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Consume Local<br />Conectando el Barrio
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre los negocios tradicionales de Durango, apoya a los
            comerciantes locales y haz crecer tu comunidad desde el barrio.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Discover Card */}
          <button
            onClick={() => onNavigate('discover')}
            className="group text-left relative overflow-hidden bg-white/5 backdrop-blur-md rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 border border-white/10 hover:border-white/20"
          >
            <div className="relative z-10 space-y-6">
              <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="size-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-wide">Descubrir</h2>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  Explora antojitos, mezcalerías, artesanías y más. Encuentra los mejores lugares cerca de ti.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-[11px] font-medium border border-white/10">
                  Antojitos
                </span>
                <span className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-[11px] font-medium border border-white/10">
                  Mezcal
                </span>
                <span className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-[11px] font-medium border border-white/10">
                  Artesanías
                </span>
              </div>
            </div>
          </button>

          {/* Register Card */}
          <button
            onClick={() => onNavigate('register')}
            className="group text-left relative overflow-hidden bg-white/5 backdrop-blur-md rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 border border-white/10 hover:border-white/20"
          >
            <div className="relative z-10 space-y-6">
              <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="size-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-wide">Registrar Negocio</h2>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  Registra tu comercio en minutos con IA. Solo habla y nosotros nos encargamos del resto.
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-[11px] font-medium pt-3">
                <div className="flex items-center gap-1.5"><Mic className="size-3.5" /> Voz</div>
                <span className="text-slate-500">•</span>
                <div className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> IA</div>
                <span className="text-slate-500">•</span>
                <div>&lt; 2 min</div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Stats */}
        <div className="space-y-8 pt-8">
          <div className="flex justify-center items-center gap-16 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">4+</div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">Negocios</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">Categorías</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">1</div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">Comunidad</div>
            </div>
          </div>
          
          <div className="text-center text-[10px] text-slate-500 font-medium tracking-wider">
            Hecho con ❤️ para Durango • Hackathon 2026
          </div>
        </div>

      </div>
    </div>
  );
}
