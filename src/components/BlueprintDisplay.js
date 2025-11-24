import React, { useState, useEffect } from 'react';
import { Download, ZoomIn, Copy, FileText, Image as ImageIcon } from 'lucide-react';

export const BlueprintDisplay = ({ isLoading, result }) => {
    const [zoom, setZoom] = useState(false);
    const [viewMode, setViewMode] = useState('image');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setZoom(false);
        setViewMode('image');
    }, [result]);

    const handleCopyPrompt = () => {
        if (result?.promptUsed) {
            navigator.clipboard.writeText(result.promptUsed);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center mx-auto p-4">
                <div className="spinner-border text-primary mb-4" style={{ width: "4rem", height: "4rem" }}></div>

                <h3 className="fs-4 fw-bold text-light mb-2">Generating Layout</h3>
                <p className="text-muted">
                    Our AI is calculating spatial requirements, drawing walls, and placing furniture based on your specifications...
                </p>

                <div className="mt-4 w-100">
                    <div className="progress mb-2">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" style={{ width: "33%" }}></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted small">
                        <span>Drafting</span>
                        <span>Rendering</span>
                        <span>Finalizing</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center border border-2 border-secondary rounded p-5 bg-dark bg-opacity-50">
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: "80px", height: "80px" }}>
                    <ImageIcon className="text-muted" size={38} />
                </div>

                <h3 className="fs-4 fw-semibold text-light mb-2">Ready to Design</h3>
                <p className="text-muted" style={{ maxWidth: "350px" }}>
                    Configure your room requirements on the left and click "Generate Layout" to create a professional customized 2D blueprint.
                </p>
            </div>
        );
    }

    const handleDownload = () => {
        if (!result.imageUrl) return;
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `floorplan-${result.timestamp}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="position-relative w-100 h-100 d-flex flex-column">
            {/* Toggle buttons */}
            <div className="position-absolute top-0 start-0 mt-3 ms-3 bg-dark bg-opacity-75 border border-secondary rounded p-1 shadow">
                <button
                    onClick={() => setViewMode('image')}
                    className={`btn btn-sm d-flex align-items-center gap-2 ${viewMode === 'image'
                        ? 'btn-primary'
                        : 'btn-outline-light'
                        }`}
                >
                    <ImageIcon size={14} /> Blueprint
                </button>

                <button
                    onClick={() => setViewMode('prompt')}
                    className={`btn btn-sm ms-1 d-flex align-items-center gap-2 ${viewMode === 'prompt'
                        ? 'btn-primary'
                        : 'btn-outline-light'
                        }`}
                >
                    <FileText size={14} /> View Prompt
                </button>
            </div>

            {/* Action buttons */}
            {viewMode === 'image' && (
                <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex gap-2">
                    <button
                        onClick={() => setZoom(!zoom)}
                        className="btn btn-dark border border-secondary shadow"
                        title="Toggle Zoom"
                    >
                        <ZoomIn size={18} />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="btn btn-primary d-flex align-items-center gap-2 shadow"
                        title="Download Image"
                    >
                        <Download size={18} />
                        <span className="d-none d-sm-inline">Export CAD</span>
                    </button>
                </div>
            )}

            {/* Main content */}
            <div className="flex-grow-1 w-100 h-100 d-flex align-items-center justify-content-center p-3 overflow-hidden">

                {viewMode === 'image' ? (
                    <div
                        className={`bg-white border shadow-lg position-relative transition-zoom`}
                        style={{
                            maxWidth: zoom ? "100%" : "100%",
                            maxHeight: zoom ? "none" : "100%",
                            padding: zoom ? "6px" : "16px",
                            cursor: zoom ? "zoom-out" : "zoom-in",
                            transform: zoom ? "scale(1)" : "scale(1)"
                        }}
                        onClick={() => setZoom(!zoom)}
                    >
                        <img
                            src={result.imageUrl}
                            alt="Generated Floor Plan"
                            className="img-fluid object-fit-contain"
                        />

                        <div className="position-absolute bottom-0 end-0 bg-white bg-opacity-75 small p-1 px-2 border rounded shadow-sm">
                            SCALE: 1:100 | {result.dimensions.width}' x {result.dimensions.length}'
                        </div>
                    </div>
                ) : (
                    <div className="bg-dark text-light border border-secondary rounded p-4 shadow w-100" style={{ maxWidth: "700px", maxHeight: "80%", overflowY: "auto" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="small text-uppercase text-muted fw-semibold mb-0">Generation Prompt</h3>

                            <button
                                onClick={handleCopyPrompt}
                                className="btn btn-link text-primary p-0 small d-flex align-items-center gap-1"
                            >
                                {copied ? (
                                    <span className="text-success">Copied!</span>
                                ) : (
                                    <>
                                        <Copy size={14} /> Copy Text
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-secondary bg-opacity-25 rounded p-3 border">
                            <pre className="text-light small" style={{ whiteSpace: "pre-wrap" }}>
                                {result.promptUsed}
                            </pre>
                        </div>
                    </div>
                )}

            </div>

            {viewMode === 'image' && !zoom && (
                <p className="position-absolute bottom-0 start-50 translate-middle-x text-muted small bg-dark bg-opacity-50 px-3 py-1 rounded">
                    Click image to zoom
                </p>
            )}
        </div>
    );
};
