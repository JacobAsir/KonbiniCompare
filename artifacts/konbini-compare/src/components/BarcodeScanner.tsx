import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
        });

        const detectLoop = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCamera();
              onScan(code);
              return;
            }
          } catch {
            // Detection failed this frame; continue
          }
          if (streamRef.current) requestAnimationFrame(detectLoop);
        };

        setTimeout(detectLoop, 500);
      } else {
        setError(t("barcodeNotSupportedError"));
      }
    } catch {
      setScanning(false);
      setError(t("cameraDeniedError"));
    }
  }, [onScan, stopCamera, t]);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (code.length >= 8) {
      stopCamera();
      onScan(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">{t("scannerHeading")}</h2>
        <button
          onClick={() => { stopCamera(); onClose(); }}
          className="p-2 hover:bg-muted rounded-lg"
          aria-label={t("scannerCloseAria")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
        {scanning ? (
          <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-1/3 border-2 border-primary rounded-lg opacity-70" />
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-xs text-white bg-black/50 px-3 py-1 rounded-full">
                {t("scannerInstruction")}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">{t("scannerPrompt")}</p>
            <Button onClick={startCamera} className="gap-2">
              <Camera className="h-4 w-4" /> {t("openCamera")}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-amber-600 text-center max-w-sm">{error}</p>}

        <div className="w-full max-w-sm space-y-2 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">{t("manualEntryPrompt")}</p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              placeholder={t("manualEntryPlaceholder")}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center tracking-wider"
              maxLength={14}
            />
            <Button onClick={handleManualSubmit} disabled={manualCode.trim().length < 8} size="sm">
              {t("lookUp")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
