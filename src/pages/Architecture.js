import React, { useState, useCallback } from 'react';
import { LayoutDashboard, PenTool, Download, Share2, Info } from 'lucide-react';
import { generateBlueprint } from '../services/geminiService';
import { BlueprintForm } from '../components/BlueprintForm';
import { BlueprintDisplay } from '../components/BlueprintDisplay';

export default function Architecture() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = useCallback(async (config) => {
        setIsGenerating(true);
        setError(null);
        setGeneratedResult(null);

        try {
            const result = await generateBlueprint(config);
            setGeneratedResult(result);
        } catch (err) {
            console.error("Generation failed:", err);
            setError(err.message || "Failed to generate blueprint. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return (
        <div className="d-flex flex-column vh-100 bg-dark position-relative bg-grid-pattern">

            {/* Header */}
            <header className="flex-shrink-0 d-flex align-items-center justify-content-between px-4 py-2 border-bottom border-secondary bg-dark bg-opacity-75 backdrop-blur-custom z-index-10">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-primary rounded">
                        <PenTool size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="fs-4 fw-bold text-white mb-0">AutoArchitect AI</h1>
                        <p className="small text-secondary mb-0">Generative CAD Floor Plans</p>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <a href="#" className="text-secondary small d-none d-md-block text-decoration-none hover-primary">
                        Documentation
                    </a>

                    <div className="d-none d-md-block vr bg-secondary"></div>

                    <div className="d-flex align-items-center gap-2 small font-monospace text-primary bg-primary bg-opacity-25 px-3 py-1 rounded-pill border border-primary">
                        <span className="position-relative d-flex" style={{ height: "8px", width: "8px" }}>
                            <span className="ping-animation position-absolute rounded-circle bg-primary opacity-75" style={{ height: "100%", width: "100%" }}></span>
                            <span className="position-relative rounded-circle bg-primary" style={{ height: "8px", width: "8px" }}></span>
                        </span>
                        System Ready
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow-1 d-flex flex-column flex-lg-row overflow-hidden position-relative">

                {/* Left Panel */}
                <aside className="w-100 w-lg-25 border-end border-secondary bg-dark bg-opacity-50 p-4 overflow-auto">
                    <div className="mb-4">
                        <h2 className="fs-5 fw-semibold text-white d-flex align-items-center gap-2">
                            <LayoutDashboard size={20} className="text-primary" />
                            Configuration
                        </h2>
                        <p className="small text-secondary mt-1">Define your architectural constraints.</p>
                    </div>

                    <BlueprintForm onGenerate={handleGenerate} isLoading={isGenerating} />

                    {error && (
                        <div className="mt-4 p-3 bg-danger bg-opacity-25 border border-danger rounded text-danger small">
                            <p className="fw-bold mb-1">Error</p>
                            {error}
                        </div>
                    )}

                    <div className="mt-5 p-3 bg-secondary bg-opacity-25 rounded border border-secondary">
                        <div className="d-flex align-items-start gap-3">
                            <Info size={20} className="text-primary mt-1" />
                            <div className="text-secondary small lh-sm">
                                <p className="fw-semibold text-white mb-1">Pro Tip:</p>
                                Be specific in the "Additional Requirements" field. Mention layout styles like "Open Concept" or "Corridor Layout" for better results.
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Panel */}
                <section className="flex-grow-1 d-flex flex-column bg-black bg-opacity-25 position-relative overflow-hidden">
                    <div className="flex-grow-1 p-4 p-md-5 d-flex align-items-center justify-content-center overflow-auto">
                        <BlueprintDisplay
                            isLoading={isGenerating}
                            result={generatedResult}
                        />
                    </div>
                </section>

            </main>
        </div>
    );
}
