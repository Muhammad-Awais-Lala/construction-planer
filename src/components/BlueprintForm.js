import React, { useState } from 'react';
import { Ruler, BedDouble, ChefHat, Car, Sofa, FileText, Sparkles, FolderPen } from 'lucide-react';

export const BlueprintForm = ({ onGenerate, isLoading }) => {
    const [config, setConfig] = useState({
        projectName: 'My Dream Home',
        width: 40,
        length: 50,
        bedrooms: 3,
        bathrooms: 2,
        kitchenStyle: 'Open Concept',
        livingArea: true,
        garage: false,
        additionalNotes: '',
        theme: 'Modern Blue'
    });

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(config);
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">

            {/* Project Name */}
            <div>
                <label className="text-uppercase small fw-semibold text-secondary d-flex align-items-center gap-2 mb-2">
                    <FolderPen size={14} /> Project Name
                </label>

                <input
                    type="text"
                    value={config.projectName}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. Pakistani Urban Home"
                />
            </div>

            <hr className="border-secondary" />

            {/* Dimensions */}
            <div>
                <label className="text-uppercase small fw-semibold text-secondary d-flex align-items-center gap-2 mb-2">
                    <Ruler size={14} /> Basic Dimensions (ft)
                </label>

                <div className="row g-3">
                    <div className="col-6">
                        <label className="small text-muted mb-1">Width</label>
                        <input
                            type="number"
                            min={10}
                            max={200}
                            value={config.width}
                            onChange={(e) => handleChange('width', parseInt(e.target.value))}
                            className="form-control bg-dark text-light border-secondary"
                        />
                    </div>
                    <div className="col-6">
                        <label className="small text-muted mb-1">Length</label>
                        <input
                            type="number"
                            min={10}
                            max={200}
                            value={config.length}
                            onChange={(e) => handleChange('length', parseInt(e.target.value))}
                            className="form-control bg-dark text-light border-secondary"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-secondary" />

            {/* Room Config */}
            <div>
                <label className="text-uppercase small fw-semibold text-secondary d-flex align-items-center gap-2 mb-2">
                    <BedDouble size={14} /> Room Configuration
                </label>

                <div className="row g-3">
                    {/* Bedrooms */}
                    <div className="col-6">
                        <div className="p-3 rounded border border-secondary bg-dark">
                            <label className="small text-muted mb-2">Bedrooms</label>

                            <div className="d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChange('bedrooms', Math.max(0, config.bedrooms - 1))}
                                    className="btn btn-secondary btn-sm"
                                >
                                    -
                                </button>

                                <span className="fw-bold fs-5">{config.bedrooms}</span>

                                <button
                                    type="button"
                                    onClick={() => handleChange('bedrooms', Math.min(10, config.bedrooms + 1))}
                                    className="btn btn-secondary btn-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="col-6">
                        <div className="p-3 rounded border border-secondary bg-dark">
                            <label className="small text-muted mb-2">Bathrooms</label>

                            <div className="d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChange('bathrooms', Math.max(0, config.bathrooms - 0.5))}
                                    className="btn btn-secondary btn-sm"
                                >
                                    -
                                </button>

                                <span className="fw-bold fs-5">{config.bathrooms}</span>

                                <button
                                    type="button"
                                    onClick={() => handleChange('bathrooms', Math.min(10, config.bathrooms + 0.5))}
                                    className="btn btn-secondary btn-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-secondary" />

            {/* Features */}
            <div>
                <label className="text-uppercase small fw-semibold text-secondary d-flex align-items-center gap-2 mb-2">
                    <ChefHat size={14} /> Kitchen & Features
                </label>

                {/* Kitchen Style */}
                <div className="mb-3">
                    <label className="small text-muted mb-1">Kitchen Style</label>
                    <select
                        value={config.kitchenStyle}
                        onChange={(e) => handleChange('kitchenStyle', e.target.value)}
                        className="form-select bg-dark text-light border-secondary"
                    >
                        <option>Standard</option>
                        <option>Open Concept</option>
                        <option>Galley</option>
                        <option>Island</option>
                    </select>
                </div>

                {/* Feature Toggles */}
                <div className="d-flex gap-3 mb-3">
                    <button
                        type="button"
                        onClick={() => handleChange('livingArea', !config.livingArea)}
                        className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${config.livingArea ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                    >
                        <Sofa size={16} /> Large Living
                    </button>

                    <button
                        type="button"
                        onClick={() => handleChange('garage', !config.garage)}
                        className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${config.garage ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                    >
                        <Car size={16} /> Garage
                    </button>
                </div>

                {/* Theme */}
                <div>
                    <label className="small text-muted mb-1">Visual Style</label>
                    <select
                        value={config.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        className="form-select bg-dark text-light border-secondary"
                    >
                        <option>Modern Blue</option>
                        <option>Technical CAD</option>
                        <option>Architectural Sketch</option>
                    </select>
                </div>
            </div>

            <hr className="border-secondary" />

            {/* Additional Notes */}
            <div>
                <label className="text-uppercase small fw-semibold text-secondary d-flex align-items-center gap-2 mb-2">
                    <FileText size={14} /> Specific Requirements
                </label>

                <textarea
                    rows={3}
                    value={config.additionalNotes}
                    onChange={(e) => handleChange('additionalNotes', e.target.value)}
                    placeholder="e.g., Master bedroom in South-East corner..."
                    className="form-control bg-dark text-light border-secondary"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className={`btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${isLoading ? 'btn-secondary' : 'btn-primary'
                    }`}
            >
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Generating Blueprints...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} /> Generate Layout
                    </>
                )}
            </button>

        </form>
    );
};
