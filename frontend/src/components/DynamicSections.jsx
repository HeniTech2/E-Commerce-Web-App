import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const justifyForPosition = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const textAlignForPosition = {
  left: "left",
  center: "center",
  right: "right",
};

/**
 * Renders all visible custom Page Sections created in the admin Customizer,
 * in their saved order, each with its own background color/image and
 * left/center/right content alignment.
 */
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
      } catch (_) {
        // silently ignore — custom sections are optional content
      }
    };
    load();
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const position = section.position || "center";
        const bgStyle = section.bgImageUrl
          ? {
              backgroundImage: `url('${section.bgImageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : section.bgColor
          ? { background: section.bgColor }
          : {};

        return (
          <section key={section.id} style={bgStyle}>
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
              <div
                className="flex flex-col gap-6"
                style={{
                  alignItems: justifyForPosition[position],
                  textAlign: textAlignForPosition[position],
                }}
              >
                {(section.type === "image" || section.type === "text_image") && section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={section.title || ""}
                    className="rounded-2xl max-h-96 w-full md:w-2/3 object-cover"
                  />
                )}
                {(section.type === "text" || section.type === "text_image") && (
                  <div className="max-w-2xl">
                    {section.title && (
                      <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{section.title}</h2>
                    )}
                    {section.body && (
                      <p className="text-base text-stoneLight whitespace-pre-line">{section.body}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default DynamicSections;