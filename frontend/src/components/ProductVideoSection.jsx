import { useRef, useState } from "react";
import { HiPlayCircle, HiPause, HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

/**
 * ProductVideoSection
 * A dedicated, full-featured video section shown on the product detail page.
 * Pass `videoUrl` (string) and `productName` (string).
 */
const ProductVideoSection = ({ videoUrl, productName }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!videoUrl) return null;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const handleEnded = () => setPlaying(false);

  return (
    <div className="mt-16 border-t border-border pt-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-6 rounded-full bg-primary block" />
        <h2 className="font-display text-2xl font-bold">Product Video</h2>
      </div>

      {/* Compact preview — click to expand */}
      {!expanded ? (
        <div
          className="relative rounded-2xl overflow-hidden border border-border cursor-pointer group shadow-card"
          onClick={() => {
            setExpanded(true);
            setTimeout(() => {
              videoRef.current?.play();
              setPlaying(true);
            }, 100);
          }}
        >
          <video
            src={videoUrl}
            className="w-full max-h-72 object-cover"
            muted
            playsInline
            preload="metadata"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
              <HiPlayCircle className="text-white" size={40} />
            </div>
            <p className="text-white text-sm font-semibold tracking-wide">
              Watch {productName} in action
            </p>
          </div>
        </div>
      ) : (
        /* Expanded player */
        <div className="relative rounded-2xl overflow-hidden border border-primary shadow-dropdown bg-black">
          {/* Close button */}
          <button
            onClick={() => {
              videoRef.current?.pause();
              setPlaying(false);
              setExpanded(false);
            }}
            className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
          >
            <HiXMark size={16} />
          </button>

          {/* Video element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[480px] object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            playsInline
          />

          {/* Custom controls bar */}
          <div className="bg-black/80 px-4 py-3 flex flex-col gap-2">
            {/* Progress bar */}
            <div
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Buttons row */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <HiPause size={22} /> : <HiPlayCircle size={22} />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <HiVolumeOff size={20} /> : <HiVolumeUp size={20} />}
              </button>
              <span className="text-white/60 text-xs ml-auto">
                {productName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVideoSection;