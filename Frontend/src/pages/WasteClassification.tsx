import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, Recycle, Leaf, Cpu, Upload, CheckCircle2, 
  AlertCircle, Info, Camera, X, ArrowRight, Loader2, Activity, FlaskConical
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const wasteCategories = [
  { id: "recyclable", label: "Recyclable", icon: Recycle, color: "#3b82f6", bin: "Blue" },
  { id: "organic",    label: "Organic",    icon: Leaf,    color: "#10b981", bin: "Green" },
  { id: "e-waste",    label: "E-Waste",    icon: Cpu,     color: "#f59e0b", bin: "Yellow" },
  { id: "general",    label: "General",    icon: Trash2,  color: "#6b7280", bin: "Black" },
];

const defaultCategory = wasteCategories[3];

// Bin color → tailwind/hex mapping for the bin badge
const binColors: Record<string, string> = {
  Blue:   "#3b82f6",
  Green:  "#10b981",
  Yellow: "#f59e0b",
  Black:  "#6b7280",
  Red:    "#ef4444",
  Brown:  "#92400e",
};

const WasteClassification = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [result, setResult]               = useState<any>(null);
  const [apiError, setApiError]           = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
    analyzeWaste(file);
  };

  const analyzeWaste = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setApiError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://wasteclassificationan.onrender.com/classify-waste", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      // Map waste_type → category object
      const matchedCategory =
        wasteCategories.find(
          (cat) =>
            data.waste_type &&
            (cat.id === data.waste_type.toLowerCase() ||
              cat.label.toLowerCase() === data.waste_type.toLowerCase())
        ) ?? defaultCategory;

      // Split disposal_instruction into an array of steps (split by ". " or newline)
      const disposalSteps: string[] = data.disposal_instruction
        ? data.disposal_instruction
            .split(/(?<=\.)\s+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        : ["Follow local waste disposal guidelines."];

      setResult({
        isWaste:             data.is_waste,
        category:            matchedCategory,
        wasteType:           data.waste_type       ?? matchedCategory.label,
        recommendedBin:      data.recommended_bin  ?? matchedCategory.bin,
        decompositionMethod: data.decomposition_method ?? "",
        disposalSteps,
      });

    } catch (err: any) {
      console.error("Classification error:", err);
      setApiError(err.message || "Classification failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setApiError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 shadow-2xl shadow-primary/20"
        >
          <Activity className="w-4 h-4 animate-pulse" />
          Neural Material Analysis Protocol
        </motion.div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-foreground uppercase tracking-tight italic">
              WASTE <span className="text-gradient-secondary">IDENTIFIER</span>
            </h1>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-70">
              Deploying computer vision for automated material categorization and optimization.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Upload Section ── */}
        <div className="space-y-6">
          <GlassCard
            className="relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors gradient-border"
            hover={false}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            <AnimatePresence mode="wait">
              {!selectedImage ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-8"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Snap or Upload Waste</h3>
                  <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">
                    Our AI will analyze the item and tell you exactly how to dispose of it sustainably.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full flex items-center justify-center p-4"
                >
                  <img
                    src={selectedImage}
                    alt="Selected waste"
                    className="max-h-[350px] w-full object-contain rounded-xl shadow-2xl"
                  />

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                        />
                      </div>
                      <p className="mt-4 font-semibold text-primary animate-pulse">Analyzing Material...</p>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <button
                      onClick={reset}
                      className="absolute top-6 right-6 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors shadow-lg z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* API error banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category legend */}
          <div className="grid grid-cols-2 gap-4">
            {wasteCategories.map((cat) => (
              <div key={cat.id} className="card-3d">
              <GlassCard className="p-4 gradient-border" delay={0.1}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                    <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{cat.label}</div>
                    <div className="text-xs text-muted-foreground">{cat.bin} bin</div>
                  </div>
                </div>
              </GlassCard>
              </div>
            ))}
          </div>
        </div>

        {/* ── Results Section ── */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Classification header card */}
                <GlassCard
                  glowColor={
                    result.category.id === 'recyclable' ? 'primary'
                    : result.category.id === 'organic'   ? 'secondary'
                    : 'warning'
                  }
                  className="p-8 border-white/10 gradient-border"
                >
                  <div className="flex items-center gap-3 text-primary mb-6">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Analysis Complete</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    {/* Category */}
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <result.category.icon className="w-8 h-8" style={{ color: result.category.color }} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Material ID</div>
                        <div className="text-3xl font-black uppercase tracking-tight italic" style={{ color: result.category.color }}>
                          {result.wasteType}
                        </div>
                      </div>
                    </div>

                    {/* Recommended bin badge */}
                    <div
                      className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl border-2 shadow-2xl transition-all hover:scale-105"
                      style={{
                        borderColor: `${binColors[result.recommendedBin] ?? "#6b7280"}30`,
                        backgroundColor: `${binColors[result.recommendedBin] ?? "#6b7280"}10`,
                        color: binColors[result.recommendedBin] ?? "#6b7280",
                        boxShadow: `0 0 30px ${binColors[result.recommendedBin] ?? "#6b7280"}15`
                      }}
                    >
                      <Trash2 className="w-5 h-5 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-0.5">Disposal Node</span>
                      <span className="text-lg font-black uppercase">{result.recommendedBin} Bin</span>
                    </div>
                  </div>

                  {/* Disposal steps */}
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 relative overflow-hidden group/steps">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/steps:scale-125 transition-transform duration-700">
                      <CheckCircle2 className="w-24 h-24 text-primary" />
                    </div>
                    
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-5 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Protocol Steps
                    </h4>
                    <div className="space-y-4 relative z-10">
                      {result.disposalSteps.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-4 group/step">
                          <div className="mt-1 w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary group-hover/step:bg-primary group-hover/step:text-primary-foreground transition-all">
                            {i + 1}
                          </div>
                          <p className="text-[13px] font-bold text-muted-foreground leading-relaxed group-hover/step:text-foreground transition-colors uppercase tracking-tight">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Decomposition method card */}
                {result.decompositionMethod && (
                  <GlassCard className="p-8 border-white/5 gradient-border" hover={false}>
                    <div className="flex items-center gap-3 text-primary mb-4">
                      <FlaskConical className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Chemical Breakdown</span>
                    </div>
                    <p className="text-[13px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                      {result.decompositionMethod}
                    </p>
                  </GlassCard>
                )}

                {/* Why it matters */}
                <GlassCard className="p-8 border-warning/20 bg-warning/5 gradient-border" hover={false}>
                  <div className="flex items-center gap-3 text-warning mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Planetary Impact</span>
                  </div>
                  <p className="text-[13px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                    Proper waste classification reduces landfill overflow by up to 60%. Disposing of{" "}
                    <span className="text-foreground">{result.wasteType.toLowerCase()}</span> waste correctly reduces methane
                    emissions and supports the global circular economy protocol.
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-[3rem] group"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 relative">
                  <Activity className="w-10 h-10 text-muted-foreground opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 border border-primary/20 rounded-[2rem] animate-[spin_10s_linear_infinite]" />
                </div>
                <h3 className="text-[14px] font-black text-foreground uppercase tracking-[0.4em] mb-3">Awaiting Uplink</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] max-w-[240px] opacity-60">
                  Transmit visual data to initialize neural classification grid.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WasteClassification;