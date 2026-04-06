
import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { generateSignImage } from './services/geminiService';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Settings2, 
  Layers, 
  Lightbulb, 
  Anchor,
  Layout,
  Type,
  Save,
  CheckCircle2,
  Rotate3d,
  Image as ImageIcon,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, useTexture, Environment, SpotLight, Text3D, Center, Sparkles as DreiSparkles } from '@react-three/drei';
import * as THREE from 'three';

const OPTIONS = {
  formato: ['3D Block', '2D Plano', 'Circular', 'Nube', 'Rectangular'],
  material: ['Aluminio', 'Acero', 'Acrílico', 'Madera', 'Neón-Flex'],
  acabado: ['Dorado Espejo', 'Plata Cepillada', 'Negro Mate', 'Cromo', 'Blanco'],
  iluminacion: ['Halo Glow (Retro)', 'Brillo Interno', 'Canto Iluminado', 'Sin Luz'],
  superficie: ['Concreto', 'Ladrillo Negro', 'Mármol', 'Madera Listonada'],
  soporte: ['Montaje Directo', 'Base de Acrílico'],
  neonColors: ['Cyan', 'Magenta', 'Amarillo', 'Verde', 'Rojo', 'Blanco']
};

const LOADING_STEPS = [
  "Iniciando motores de renderizado",
  "Esculpiendo silueta de precisión",
  "Generando contornos de acrílico",
  "Aplicando materiales premium",
  "Calculando iluminación dramática"
];

const STORAGE_KEY = 'aram_visualizer_config';

interface Sign3DProps {
  imageUrl: string | null;
  thickness: number;
  material: string | null;
  acabado: string | null;
  luz: string | null;
  intensity: number;
  neonColor: string | null;
}

const AramStudio3D = () => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        <Center>
          <Text3D
            font="https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_bold.typeface.json"
            size={1.2}
            height={0.3}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            ARAM STUDIO
            <meshStandardMaterial 
              ref={materialRef}
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </Text3D>
        </Center>
      </group>
      <DreiSparkles count={150} scale={15} size={2} speed={0.4} opacity={0.4} color="#ffffff" />
    </Float>
  );
};

