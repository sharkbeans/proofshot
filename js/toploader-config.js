/**
 * toploader-config.js
 * Configuration values for toploader overlay rendering
 *
 * Adjust these values to fine-tune the toploader appearance
 */

const ToploaderConfig = {
    // Overlap dimensions (in pixels)
    dimensions: {
        // How much the toploader overlaps the photocard on left/right/top sides
        sideOverlap: 61.8,

        // Extra overlap at the bottom (toploader extends further at bottom)
        bottomOverlap: 139.23
    },

    // Corner radii
    corners: {
        // Radius for top corners (more rounded)
        topRadius: 70,

        // Radius for bottom corners (less rounded)
        bottomRadius: 42
    },

    // Border/frame thickness
    frame: {
        // Left edge thickness
        leftThickness: 12.096,

        // Right edge thickness
        rightThickness: 7.488,

        // Right edge inset adjustment
        rightInset: 2
    },

    // White border reflections
    borders: {
        // West (left) border gradient
        west: {
            // Gradient width multiplier
            widthMultiplier: 3,

            // Gradient scale factor
            scaleFactor: 1.35,

            // Opacity stops
            startOpacity: 0.85,  // Start of gradient
            endOpacity: 0.425    // End of gradient (85% of 0.5)
        },

        // East (right) border gradient
        east: {
            // Gradient width multiplier
            widthMultiplier: 4.35,

            // Gradient scale factor
            scaleFactor: 1.35,

            // Opacity stops
            startOpacity: 0.85,  // Start of gradient
            endOpacity: 0.85     // End of gradient
        },

        // South (bottom) border gradient
        south: {
            // Opacity stops across the gradient
            edgeOpacity: 0.595,   // 85% of 0.7 - at the edges
            centerOpacity: 0.8075 // 85% of 0.95 - at the center
        }
    },

    // Plastic overlay effects
    overlay: {
        // Semi-transparent base for plastic effect
        baseOpacity: 0.04,

        // Inner viewing area tint (slight blue tint for plastic)
        innerTint: {
            red: 240,
            green: 245,
            blue: 255,
            opacity: 0.08
        },

        // Inner edge definition
        innerEdge: {
            red: 180,
            green: 190,
            blue: 210,
            opacity: 0.15,
            lineWidth: 1
        }
    },

    // Highlight gradients
    highlights: {
        // Top glossy highlight (reflection from light source)
        top: {
            // Height as percentage of inner height
            heightPercent: 0.36,

            // Opacity stops
            startOpacity: 0.108,    // Top of highlight
            middleOpacity: 0.027,   // 20% down
            endOpacity: 0           // Bottom (fades to transparent)
        }
    },

    // Inner shadow gradients (3D depth effect)
    shadows: {
        // North (top) shadow
        north: {
            startOpacity: 0.125,
            endOpacity: 0
        },

        // West (left) shadow
        west: {
            startOpacity: 0.25,
            endOpacity: 0
        },

        // East (right) shadow
        east: {
            startOpacity: 0.25,
            endOpacity: 0
        },

        // South (bottom) shadow
        south: {
            startOpacity: 0,
            endOpacity: 0.25
        }
    },

    // Third internal shading line (grey border following white border)
    shadingLine: {
        // Grey color with opacity
        red: 128,
        green: 128,
        blue: 128,
        opacity: 0.7,

        // Width reduction factor (multiplied by border thickness)
        widthReduction: 0.5
    },

    // Top clipping (removes artifacts)
    clipping: {
        // Pixels to clip from top
        topClip: 5
    },

    // Curve start percentages (for partial curves at top)
    curves: {
        // Top curve starts at this percentage of corner radius
        topCurveStartPercent: 0.6
    },

    // White glaze film covering the photocard
    glazeFilm: {
        // White color with mild opacity (3%)
        red: 255,
        green: 255,
        blue: 255,
        opacity: 0.03
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToploaderConfig;
}
