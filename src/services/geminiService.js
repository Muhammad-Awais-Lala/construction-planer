import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

/**
 * Determines the closest supported aspect ratio based on input dimensions.
 * Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
 */
function getAspectRatio(width, length) {
  const ratio = width / length;

  if (ratio >= 1.5) return "16:9";
  if (ratio >= 1.15) return "4:3";
  if (ratio <= 0.6) return "9:16";
  if (ratio <= 0.85) return "3:4";
  return "1:1";
}

export const generateBlueprint = async (config) => {
  const aspectRatio = getAspectRatio(config.width, config.length);

  // Constructing the prompt
  const prompt = `
    Professional 2D architectural floor plan, top-down view, high definition CAD drawing.
    ${config.projectName ? `Project Name: ${config.projectName}` : ''}

    Specifications:
    - Overall Dimensions: ${config.width}ft width x ${config.length}ft length.
    - Rooms: ${config.bedrooms} Bedroom(s), ${config.bathrooms} Bathroom(s).
    - Kitchen Style: ${config.kitchenStyle}.
    - Features: ${config.livingArea ? 'Large Living Area, ' : ''}${config.garage ? 'Garage, ' : ''}Utility room, Entryway.

    Visual Style:
    ${config.theme === 'Technical CAD' ? 'Black and white technical line drawing, strict orthogonal lines, blueprint style, labeled dimensions, white background.' : ''}
    ${config.theme === 'Modern Blue' ? 'Classic architectural blueprint style, deep blue background (#004080) with white technical lines, clean minimalist aesthetic, standard architectural symbols.' : ''}
    ${config.theme === 'Architectural Sketch' ? 'Hand-drawn architectural sketch style, artistic pencil lines, but accurate layout.' : ''}

    Details to include:
    - Clear wall thicknesses.
    - Door swings indicated.
    - Window placements.
    - Basic furniture layout symbols.
    - Text labels for rooms.

    Additional Context: ${config.additionalNotes}

    Ensure the layout is logical, functional, and strictly 2D flat lay.
  `;

  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: "image/jpeg",
        personGeneration: "allow_adult",
      },
    });

    const generatedImage = response.generatedImages?.[0]?.image;

    if (!generatedImage || !generatedImage.imageBytes) {
      throw new Error("No image data received from the API.");
    }

    const base64Image = `data:image/jpeg;base64,${generatedImage.imageBytes}`;

    return {
      imageUrl: base64Image,
      promptUsed: prompt,
      timestamp: Date.now(),
      dimensions: {
        width: config.width,
        length: config.length
      }
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate blueprint image.");
  }
};
