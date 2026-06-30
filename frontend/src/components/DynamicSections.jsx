import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const justify = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const textAlign = {
  left: "left",
  center: "center",
  right: "right",
};

const DynamicSections = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/customizer/sections`);
        const data = await res.json();
        if (data.success) {
          setSections(data.sections.filter((s) => s.isVisible));
        }
      } catch (_) {}
    };
    load();
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const textPos = section.position || "center";
        const imgPos = section.imagePosition || "center";

        const bgStyle = section.bgImageUrl
          ? { backgroundImage: `url('${section.bgImageUrl}')`, backgroundSize: "cover", backgroundPosition: "center" }
          : section.bgColor
          ? { background: section.bgColor }
          : {};

        const images = [
          section.imageUrl,
          section.image2Url,
          section.image3Url,
          section.image4Url,
        ].filter(Boolean);

        const hasImages = images.length > 0;

        const gridCols =
          images.length === 1 ? "grid-cols-1"
          : images.length === 2 ? "grid-cols-2"
          : images.length === 3 ? "grid-cols-3"
          : "grid-cols-2 md:grid-cols-4";

        const imgMaxH = images.length === 1 ? "480px" : "300px";

        return (
          <section key={section.id} style={bgStyle}>
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 flex flex-col gap-10">

              {/* TEXT BLOCK */}
              {(section.type === "text" || section.type === "text_image") && (
                section.title || section.body
              ) && (
                <div className="flex" style={{ justifyContent: justify[textPos] }}>
                  <div className="max-w-2xl" style={{ textAlign: textAlign[textPos] }}>
                    {section.title && (
                      <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                        {section.title}
                      </h2>
                    )}
                    {section.body && (
                      <p className="text-base text-stoneLight whitespace-pre-line">
                        {section.body}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* IMAGE GRID */}
              {(section.type === "image" || section.type === "text_image") && hasImages && (
                <div className="flex flex-col" style={{ alignItems: justify[imgPos] }}>
                  <div
                    className={`grid ${gridCols} gap-4`}
                    style={{ width: imgPos === "center" ? "100%" : "auto", maxWidth: "100%" }}
                  >
                    {images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={section.title ? `${section.title} ${i + 1}` : `Image ${i + 1}`}
                        className="rounded-2xl w-full object-cover"
                        style={{ maxHeight: imgMaxH }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* VIDEO BLOCK */}
              {section.type === "video" && section.videoUrl && (
                <div className="flex flex-col items-center gap-6">
                  {section.title && (
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-center">
                      {section.title}
                    </h2>
                  )}
                  {section.body && (
                    <p className="text-base text-stoneLight text-center max-w-2xl whitespace-pre-line">
                      {section.body}
                    </p>
                  )}
                  <video
                    src={section.videoUrl}
                    controls
                    playsInline
                    className="w-full max-w-3xl rounded-2xl border border-border shadow-card"
                    style={{ maxHeight: "560px" }}
                  />
                </div>
              )}

            </div>
          </section>
        );
      })}
    </>
  );
};

export default DynamicSections;