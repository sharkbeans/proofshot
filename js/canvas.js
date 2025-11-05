/**
 * canvas.js
 * Manages the HTML5 canvas, image composition, and touch gestures
 */

const CanvasManager = {
    canvas: null,
    ctx: null,
    backgroundImage: null,
    photocardImage: null,

    // Camera properties
    camera: {
        active: false,
        stream: null,
        video: null,
        facingMode: 'environment', // 'user' for front, 'environment' for back
        animationFrame: null
    },

    // Background transform properties
    background: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipH: false,
        flipV: false
    },

    // Photocard transform properties
    photocard: {
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

        // Load placeholder photocard
        this.loadPlaceholderPhotocard();

        // Initial render
        this.render();
    },

    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const isCameraActive = container.classList.contains('camera-active');

        let canvasWidth, canvasHeight;

        if (isCameraActive) {
            // In camera mode, calculate dimensions based on aspect ratio
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (container.classList.contains('aspect-3-4')) {
                // 3:4 aspect ratio
                canvasWidth = Math.min(vh * 0.75, vw);
                canvasHeight = canvasWidth * (4/3);
            } else if (container.classList.contains('aspect-9-16')) {
                // 9:16 aspect ratio
                canvasWidth = Math.min(vh * 0.5625, vw);
                canvasHeight = canvasWidth * (16/9);
            } else if (container.classList.contains('aspect-1-1')) {
                // 1:1 aspect ratio
                canvasWidth = Math.min(vh, vw);
                canvasHeight = canvasWidth;
            } else {
                // Default to 3:4
                canvasWidth = Math.min(vh * 0.75, vw);
                canvasHeight = canvasWidth * (4/3);
            }
        } else {
            // Normal mode - use container dimensions
            const rect = container.getBoundingClientRect();
            canvasWidth = rect.width;
            canvasHeight = rect.height;
        }

        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;

        // Scale context to match
        this.ctx.scale(dpr, dpr);

        // Set display size (CSS handles positioning in camera mode)
        if (!isCameraActive) {
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
        }

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

        // Prevent default touch behaviors (but allow placeholder clicks)
        this.canvas.addEventListener('touchstart', (e) => {
            // If placeholder is tapped, check if it's on the photocard area
            if (this.isPlaceholder && e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                // If tap is on placeholder, don't prevent default yet
                // Let the pointer event handle it
                if (this.isPointOnPhotocard(x, y)) {
                    return;
                }
            }
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Add explicit click handler for mobile placeholder (as a fallback)
        this.canvas.addEventListener('click', (e) => {
            if (!this.photocardImage || !this.isPlaceholder) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.isPointOnPhotocard(x, y)) {
                e.preventDefault();
                e.stopPropagation();

                // Trigger upload
                const photocardFileInput = document.getElementById('photocard-file-input');
                if (photocardFileInput) {
                    photocardFileInput.click();
                }
            }
        });

        // Mouse wheel for zoom (desktop)
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    },

    /**
     * Handle pointer down (touch/mouse start)
     */
    handlePointerDown(e) {
        if (!this.photocardImage) return;
        
        // Prevent interaction when modals are open
        if (document.querySelector('.modal.active')) return;

        // If placeholder is clicked, trigger upload dialog
        if (this.isPlaceholder && this.gesture.pointers.length === 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if click is on the photocard
            if (this.isPointOnPhotocard(x, y)) {
                // Add visual feedback
                const originalScale = this.photocard.scale;
                this.photocard.scale *= 0.95;
                this.render();

                // Trigger photocard upload immediately (must be synchronous for mobile)
                const photocardFileInput = document.getElementById('photocard-file-input');
                if (photocardFileInput) {
                    photocardFileInput.click();
                }

                // Reset scale after a brief moment
                setTimeout(() => {
                    this.photocard.scale = originalScale;
                    this.render();
                }, 150);

                // Prevent event from continuing to gesture handlers
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }

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
            this.gesture.startScale = this.photocard.scale;
            this.gesture.startRotation = this.photocard.rotation;
        }

        this.gesture.active = true;
        this.animation.active = false;
    },

    /**
     * Handle pointer move (touch/mouse move)
     */
    handlePointerMove(e) {
        // Prevent interaction when modals are open
        if (document.querySelector('.modal.active')) return;
        
        // Update cursor if hovering over placeholder
        if (this.isPlaceholder && !this.gesture.active) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.isPointOnPhotocard(x, y)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'grab';
            }
        }

        if (!this.gesture.active || !this.photocardImage) return;

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

            this.photocard.x += dx;
            this.photocard.y += dy;

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
            this.photocard.scale = Math.max(0.1, Math.min(5, this.gesture.startScale * scaleChange));

            // Rotate
            const angle = this.getAngle(p1, p2);
            const angleChange = angle - this.gesture.startAngle;
            this.photocard.rotation = this.gesture.startRotation + angleChange;
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
        if (!this.photocardImage) return;

        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        this.photocard.scale = Math.max(0.1, Math.min(5, this.photocard.scale * delta));

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
            this.photocard.x += this.animation.velocityX;
            this.photocard.y += this.animation.velocityY;

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
     * Check if a point is on the photocard (for hit detection)
     */
    isPointOnPhotocard(x, y) {
        if (!this.photocardImage) return false;

        // Transform point to photocard's local coordinates
        const dx = x - this.photocard.x;
        const dy = y - this.photocard.y;

        // Rotate point by inverse rotation
        const cos = Math.cos(-this.photocard.rotation);
        const sin = Math.sin(-this.photocard.rotation);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Scale point
        const scaledX = localX / this.photocard.scale;
        const scaledY = localY / this.photocard.scale;

        // Check if within image bounds
        const halfWidth = this.photocardImage.width / 2;
        const halfHeight = this.photocardImage.height / 2;

        return Math.abs(scaledX) <= halfWidth && Math.abs(scaledY) <= halfHeight;
    },

    /**
     * Start camera with specified facing mode
     */
    async startCamera() {
        try {
            // Get video element
            this.camera.video = document.getElementById('camera-video');

            if (!this.camera.video) {
                throw new Error('Camera video element not found');
            }

            // Request camera access
            const constraints = {
                video: {
                    facingMode: this.camera.facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.camera.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.camera.video.srcObject = this.camera.stream;
            this.camera.active = true;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.camera.video.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Start rendering camera frames
            this.renderCameraFrame();

            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    },

    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.camera.stream) {
            this.camera.stream.getTracks().forEach(track => track.stop());
            this.camera.stream = null;
        }

        if (this.camera.animationFrame) {
            cancelAnimationFrame(this.camera.animationFrame);
            this.camera.animationFrame = null;
        }

        this.camera.active = false;
        this.camera.video = null;
        this.render();
    },

    /**
     * Flip camera between front and back
     */
    async flipCamera() {
        this.camera.facingMode = this.camera.facingMode === 'user' ? 'environment' : 'user';
        this.stopCamera();
        await this.startCamera();
    },

    /**
     * Render camera frame to canvas
     */
    renderCameraFrame() {
        if (!this.camera.active || !this.camera.video) return;

        // Render the current frame
        this.render();

        // Schedule next frame
        this.camera.animationFrame = requestAnimationFrame(() => this.renderCameraFrame());
    },

    /**
     * Capture current camera frame as background
     */
    captureFrame() {
        if (!this.camera.active || !this.camera.video) return;

        // Create a canvas to capture the current frame
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = this.camera.video.videoWidth;
        captureCanvas.height = this.camera.video.videoHeight;
        const captureCtx = captureCanvas.getContext('2d');

        // Draw the video frame
        captureCtx.drawImage(this.camera.video, 0, 0);

        // Convert to image
        const img = new Image();
        img.onload = () => {
            this.backgroundImage = img;
            this.stopCamera();

            // If no real photocard has been uploaded, ensure placeholder is visible
            if (!this.photocardImage || this.isPlaceholder) {
                this.loadPlaceholderPhotocard();
            }
        };
        img.src = captureCanvas.toDataURL('image/png');
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
     * Load placeholder photocard image
     */
    loadPlaceholderPhotocard() {
        // Create a placeholder SVG for the photocard
        const placeholderSvg = `
            <svg width="600" height="900" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#c7b6f9;stop-opacity:0.25" />
                        <stop offset="100%" style="stop-color:#6dd5a0;stop-opacity:0.2" />
                    </linearGradient>
                </defs>
                <rect width="600" height="900" rx="30" fill="url(#cardGrad)" stroke="#c7b6f9" stroke-width="4" opacity="0.7" stroke-dasharray="20,10"/>

                <!-- Upload Icon -->
                <circle cx="300" cy="380" r="60" fill="#c7b6f9" opacity="0.2"/>
                <path d="M 300 340 L 300 400 M 280 360 L 300 340 L 320 360" stroke="#c7b6f9" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
                <rect x="270" y="400" width="60" height="8" rx="4" fill="#c7b6f9" opacity="0.8"/>

                <!-- Text -->
                <text x="300" y="480" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#c7b6f9" text-anchor="middle" opacity="0.9">Tap to Upload</text>
                <text x="300" y="520" font-family="Arial, sans-serif" font-size="28" fill="#a0aec0" text-anchor="middle" opacity="0.8">Your Photocard</text>
            </svg>
        `;

        const img = new Image();
        img.onload = () => {
            this.photocardImage = img;
            this.isPlaceholder = true;

            // Add placeholder-active class for animation
            this.canvas.classList.add('placeholder-active');

            // Center photocard on canvas
            const rect = this.canvas.getBoundingClientRect();
            this.photocard.x = rect.width / 2;
            this.photocard.y = rect.height / 2;
            this.photocard.scale = Math.min(rect.width, rect.height) / (img.width * 1.5);

            this.render();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(placeholderSvg);
    },

    /**
     * Load photocard image
     */
    loadPhotocard(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.photocardImage = img;
                    this.isPlaceholder = false;

                    // Remove placeholder-active class
                    this.canvas.classList.remove('placeholder-active');

                    // Reset cursor to grab
                    this.canvas.style.cursor = 'grab';

                    // Center photocard on canvas
                    const rect = this.canvas.getBoundingClientRect();
                    this.photocard.x = rect.width / 2;
                    this.photocard.y = rect.height / 2;
                    this.photocard.scale = Math.min(rect.width, rect.height) / (img.width * 1.5);

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

        // Draw camera feed if active
        if (this.camera.active && this.camera.video) {
            this.drawCameraFeed();
        }
        // Otherwise draw background image
        else if (this.backgroundImage) {
            this.drawBackground();
        }

        // Draw photocard (layer order)
        if (this.photocardImage) {
            if (this.photocard.layer === 'back') {
                this.drawPhotocard();
            }
        }

        // Draw border
        if (window.BorderManager) {
            window.BorderManager.drawBorder(this.ctx, width, height);
        }

        // Draw photocard on top if layer is front
        if (this.photocardImage && this.photocard.layer === 'front') {
            this.drawPhotocard();
        }
    },

    /**
     * Draw camera feed
     */
    drawCameraFeed() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        this.ctx.save();

        // Calculate cover sizing for video
        const videoRatio = this.camera.video.videoWidth / this.camera.video.videoHeight;
        const canvasRatio = width / height;

        let baseWidth, baseHeight;

        if (videoRatio > canvasRatio) {
            baseHeight = height;
            baseWidth = height * videoRatio;
        } else {
            baseWidth = width;
            baseHeight = width / videoRatio;
        }

        // Apply transformations (same as background)
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

        // Draw video centered
        this.ctx.drawImage(
            this.camera.video,
            -baseWidth / 2,
            -baseHeight / 2,
            baseWidth,
            baseHeight
        );

        this.ctx.restore();
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
     * Draw photocard image with transformations
     */
    drawPhotocard() {
        this.ctx.save();

        // Translate to photocard position
        this.ctx.translate(this.photocard.x, this.photocard.y);

        // Rotate
        this.ctx.rotate(this.photocard.rotation);

        // Scale
        const scaleX = this.photocard.scale * (this.photocard.flipH ? -1 : 1);
        const scaleY = this.photocard.scale * (this.photocard.flipV ? -1 : 1);
        this.ctx.scale(scaleX, scaleY);

        // Draw image centered
        const width = this.photocardImage.width;
        const height = this.photocardImage.height;
        this.ctx.drawImage(this.photocardImage, -width / 2, -height / 2, width, height);

        // Draw toploader overlay if enabled
        if (this.photocard.showToploader) {
            this.drawToploader(width, height);
        }

        this.ctx.restore();
    },

    /**
     * Draw toploader overlay on the photocard
     * Creates a realistic thick plastic sleeve with frame effect
     */
    drawToploader(width, height) {
        // Increase toploader size to overlap the photocard more
        const overlap = 41.2; // pixels of overlap on each side (increased by 3%)
        const bottomOverlap = 85; // extra overlap at bottom
        const toploaderWidth = width + (overlap * 2);
        const toploaderHeight = height + overlap + bottomOverlap;

        const x = -(toploaderWidth / 2);
        const y = -(height / 2) - overlap;
        const topCornerRadius = 56;
        const bottomCornerRadius = 33.6;
        const frameThicknessLeft = 10.08; // left border thickness
        const frameThicknessRight = 6.24; // right border thickness

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
        this.ctx.lineTo(x + frameThicknessLeft + (bottomCornerRadius - frameThicknessLeft), y + toploaderHeight - frameThicknessLeft);
        this.ctx.arcTo(x + frameThicknessLeft, y + toploaderHeight - frameThicknessLeft, x + frameThicknessLeft, y + toploaderHeight - frameThicknessLeft - (bottomCornerRadius - frameThicknessLeft), bottomCornerRadius - frameThicknessLeft);
        this.ctx.lineTo(x + frameThicknessLeft, y + frameThicknessLeft + (topCornerRadius - frameThicknessLeft));
        this.ctx.arcTo(x + frameThicknessLeft, y + frameThicknessLeft, x + frameThicknessLeft + (topCornerRadius - frameThicknessLeft), y + frameThicknessLeft, topCornerRadius - frameThicknessLeft);
        this.ctx.lineTo(x + topCornerRadius, y);
        this.ctx.closePath();

        const westGradient = this.ctx.createLinearGradient(x, y, x + topCornerRadius * 0.8, y);
        westGradient.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        westGradient.addColorStop(0.6, 'rgba(245, 245, 250, 0.26)');
        westGradient.addColorStop(1, 'rgba(235, 235, 245, 0)');
        this.ctx.fillStyle = westGradient;
        this.ctx.fill();

        // 3. East (right) side - white border with reflection
        this.ctx.beginPath();
        this.ctx.moveTo(x + toploaderWidth - topCornerRadius, y);
        this.ctx.arcTo(x + toploaderWidth, y, x + toploaderWidth, y + topCornerRadius, topCornerRadius);
        this.ctx.lineTo(x + toploaderWidth, y + toploaderHeight - bottomCornerRadius);
        this.ctx.arcTo(x + toploaderWidth, y + toploaderHeight, x + toploaderWidth - bottomCornerRadius, y + toploaderHeight, bottomCornerRadius);
        this.ctx.lineTo(x + toploaderWidth - frameThicknessRight - (bottomCornerRadius - frameThicknessRight), y + toploaderHeight - frameThicknessRight);
        this.ctx.arcTo(x + toploaderWidth - frameThicknessRight, y + toploaderHeight - frameThicknessRight, x + toploaderWidth - frameThicknessRight, y + toploaderHeight - frameThicknessRight - (bottomCornerRadius - frameThicknessRight), bottomCornerRadius - frameThicknessRight);
        this.ctx.lineTo(x + toploaderWidth - frameThicknessRight, y + frameThicknessRight + (topCornerRadius - frameThicknessRight));
        this.ctx.arcTo(x + toploaderWidth - frameThicknessRight, y + frameThicknessRight, x + toploaderWidth - frameThicknessRight - (topCornerRadius - frameThicknessRight), y + frameThicknessRight, topCornerRadius - frameThicknessRight);
        this.ctx.lineTo(x + toploaderWidth - topCornerRadius, y);
        this.ctx.closePath();

        const eastGradient = this.ctx.createLinearGradient(x + toploaderWidth, y, x + toploaderWidth - topCornerRadius * 0.8, y);
        eastGradient.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        eastGradient.addColorStop(0.6, 'rgba(245, 245, 250, 0.26)');
        eastGradient.addColorStop(1, 'rgba(235, 235, 245, 0)');
        this.ctx.fillStyle = eastGradient;
        this.ctx.fill();

        // 4. South (bottom) side - white border (shortened)
        const southBorderStart = x + bottomCornerRadius * 1;
        const southBorderEnd = x + toploaderWidth - bottomCornerRadius * 1;
        const frameThicknessBottom = frameThicknessLeft;

        this.ctx.beginPath();
        this.ctx.moveTo(southBorderStart, y + toploaderHeight);
        this.ctx.lineTo(southBorderEnd, y + toploaderHeight);
        this.ctx.lineTo(southBorderEnd, y + toploaderHeight - frameThicknessBottom);
        this.ctx.lineTo(southBorderStart, y + toploaderHeight - frameThicknessBottom);
        this.ctx.closePath();

        const southGradient = this.ctx.createLinearGradient(southBorderStart, y + toploaderHeight, southBorderEnd, y + toploaderHeight);
        southGradient.addColorStop(0, 'rgba(255, 255, 255, 0.325)');
        southGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
        southGradient.addColorStop(1, 'rgba(255, 255, 255, 0.325)');
        this.ctx.fillStyle = southGradient;
        this.ctx.fill();

        // Add blur effect to the area under toploader
        this.ctx.filter = 'blur(1px)';
        roundedRect(x, y, toploaderWidth, toploaderHeight, topCornerRadius, bottomCornerRadius);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fill();
        this.ctx.filter = 'none';

        // 2. Inner viewing area (semi-transparent center)
        const innerX = x + frameThicknessLeft;
        const innerY = y + frameThicknessLeft;
        const innerWidth = toploaderWidth - frameThicknessLeft - frameThicknessRight;
        const innerHeight = toploaderHeight - frameThicknessLeft - frameThicknessBottom;

        roundedRect(innerX, innerY, innerWidth, innerHeight, topCornerRadius - frameThicknessLeft, bottomCornerRadius - frameThicknessLeft);
        this.ctx.fillStyle = 'rgba(240, 245, 255, 0.07)';
        this.ctx.fill();

        // Inner shadow for depth
        this.ctx.strokeStyle = 'rgba(180, 190, 210, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Add frosted glass effect
        roundedRect(innerX, innerY, innerWidth, innerHeight, topCornerRadius - frameThicknessLeft, bottomCornerRadius - frameThicknessLeft);
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

        roundedRect(innerX, innerY, innerWidth, innerHeight * 0.35, topCornerRadius - frameThicknessLeft, 0);
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
     * Photocard transform operations
     */
    updatePhotocard(property, value) {
        if (!this.photocardImage) return;
        this.photocard[property] = value;
        this.render();
    },

    flipPhotocardHorizontal() {
        if (!this.photocardImage) return;
        this.photocard.flipH = !this.photocard.flipH;
        this.render();
    },

    flipPhotocardVertical() {
        if (!this.photocardImage) return;
        this.photocard.flipV = !this.photocard.flipV;
        this.render();
    },

    resetPhotocard() {
        if (!this.photocardImage) return;
        const rect = this.canvas.getBoundingClientRect();
        this.photocard = {
            x: rect.width / 2,
            y: rect.height / 2,
            scale: Math.min(rect.width, rect.height) / (this.photocardImage.width * 1.5),
            rotation: 0,
            flipH: false,
            flipV: false,
            layer: this.photocard.layer,
            showToploader: this.photocard.showToploader
        };
        this.render();
    },

    bringToFront() {
        if (!this.photocardImage) return;
        this.photocard.layer = 'front';
        this.render();
    },

    sendToBack() {
        if (!this.photocardImage) return;
        this.photocard.layer = 'back';
        this.render();
    },

    /**
     * Toggle toploader visibility
     */
    toggleToploader(show) {
        this.photocard.showToploader = show;
        this.render();
    },

    // Legacy methods for backward compatibility
    flipHorizontal() {
        this.flipPhotocardHorizontal();
    },

    flipVertical() {
        this.flipPhotocardVertical();
    },

    rotateLeft() {
        if (!this.photocardImage) return;
        this.photocard.rotation -= Math.PI / 2;
        this.render();
    },

    rotateRight() {
        if (!this.photocardImage) return;
        this.photocard.rotation += Math.PI / 2;
        this.render();
    },

    /**
     * Reset canvas
     */
    reset() {
        this.backgroundImage = null;
        this.photocardImage = null;
        this.isPlaceholder = false;
        this.background = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            flipH: false,
            flipV: false
        };
        this.photocard = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            flipH: false,
            flipV: false,
            layer: 'front',
            showToploader: true
        };

        // Reload placeholder photocard
        this.loadPlaceholderPhotocard();
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
