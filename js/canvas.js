/**
 * canvas.js
 * Manages the HTML5 canvas, image composition, and touch gestures
 */

const CanvasManager = {
    canvas: null,
    ctx: null,
    backgroundImage: null,
    objektImage: null,

    // Background transform properties
    background: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipH: false,
        flipV: false
    },

    // Objekt transform properties
    objekt: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipH: false,
        flipV: false,
        layer: 'front', // 'front' or 'back'
        showToploader: true // toploader visibility
    },

    // Touch/gesture state
    gesture: {
        active: false,
        startDistance: 0,
        startAngle: 0,
        startScale: 1,
        startRotation: 0,
        lastX: 0,
        lastY: 0,
        pointers: []
    },

    // Animation state
    animation: {
        active: false,
        velocityX: 0,
        velocityY: 0
    },

    /**
     * Initialize the canvas manager
     */
    init() {
        this.canvas = document.getElementById('proofshot-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.attachEventListeners();

        // Initial render
        this.render();
    },

    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale context to match
        this.ctx.scale(dpr, dpr);

        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.render();
    },

    /**
     * Attach event listeners for touch and mouse interactions
     */
    attachEventListeners() {
        // Resize observer
        window.addEventListener('resize', () => this.resizeCanvas());

        // Pointer events for unified touch/mouse handling
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e));

        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Mouse wheel for zoom (desktop)
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    },

    /**
     * Handle pointer down (touch/mouse start)
     */
    handlePointerDown(e) {
        if (!this.objektImage) return;

        this.gesture.pointers.push({
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY
        });

        if (this.gesture.pointers.length === 1) {
            // Single pointer - drag
            this.gesture.lastX = e.clientX;
            this.gesture.lastY = e.clientY;
        } else if (this.gesture.pointers.length === 2) {
            // Two pointers - pinch and rotate
            const p1 = this.gesture.pointers[0];
            const p2 = this.gesture.pointers[1];

            this.gesture.startDistance = this.getDistance(p1, p2);
            this.gesture.startAngle = this.getAngle(p1, p2);
            this.gesture.startScale = this.objekt.scale;
            this.gesture.startRotation = this.objekt.rotation;
        }

        this.gesture.active = true;
        this.animation.active = false;
    },

    /**
     * Handle pointer move (touch/mouse move)
     */
    handlePointerMove(e) {
        if (!this.gesture.active || !this.objektImage) return;

        // Update pointer position
        const pointerIndex = this.gesture.pointers.findIndex(p => p.id === e.pointerId);
        if (pointerIndex !== -1) {
            this.gesture.pointers[pointerIndex].x = e.clientX;
            this.gesture.pointers[pointerIndex].y = e.clientY;
        }

        if (this.gesture.pointers.length === 1) {
            // Single pointer - drag
            const dx = e.clientX - this.gesture.lastX;
            const dy = e.clientY - this.gesture.lastY;

            this.objekt.x += dx;
            this.objekt.y += dy;

            this.gesture.lastX = e.clientX;
            this.gesture.lastY = e.clientY;

            // Store velocity for inertia
            this.animation.velocityX = dx;
            this.animation.velocityY = dy;
        } else if (this.gesture.pointers.length === 2) {
            // Two pointers - pinch and rotate
            const p1 = this.gesture.pointers[0];
            const p2 = this.gesture.pointers[1];

            // Pinch to zoom
            const distance = this.getDistance(p1, p2);
            const scaleChange = distance / this.gesture.startDistance;
            this.objekt.scale = Math.max(0.1, Math.min(5, this.gesture.startScale * scaleChange));

            // Rotate
            const angle = this.getAngle(p1, p2);
            const angleChange = angle - this.gesture.startAngle;
            this.objekt.rotation = this.gesture.startRotation + angleChange;
        }

        this.render();
    },

    /**
     * Handle pointer up (touch/mouse end)
     */
    handlePointerUp(e) {
        // Remove pointer
        this.gesture.pointers = this.gesture.pointers.filter(p => p.id !== e.pointerId);

        if (this.gesture.pointers.length === 0) {
            this.gesture.active = false;

            // Start inertia animation if there's significant velocity
            if (Math.abs(this.animation.velocityX) > 1 || Math.abs(this.animation.velocityY) > 1) {
                this.startInertiaAnimation();
            }
        } else if (this.gesture.pointers.length === 1) {
            // Reset to single pointer drag
            const p = this.gesture.pointers[0];
            this.gesture.lastX = p.x;
            this.gesture.lastY = p.y;
        }
    },

    /**
     * Handle mouse wheel for zoom (desktop)
     */
    handleWheel(e) {
        if (!this.objektImage) return;

        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        this.objekt.scale = Math.max(0.1, Math.min(5, this.objekt.scale * delta));

        this.render();
    },

    /**
     * Start inertia animation
     */
    startInertiaAnimation() {
        this.animation.active = true;

        const animate = () => {
            if (!this.animation.active) return;

            // Apply velocity
            this.objekt.x += this.animation.velocityX;
            this.objekt.y += this.animation.velocityY;

            // Friction
            this.animation.velocityX *= 0.9;
            this.animation.velocityY *= 0.9;

            // Stop if velocity is negligible
            if (Math.abs(this.animation.velocityX) < 0.1 && Math.abs(this.animation.velocityY) < 0.1) {
                this.animation.active = false;
                return;
            }

            this.render();
            requestAnimationFrame(animate);
        };

        animate();
    },

    /**
     * Get distance between two points
     */
    getDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Get angle between two points
     */
    getAngle(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    },

    /**
     * Load background image
     */
    loadBackground(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.backgroundImage = img;
                    this.render();
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Load objekt image
     */
    loadObjekt(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.objektImage = img;

                    // Center objekt on canvas
                    const rect = this.canvas.getBoundingClientRect();
                    this.objekt.x = rect.width / 2;
                    this.objekt.y = rect.height / 2;
                    this.objekt.scale = Math.min(rect.width, rect.height) / (img.width * 1.5);

                    this.render();
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Render the canvas
     */
    render() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw background
        if (this.backgroundImage) {
            this.drawBackground();
        }

        // Draw objekt (layer order)
        if (this.objektImage) {
            if (this.objekt.layer === 'back') {
                this.drawObjekt();
            }
        }

        // Draw border
        if (window.BorderManager) {
            window.BorderManager.drawBorder(this.ctx, width, height);
        }

        // Draw objekt on top if layer is front
        if (this.objektImage && this.objekt.layer === 'front') {
            this.drawObjekt();
        }
    },

    /**
     * Draw background image
     */
    drawBackground() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        this.ctx.save();

        // Calculate default cover sizing
        const imgRatio = this.backgroundImage.width / this.backgroundImage.height;
        const canvasRatio = width / height;

        let baseWidth, baseHeight;

        if (imgRatio > canvasRatio) {
            baseHeight = height;
            baseWidth = height * imgRatio;
        } else {
            baseWidth = width;
            baseHeight = width / imgRatio;
        }

        // Apply transformations
        // Translate to center of canvas plus offset
        const centerX = width / 2 + this.background.x;
        const centerY = height / 2 + this.background.y;
        this.ctx.translate(centerX, centerY);

        // Rotate
        const rotationRad = (this.background.rotation * Math.PI) / 180;
        this.ctx.rotate(rotationRad);

        // Scale with flip
        const scaleX = this.background.scale * (this.background.flipH ? -1 : 1);
        const scaleY = this.background.scale * (this.background.flipV ? -1 : 1);
        this.ctx.scale(scaleX, scaleY);

        // Draw centered
        this.ctx.drawImage(
            this.backgroundImage,
            -baseWidth / 2,
            -baseHeight / 2,
            baseWidth,
            baseHeight
        );

        this.ctx.restore();
    },

    /**
     * Draw objekt image with transformations
     */
    drawObjekt() {
        this.ctx.save();

        // Translate to objekt position
        this.ctx.translate(this.objekt.x, this.objekt.y);

        // Rotate
        this.ctx.rotate(this.objekt.rotation);

        // Scale
        const scaleX = this.objekt.scale * (this.objekt.flipH ? -1 : 1);
        const scaleY = this.objekt.scale * (this.objekt.flipV ? -1 : 1);
        this.ctx.scale(scaleX, scaleY);

        // Draw image centered
        const width = this.objektImage.width;
        const height = this.objektImage.height;
        this.ctx.drawImage(this.objektImage, -width / 2, -height / 2, width, height);

        // Draw toploader overlay if enabled
        if (this.objekt.showToploader) {
            this.drawToploader(width, height);
        }

        this.ctx.restore();
    },

    /**
     * Draw toploader overlay on the objekt
     * Creates a realistic thick plastic sleeve with frame effect
     */
    drawToploader(width, height) {
        // Increase toploader size to overlap the objekt more
        const overlap = 41.2; // pixels of overlap on each side (increased by 3%)
        const bottomOverlap = 85; // extra overlap at bottom
        const toploaderWidth = width + (overlap * 2);
        const toploaderHeight = height + overlap + bottomOverlap;

        const x = -(toploaderWidth / 2);
        const y = -(height / 2) - overlap;
        const topCornerRadius = 80;
        const bottomCornerRadius = 48;
        const frameThickness = 9; // thick plastic edges

        this.ctx.save();

        // Helper function to create rounded rectangle path
        const roundedRect = (x, y, w, h, radiusTop, radiusBottom) => {
            this.ctx.beginPath();
            this.ctx.moveTo(x + radiusTop, y);
            this.ctx.lineTo(x + w - radiusTop, y);
            this.ctx.arcTo(x + w, y, x + w, y + radiusTop, radiusTop);
            this.ctx.lineTo(x + w, y + h - radiusBottom);
            this.ctx.arcTo(x + w, y + h, x + w - radiusBottom, y + h, radiusBottom);
            this.ctx.lineTo(x + radiusBottom, y + h);
            this.ctx.arcTo(x, y + h, x, y + h - radiusBottom, radiusBottom);
            this.ctx.lineTo(x, y + radiusTop);
            this.ctx.arcTo(x, y, x + radiusTop, y, radiusTop);
            this.ctx.closePath();
        };

        // 2. West (left) side - white border with reflection
        this.ctx.beginPath();
        this.ctx.moveTo(x + topCornerRadius, y);
        this.ctx.arcTo(x, y, x, y + topCornerRadius, topCornerRadius);
        this.ctx.lineTo(x, y + toploaderHeight - bottomCornerRadius);
        this.ctx.arcTo(x, y + toploaderHeight, x + bottomCornerRadius, y + toploaderHeight, bottomCornerRadius);
        this.ctx.lineTo(x + frameThickness + (bottomCornerRadius - frameThickness), y + toploaderHeight - frameThickness);
        this.ctx.arcTo(x + frameThickness, y + toploaderHeight - frameThickness, x + frameThickness, y + toploaderHeight - frameThickness - (bottomCornerRadius - frameThickness), bottomCornerRadius - frameThickness);
        this.ctx.lineTo(x + frameThickness, y + frameThickness + (topCornerRadius - frameThickness));
        this.ctx.arcTo(x + frameThickness, y + frameThickness, x + frameThickness + (topCornerRadius - frameThickness), y + frameThickness, topCornerRadius - frameThickness);
        this.ctx.lineTo(x + topCornerRadius, y);
        this.ctx.closePath();

        const westGradient = this.ctx.createLinearGradient(x, y, x + topCornerRadius * 0.8, y);
        westGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        westGradient.addColorStop(0.6, 'rgba(245, 245, 250, 0.2)');
        westGradient.addColorStop(1, 'rgba(235, 235, 245, 0)');
        this.ctx.fillStyle = westGradient;
        this.ctx.fill();

        // 3. East (right) side - white border with reflection
        this.ctx.beginPath();
        this.ctx.moveTo(x + toploaderWidth - topCornerRadius, y);
        this.ctx.arcTo(x + toploaderWidth, y, x + toploaderWidth, y + topCornerRadius, topCornerRadius);
        this.ctx.lineTo(x + toploaderWidth, y + toploaderHeight - bottomCornerRadius);
        this.ctx.arcTo(x + toploaderWidth, y + toploaderHeight, x + toploaderWidth - bottomCornerRadius, y + toploaderHeight, bottomCornerRadius);
        this.ctx.lineTo(x + toploaderWidth - frameThickness - (bottomCornerRadius - frameThickness), y + toploaderHeight - frameThickness);
        this.ctx.arcTo(x + toploaderWidth - frameThickness, y + toploaderHeight - frameThickness, x + toploaderWidth - frameThickness, y + toploaderHeight - frameThickness - (bottomCornerRadius - frameThickness), bottomCornerRadius - frameThickness);
        this.ctx.lineTo(x + toploaderWidth - frameThickness, y + frameThickness + (topCornerRadius - frameThickness));
        this.ctx.arcTo(x + toploaderWidth - frameThickness, y + frameThickness, x + toploaderWidth - frameThickness - (topCornerRadius - frameThickness), y + frameThickness, topCornerRadius - frameThickness);
        this.ctx.lineTo(x + toploaderWidth - topCornerRadius, y);
        this.ctx.closePath();

        const eastGradient = this.ctx.createLinearGradient(x + toploaderWidth, y, x + toploaderWidth - topCornerRadius * 0.8, y);
        eastGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        eastGradient.addColorStop(0.6, 'rgba(245, 245, 250, 0.2)');
        eastGradient.addColorStop(1, 'rgba(235, 235, 245, 0)');
        this.ctx.fillStyle = eastGradient;
        this.ctx.fill();

        // 4. South (bottom) side - white border (shortened)
        const southBorderStart = x + bottomCornerRadius * 1;
        const southBorderEnd = x + toploaderWidth - bottomCornerRadius * 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(southBorderStart, y + toploaderHeight);
        this.ctx.lineTo(southBorderEnd, y + toploaderHeight);
        this.ctx.lineTo(southBorderEnd, y + toploaderHeight - frameThickness);
        this.ctx.lineTo(southBorderStart, y + toploaderHeight - frameThickness);
        this.ctx.closePath();

        const southGradient = this.ctx.createLinearGradient(southBorderStart, y + toploaderHeight, southBorderEnd, y + toploaderHeight);
        southGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        southGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        southGradient.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
        this.ctx.fillStyle = southGradient;
        this.ctx.fill();

        // Add blur effect to the area under toploader
        this.ctx.filter = 'blur(1px)';
        roundedRect(x, y, toploaderWidth, toploaderHeight, topCornerRadius, bottomCornerRadius);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        this.ctx.filter = 'none';

        // 2. Inner viewing area (semi-transparent center)
        const innerX = x + frameThickness;
        const innerY = y + frameThickness;
        const innerWidth = toploaderWidth - (frameThickness * 2);
        const innerHeight = toploaderHeight - (frameThickness * 2);

        roundedRect(innerX, innerY, innerWidth, innerHeight, topCornerRadius - frameThickness, bottomCornerRadius - frameThickness);
        this.ctx.fillStyle = 'rgba(240, 245, 255, 0.07)';
        this.ctx.fill();

        // Inner shadow for depth
        this.ctx.strokeStyle = 'rgba(180, 190, 210, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Add frosted glass effect
        roundedRect(innerX, innerY, innerWidth, innerHeight, topCornerRadius - frameThickness, bottomCornerRadius - frameThickness);
        this.ctx.fillStyle = 'rgba(240, 245, 255, 0.005)';
        this.ctx.fill();

        // Inner shadow for depth (reduced opacity by half)
        this.ctx.strokeStyle = 'rgba(180, 190, 210, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 3. Top glossy highlight on viewing area (reduced opacity by half)
        const topHighlightGradient = this.ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerHeight * 0.35);
        topHighlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        topHighlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.015)');
        topHighlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        roundedRect(innerX, innerY, innerWidth, innerHeight * 0.35, topCornerRadius - frameThickness, 0);
        this.ctx.fillStyle = topHighlightGradient;
        this.ctx.fill();

        this.ctx.restore();
    },

    /**
     * Background transform operations
     */
    updateBackground(property, value) {
        if (!this.backgroundImage) return;
        this.background[property] = value;
        this.render();
    },

    flipBackgroundHorizontal() {
        if (!this.backgroundImage) return;
        this.background.flipH = !this.background.flipH;
        this.render();
    },

    flipBackgroundVertical() {
        if (!this.backgroundImage) return;
        this.background.flipV = !this.background.flipV;
        this.render();
    },

    resetBackground() {
        if (!this.backgroundImage) return;
        this.background = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            flipH: false,
            flipV: false
        };
        this.render();
    },

    /**
     * Objekt transform operations
     */
    updateObjekt(property, value) {
        if (!this.objektImage) return;
        this.objekt[property] = value;
        this.render();
    },

    flipObjektHorizontal() {
        if (!this.objektImage) return;
        this.objekt.flipH = !this.objekt.flipH;
        this.render();
    },

    flipObjektVertical() {
        if (!this.objektImage) return;
        this.objekt.flipV = !this.objekt.flipV;
        this.render();
    },

    resetObjekt() {
        if (!this.objektImage) return;
        const rect = this.canvas.getBoundingClientRect();
        this.objekt = {
            x: rect.width / 2,
            y: rect.height / 2,
            scale: Math.min(rect.width, rect.height) / (this.objektImage.width * 1.5),
            rotation: 0,
            flipH: false,
            flipV: false,
            layer: this.objekt.layer
        };
        this.render();
    },

    bringToFront() {
        if (!this.objektImage) return;
        this.objekt.layer = 'front';
        this.render();
    },

    sendToBack() {
        if (!this.objektImage) return;
        this.objekt.layer = 'back';
        this.render();
    },

    /**
     * Toggle toploader visibility
     */
    toggleToploader(show) {
        this.objekt.showToploader = show;
        this.render();
    },

    // Legacy methods for backward compatibility
    flipHorizontal() {
        this.flipObjektHorizontal();
    },

    flipVertical() {
        this.flipObjektVertical();
    },

    rotateLeft() {
        if (!this.objektImage) return;
        this.objekt.rotation -= Math.PI / 2;
        this.render();
    },

    rotateRight() {
        if (!this.objektImage) return;
        this.objekt.rotation += Math.PI / 2;
        this.render();
    },

    /**
     * Reset canvas
     */
    reset() {
        this.backgroundImage = null;
        this.objektImage = null;
        this.background = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            flipH: false,
            flipV: false
        };
        this.objekt = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            flipH: false,
            flipV: false,
            layer: 'front'
        };
        this.render();
    },

    /**
     * Export canvas as image
     */
    exportImage() {
        return new Promise((resolve, reject) => {
            try {
                // Create a temporary canvas for export
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = this.canvas.width;
                exportCanvas.height = this.canvas.height;

                const exportCtx = exportCanvas.getContext('2d');

                // Draw current canvas
                exportCtx.drawImage(this.canvas, 0, 0);

                // Convert to blob
                exportCanvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to export canvas'));
                    }
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Get canvas data URL
     */
    getDataURL() {
        return this.canvas.toDataURL('image/png');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasManager;
}