const Sign3D = ({ imageUrl, thickness, material, acabado, luz, intensity, neonColor }: Sign3DProps) => {
  // Use a fallback texture if none provided
  const texture = useTexture(imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000');
  const depth = thickness / 60; 
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Compute live material properties for immediate visual feedback
  const materialProps = useMemo(() => {
    let color = new THREE.Color('#ffffff');
    let metalness = 0.5;
    let roughness = 0.5;
    let emissive = new THREE.Color('#000000');
    let emissiveIntensity = 0;
    let opacity = 1;
    let transparent = false;

    // Lógica de Material base
    switch (material) {
      case 'Aluminio': metalness = 0.8; roughness = 0.2; color.set('#bdc3c7'); break;
      case 'Acero': metalness = 1; roughness = 0.1; color.set('#ecf0f1'); break;
      case 'Acrílico': metalness = 0.1; roughness = 0.05; opacity = 0.6; transparent = true; color.set('#ffffff'); break;
      case 'Madera': metalness = 0; roughness = 0.8; color.set('#8d6e63'); break;
      case 'Neón-Flex': emissive.set('#00d2ff'); emissiveIntensity = 2; break;
    }

    // Lógica de Acabado (sobrescribe propiedades)
    switch (acabado) {
      case 'Dorado Espejo': color.set('#D4AF37'); metalness = 1; roughness = 0.05; break;
      case 'Plata Cepillada': color.set('#dfe6e9'); metalness = 0.9; roughness = 0.3; break;
      case 'Negro Mate': color.set('#1a1a1a'); metalness = 0.1; roughness = 0.9; break;
      case 'Cromo': color.set('#ffffff'); metalness = 1; roughness = 0; break;
      case 'Blanco': color.set('#f5f5f5'); metalness = 0; roughness = 0.2; break;
    }

    // Lógica de Iluminación en tiempo real
    if (luz && luz !== 'Sin Luz') {
      emissiveIntensity = (intensity / 100) * 1.5;
      if (luz === 'Brillo Interno') emissive.set('#ffffff');
      else if (luz === 'Halo Glow (Retro)') emissive.set('#ffcc00');
      else if (luz === 'Canto Iluminado') emissive.set('#ffffff');
    }

    if (neonColor) {
      let nColor = '#ffffff';
      switch(neonColor) {
        case 'Cyan': nColor = '#00ffff'; break;
        case 'Magenta': nColor = '#ff00ff'; break;
        case 'Amarillo': nColor = '#ffff00'; break;
        case 'Verde': nColor = '#00ff00'; break;
        case 'Rojo': nColor = '#ff0000'; break;
        case 'Blanco': nColor = '#ffffff'; break;
      }
      emissive.set(nColor);
      emissiveIntensity = Math.max(emissiveIntensity, 2.5);
    }

    return { color, metalness, roughness, emissive, emissiveIntensity, opacity, transparent };
  }, [material, acabado, luz, intensity, neonColor]);

  useFrame((state) => {
    // Pulsing glow effect
    if (materialRef.current && luz && luz !== 'Sin Luz') {
      const baseIntensity = (intensity / 100) * 1.5;
      materialRef.current.emissiveIntensity = baseIntensity * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
    
    // Gentle rotation effect
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 0.1;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} rotation={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 4.05, depth]} />
        {/* Front face: The texture + dynamic adjustments */}
        <meshPhysicalMaterial 
          ref={materialRef}
          attach="material-4" 
          map={texture} 
          color={materialProps.color}
          roughness={materialProps.roughness} 
          metalness={materialProps.metalness} 
          emissive={materialProps.emissive}
          emissiveIntensity={materialProps.emissiveIntensity}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent={materialProps.transparent}
          opacity={materialProps.opacity}
          envMapIntensity={2}
        />
        {/* Sides - Dinámicos según material */}
        {[0, 1, 2, 3].map((i) => (
          <meshPhysicalMaterial 
            key={i}
            attach={`material-${i}`} 
            color={materialProps.color} 
            roughness={materialProps.roughness} 
            metalness={materialProps.metalness} 
            reflectivity={1}
            transparent={materialProps.transparent}
            opacity={materialProps.opacity}
          />
        ))}
        {/* Back */}
        <meshStandardMaterial attach="material-5" color="#050505" />
      </mesh>
    </Float>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [isUsingPersonalKey, setIsUsingPersonalKey] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  
  const [lightIntensity, setLightIntensity] = useState(80);
  const [logoThickness, setLogoThickness] = useState(50);

  const [selFormato, setSelFormato] = useState<string | null>(null);
  const [selMaterial, setSelMaterial] = useState<string | null>(null);
  const [selAcabado, setSelAcabado] = useState<string | null>(null);
  const [selLuz, setSelLuz] = useState<string | null>(null);
  const [selSuperficie, setSelSuperficie] = useState<string | null>(null);
  const [selSoporte, setSelSoporte] = useState<string | null>('Montaje Directo');
  const [neonColor, setNeonColor] = useState<string | null>(null);
  const [neonThickness, setNeonThickness] = useState(5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.selFormato !== undefined) setSelFormato(config.selFormato);
        if (config.selMaterial !== undefined) setSelMaterial(config.selMaterial);
        if (config.selAcabado !== undefined) setSelAcabado(config.selAcabado);
        if (config.selLuz !== undefined) setSelLuz(config.selLuz);
        if (config.selSuperficie !== undefined) setSelSuperficie(config.selSuperficie);
        if (config.selSoporte !== undefined) setSelSoporte(config.selSoporte);
        if (config.neonColor !== undefined) setNeonColor(config.neonColor);
        if (config.neonThickness !== undefined) setNeonThickness(config.neonThickness);
        if (config.lightIntensity !== undefined) setLightIntensity(config.lightIntensity);
        if (config.logoThickness !== undefined) setLogoThickness(config.logoThickness);
        if (config.descripcion !== undefined) setDescripcion(config.descripcion);
      } catch (e) {
        console.error("Error loading config", e);
      }
    }

    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setIsUsingPersonalKey(hasKey);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const saveConfiguration = () => {
    const config = {
      selFormato, selMaterial, selAcabado, selLuz, selSuperficie, 
      selSoporte, lightIntensity, logoThickness, descripcion,
      neonColor, neonThickness
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleToggle = (current: string | null, setter: (v: string | null) => void, value: string) => {
    setter(current === value ? null : value);
    // Si ya existe un render, forzamos la vista 3D para ver el cambio instantáneo
    if (resultImage) {
      setViewMode('3D');
    }
  };

  const handleGenerate = async () => {
    if (!descripcion.trim() && !uploadedImage && !selFormato && !selMaterial) return;
    setLoading(true);

    const prompt = `
      RENDER FOTORREALISTA PROFESIONAL - ARAM STUDIO:
      - SOPORTE REQUERIDO: ${selSoporte === 'Montaje Directo' 
          ? 'SOLO LETRAS SOBRE LA PARED. PROHIBIDO AÑADIR PLACAS O BASES.' 
          : 'EL ACRÍLICO TRANSPARENTE DEBE APLICARSE COMO UN CONTORNO ALREDEDOR DE TODO EL DISEÑO Y LAS LETRAS. El acrílico sigue fielmente la silueta como un borde.'}.
      - DISEÑO: MANTENER LA FUENTE ORIGINAL AL 100% SIN ALTERACIONES. PROHIBIDO CAMBIAR TIPOGRAFÍA.
      - MATERIAL: ${selMaterial || 'Acero'} con acabado ${selAcabado || 'Espejo'}.
      - VOLUMEN: Profundidad de relieve de ${logoThickness}mm.
      - LUZ: ${selLuz ? `${selLuz} al ${lightIntensity}%` : 'Iluminación de estudio dramática'}.
      ${neonColor ? `- CONTORNO NEÓN: Aplicar un tubo de luz neón brillante color ${neonColor} delineando el contorno de las letras/logo, con un grosor de ${neonThickness}mm.` : ''}
      - FONDO: Pared de ${selSuperficie || 'Mármol negro pulido'}.
      - ADICIONAL: ${descripcion}.
      - NOTA: Renderizar con iluminación dramática de foco cenital y sombras suaves.
    `;

    try {
      const rawImageUrl = await generateSignImage(prompt, uploadedImage || undefined, isUsingPersonalKey);
      if (rawImageUrl) {
        setResultImage(rawImageUrl);
        setViewMode('2D');
      }
    } catch (err) {
      console.error(err);
      alert("Error al generar el render. Verifica tu conexión o API Key.");
    } finally {
      setLoading(false);
    }
  };

  const OptionGroup = ({ label, icon: Icon, options, current, setter }: any) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className="w-3 h-3 text-white" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleToggle(current, setter, opt)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all duration-500 border ${
              current === opt 
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background 3D Canvas (ARAM STUDIO) */}
      {!resultImage && !loading && (
        <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-60">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
            <Environment preset="city" />
            <AramStudio3D />
          </Canvas>
        </div>
      )}

      <main className="relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-8">
        
        <aside className="w-full max-w-[500px] lg:w-[450px] shrink-0 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar p-6 lg:p-10 animated-border-box mx-auto order-2 lg:order-1">
          <div className="relative z-10 space-y-10">
            <header className="space-y-4 text-center">
              <h1 className="text-4xl font-black text-white tracking-tighter">ARAM STUDIO</h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-[9px] font-black uppercase tracking-[1.2em] text-zinc-500">Luxury Sign Engine</p>
                <button 
                  onClick={saveConfiguration}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all active:scale-95 bg-black/50"
                >
                  <Save className="w-3 h-3 text-white" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Guardar</span>
                </button>
              </div>
            </header>

            <div className="space-y-10">
              {/* Live Indicator */}
              <div className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-xl transition-all duration-500 ${resultImage ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 opacity-50'}`}>
                <div className={`w-2 h-2 rounded-full bg-white ${resultImage ? 'animate-pulse' : ''}`}></div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                  {resultImage ? 'Modo Preview Live Activo' : 'Esperando Render Base'}
                </p>
              </div>

              <div className="space-y-8">
                <OptionGroup label="Modo de Montaje" icon={Anchor} options={OPTIONS.soporte} current={selSoporte} setter={setSelSoporte} />
                <OptionGroup label="Formato de Anuncio" icon={Layout} options={OPTIONS.formato} current={selFormato} setter={setSelFormato} />
                <OptionGroup label="Material Principal" icon={Layers} options={OPTIONS.material} current={selMaterial} setter={(v: string | null) => handleToggle(selMaterial, setSelMaterial, v)} />
                <OptionGroup label="Acabado Superficial" icon={Sparkles} options={OPTIONS.acabado} current={selAcabado} setter={(v: string | null) => handleToggle(selAcabado, setSelAcabado, v)} />
                <OptionGroup label="Efecto Neón / Luz" icon={Lightbulb} options={OPTIONS.iluminacion} current={selLuz} setter={(v: string | null) => handleToggle(selLuz, setSelLuz, v)} />
                <OptionGroup label="Contorno Neón" icon={Zap} options={OPTIONS.neonColors} current={neonColor} setter={(v: string | null) => handleToggle(neonColor, setNeonColor, v)} />
                <OptionGroup label="Pared de Fondo" icon={Settings2} options={OPTIONS.superficie} current={selSuperficie} setter={setSelSuperficie} />
              </div>

              <div className="space-y-8 pt-6 border-t border-white/10">
                {neonColor && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                      <span>Grosor Neón (mm)</span>
                      <span className="text-white">{neonThickness}mm</span>
                    </div>
                    <input type="range" min="1" max="20" value={neonThickness} onChange={(e) => setNeonThickness(parseInt(e.target.value))} className="w-full" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                    <span>Intensidad Lumínica</span>
                    <span className="text-white">{lightIntensity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={lightIntensity} onChange={(e) => setLightIntensity(parseInt(e.target.value))} className="w-full" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                    <span>Grosor del Logo/Letrero (mm)</span>
                    <span className="text-white">{logoThickness}mm</span>
                  </div>
                  <input type="range" min="5" max="200" value={logoThickness} onChange={(e) => setLogoThickness(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1 justify-center">
                    <Type className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Instrucciones de Fabricación</span>
                  </div>
                  <textarea 
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe detalles únicos para tu letrero..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm font-light text-zinc-300 outline-none focus:border-white/30 transition-all min-h-[120px] resize-none"
                  />
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-32 rounded-2xl border border-dashed border-white/20 hover:border-white/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-white/[0.02]"
                >
                  {uploadedImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={uploadedImage} alt="Logo" className="h-10 object-contain" />
                      <span className="text-[8px] font-black uppercase text-white">Diseño Cargado</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Cargar Logotipo</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setUploadedImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.8em] hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? "PROCESANDO..." : (
                  <>
                    GENERAR RENDER
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {(resultImage || loading) && (
          <section className="w-full flex-1 relative flex items-center justify-center min-h-[500px] lg:min-h-[calc(100vh-4rem)] order-1 lg:order-2">
            {resultImage && !loading && (
              <div className="absolute top-4 lg:top-12 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl z-50">
                <button 
                  onClick={() => setViewMode('2D')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === '2D' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  <ImageIcon className="w-3 h-3" />
                  Imagen 2D
                </button>
                <button 
                  onClick={() => setViewMode('3D')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === '3D' ? 'bg-white text-black shadow-lg shadow-white/20' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Rotate3d className="w-3 h-3" />
                  Modelo 3D
                </button>
              </div>
            )}

            {showSavedToast && (
              <div className="absolute top-20 lg:top-28 left-1/2 -translate-x-1/2 bg-black/90 border border-white/50 px-6 py-3 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 z-50">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Preferencias Guardadas</span>
              </div>
            )}

            {loading ? (
              <div className="text-center space-y-8 relative z-10 bg-black/50 p-10 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="w-12 h-12 border border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[1em] text-white">Aram Studio V6</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{LOADING_STEPS[loadingStep]}</p>
                </div>
              </div>
            ) : resultImage ? (
              <div className="relative group w-full h-full max-w-6xl flex items-center justify-center animate-in fade-in zoom-in duration-700 mt-16 lg:mt-0">
                {viewMode === '2D' ? (
                  <div className="relative w-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10">
                    <img src={resultImage} alt="Aram Render High Definition" className="w-full h-auto" />
                    <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 flex flex-col gap-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500">
                      <a 
                        href={resultImage} 
                        download="Aram-Luxury-Sign-Render.png" 
                        className="bg-white text-black px-6 py-4 lg:px-8 lg:py-5 rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:scale-105 hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                      >
                        <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                        Descargar Render HQ
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[500px] lg:h-[800px] bg-black rounded-[40px] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing relative">
                    <Suspense fallback={null}>
                      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
                        <PerspectiveCamera makeDefault position={[0, 0, 11]} fov={38} />
                        
                        <ambientLight intensity={0.2} />
                        <SpotLight 
                          position={[15, 20, 15]} 
                          angle={0.2} 
                          penumbra={1} 
                          intensity={3} 
                          castShadow 
                          color="#ffffff"
                        />
                        <pointLight position={[-12, 8, 8]} intensity={2} color="#ffffff" />
                        <pointLight position={[5, -10, 5]} intensity={1} color="#ffffff" />

                        <Environment preset="night" />
                        
                        <Sign3D 
                          imageUrl={resultImage} 
                          thickness={logoThickness} 
                          material={selMaterial}
                          acabado={selAcabado}
                          luz={selLuz}
                          intensity={lightIntensity}
                          neonColor={neonColor}
                        />
                        
                        <ContactShadows position={[0, -4.5, 0]} opacity={0.7} scale={25} blur={3} far={6} />
                        
                        <OrbitControls 
                          enablePan={false} 
                          enableZoom={true} 
                          minPolarAngle={Math.PI / 4} 
                          maxPolarAngle={Math.PI / 1.5} 
                          autoRotate
                          autoRotateSpeed={0.4}
                        />
                      </Canvas>
                    </Suspense>
                    
                    {/* Floating Action Menu in 3D Mode */}
                    <div className="absolute top-6 right-6 lg:top-10 lg:right-10 flex flex-col gap-3">
                      <a 
                        href={resultImage} 
                        download="Aram-Luxury-Sign-Render.png" 
                        className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 lg:p-4 rounded-full text-white hover:border-white transition-all"
                        title="Descargar Base"
                      >
                        <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                      </a>
                    </div>

                    <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 lg:px-6 lg:py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
                      <Zap className="w-3 h-3 text-white animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Preview dinámico en tiempo real</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
