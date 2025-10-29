/**
 * ui.js
 * Manages UI interactions, toolbar events, and modals
 */

const UIManager = {
    elements: {},

    /**
     * Initialize UI manager
     */
    init(canvasInstance) {
        this.canvas = canvasInstance;
        this.cacheElements();
        this.attachEventListeners();
        this.initializeLucideIcons();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Toolbar toggle
            toolbarToggle: document.getElementById('toolbar-toggle'),
            toolbarToggleIcon: document.getElementById('toolbar-toggle-icon'),
            toolbar: document.getElementById('toolbar'),

            // File inputs
            bgFileInput: document.getElementById('bg-file-input'),
            objektFileInput: document.getElementById('objekt-file-input'),

            // Upload buttons
            uploadBgBtn: document.getElementById('upload-bg-btn'),
            uploadObjektBtn: document.getElementById('upload-objekt-btn'),

            // Background controls
            bgXSlider: document.getElementById('bg-x-slider'),
            bgYSlider: document.getElementById('bg-y-slider'),
            bgScaleSlider: document.getElementById('bg-scale-slider'),
            bgRotationSlider: document.getElementById('bg-rotation-slider'),
            bgXValue: document.getElementById('bg-x-value'),
            bgYValue: document.getElementById('bg-y-value'),
            bgScaleValue: document.getElementById('bg-scale-value'),
            bgRotationValue: document.getElementById('bg-rotation-value'),
            bgFlipHBtn: document.getElementById('bg-flip-h-btn'),
            bgFlipVBtn: document.getElementById('bg-flip-v-btn'),
            bgResetBtn: document.getElementById('bg-reset-btn'),

            // Objekt controls
            objektXSlider: document.getElementById('objekt-x-slider'),
            objektYSlider: document.getElementById('objekt-y-slider'),
            objektScaleSlider: document.getElementById('objekt-scale-slider'),
            objektRotationSlider: document.getElementById('objekt-rotation-slider'),
            objektXValue: document.getElementById('objekt-x-value'),
            objektYValue: document.getElementById('objekt-y-value'),
            objektScaleValue: document.getElementById('objekt-scale-value'),
            objektRotationValue: document.getElementById('objekt-rotation-value'),
            objektFlipHBtn: document.getElementById('objekt-flip-h-btn'),
            objektFlipVBtn: document.getElementById('objekt-flip-v-btn'),
            objektResetBtn: document.getElementById('objekt-reset-btn'),

            // Toploader toggle
            toploaderToggle: document.getElementById('toploader-toggle'),

            // Layer buttons
            bringFrontBtn: document.getElementById('bring-front-btn'),
            sendBackBtn: document.getElementById('send-back-btn'),

            // Action buttons
            resetBtn: document.getElementById('reset-btn'),
            saveBtn: document.getElementById('save-btn'),
            qrBtn: document.getElementById('qr-btn'),

            // Canvas overlay
            canvasOverlay: document.getElementById('canvas-overlay'),

            // Modal
            qrModal: document.getElementById('qr-modal'),
            qrModalClose: document.getElementById('qr-modal-close'),
            qrCodeContainer: document.getElementById('qr-code-container'),
            shareUrlInput: document.getElementById('share-url'),
            copyUrlBtn: document.getElementById('copy-url-btn')
        };
    },

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Upload buttons
        this.elements.uploadBgBtn.addEventListener('click', () => {
            this.elements.bgFileInput.click();
        });

        this.elements.uploadObjektBtn.addEventListener('click', () => {
            this.elements.objektFileInput.click();
        });

        // File inputs
        this.elements.bgFileInput.addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });

        this.elements.objektFileInput.addEventListener('change', (e) => {
            this.handleObjektUpload(e);
        });

        // Background sliders
        this.elements.bgXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateBackground('x', value);
            this.elements.bgXValue.textContent = Math.round(value);
        });

        this.elements.bgYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateBackground('y', value);
            this.elements.bgYValue.textContent = Math.round(value);
        });

        this.elements.bgScaleSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateBackground('scale', value);
            this.elements.bgScaleValue.textContent = value.toFixed(2);
        });

        this.elements.bgRotationSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateBackground('rotation', value);
            this.elements.bgRotationValue.textContent = Math.round(value) + '°';
        });

        // Background buttons
        this.elements.bgFlipHBtn.addEventListener('click', () => {
            this.canvas.flipBackgroundHorizontal();
        });

        this.elements.bgFlipVBtn.addEventListener('click', () => {
            this.canvas.flipBackgroundVertical();
        });

        this.elements.bgResetBtn.addEventListener('click', () => {
            this.canvas.resetBackground();
            this.syncBackgroundSliders();
        });

        // Objekt sliders
        this.elements.objektXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateObjekt('x', value);
            this.elements.objektXValue.textContent = Math.round(value);
        });

        this.elements.objektYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateObjekt('y', value);
            this.elements.objektYValue.textContent = Math.round(value);
        });

        this.elements.objektScaleSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updateObjekt('scale', value);
            this.elements.objektScaleValue.textContent = value.toFixed(2);
        });

        this.elements.objektRotationSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const radians = (value * Math.PI) / 180;
            this.canvas.updateObjekt('rotation', radians);
            this.elements.objektRotationValue.textContent = Math.round(value) + '°';
        });

        // Objekt buttons
        this.elements.objektFlipHBtn.addEventListener('click', () => {
            this.canvas.flipObjektHorizontal();
        });

        this.elements.objektFlipVBtn.addEventListener('click', () => {
            this.canvas.flipObjektVertical();
        });

        this.elements.objektResetBtn.addEventListener('click', () => {
            this.canvas.resetObjekt();
            this.syncObjektSliders();
        });

        // Toploader toggle
        this.elements.toploaderToggle.addEventListener('change', (e) => {
            this.toggleToploader(e.target.checked);
        });

        // Layer buttons
        this.elements.bringFrontBtn.addEventListener('click', () => {
            this.canvas.bringToFront();
        });

        this.elements.sendBackBtn.addEventListener('click', () => {
            this.canvas.sendToBack();
        });

        // Action buttons
        this.elements.resetBtn.addEventListener('click', () => {
            this.handleReset();
        });

        this.elements.saveBtn.addEventListener('click', () => {
            this.handleSave();
        });

        this.elements.qrBtn.addEventListener('click', () => {
            this.handleQRCode();
        });

        // Modal
        this.elements.qrModalClose.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.qrModal.addEventListener('click', (e) => {
            if (e.target === this.elements.qrModal) {
                this.closeModal();
            }
        });

        this.elements.copyUrlBtn.addEventListener('click', () => {
            this.copyShareUrl();
        });

        // Drag and drop for canvas
        const canvas = document.getElementById('proofshot-canvas');
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleDrop(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Toolbar toggle (mobile)
        const toolbarToggle = this.elements.toolbarToggle;
        if (toolbarToggle) {
            toolbarToggle.addEventListener('click', () => {
                this.toggleToolbar();
            });
            this.initMobileToggle();
        }
    },

    /**
     * Toggle toolbar visibility (mobile)
     */
    toggleToolbar() {
        const toolbar = this.elements.toolbar;
        const toggle = this.elements.toolbarToggle;
        
        toolbar.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
    },

    /**
     * Initialize mobile toolbar toggle
     */
    initMobileToggle() {
        if (window.innerWidth <= 767) {
            const toggle = this.elements.toolbarToggle;
            if (toggle) {
                toggle.style.display = 'flex';
                this.initializeLucideIcons();
            }
        }
    },

    /**
     * Initialize Lucide icons
     */
    initializeLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Handle background image upload
     */
    async handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        try {
            this.showLoading('Loading background...');
            await this.canvas.loadBackground(file);
            this.hideCanvasOverlay();
            this.syncBackgroundSliders();
            this.showNotification('Background loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading background:', error);
            this.showNotification('Failed to load background', 'error');
        } finally {
            this.hideLoading();
            e.target.value = ''; // Reset file input
        }
    },

    /**
     * Handle objekt image upload
     */
    async handleObjektUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        try {
            this.showLoading('Loading objekt...');
            await this.canvas.loadObjekt(file);
            this.syncObjektSliders();
            this.showNotification('Objekt loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading objekt:', error);
            this.showNotification('Failed to load objekt', 'error');
        } finally {
            this.hideLoading();
            e.target.value = ''; // Reset file input
        }
    },

    /**
     * Handle drag and drop
     */
    async handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            this.showNotification('Please drop image files', 'error');
            return;
        }

        // First image as background, second as objekt
        if (imageFiles.length >= 1) {
            await this.canvas.loadBackground(imageFiles[0]);
            this.syncBackgroundSliders();
            this.hideCanvasOverlay();
        }

        if (imageFiles.length >= 2) {
            await this.canvas.loadObjekt(imageFiles[1]);
            this.syncObjektSliders();
        }
    },

    /**
     * Handle reset
     */
    handleReset() {
        if (!confirm('Are you sure you want to reset the canvas? This will clear all images.')) {
            return;
        }

        this.canvas.reset();
        this.syncBackgroundSliders();
        this.syncObjektSliders();
        this.showCanvasOverlay();
        this.showNotification('Canvas reset', 'success');
    },

    /**
     * Handle save/export
     */
    async handleSave() {
        if (!this.canvas.backgroundImage && !this.canvas.objektImage) {
            this.showNotification('Please add images before saving', 'error');
            return;
        }

        try {
            this.showLoading('Exporting...');
            const isMobile = window.innerWidth <= 767;
            const canvas = this.canvas.canvas;
            const filename = `proofshot-${Date.now()}.png`;

            // Use Web Share API on mobile
            if (isMobile) {
                const shared = await this.exportImageShare(canvas, filename);
                if (shared) {
                    this.showNotification('Shared successfully', 'success');
                }
                return;
            }

            // Desktop: standard download
            const blob = await this.canvas.exportImage();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Proofshot saved successfully', 'success');
        } catch (error) {
            console.error('Error saving:', error);
            this.showNotification('Failed to save proofshot', 'error');
        } finally {
            this.hideLoading();
        }
    },

    /**
     * Export image using Web Share API
     */
    async exportImageShare(canvas, filename) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('Failed to create image blob'));
                    return;
                }

                try {
                    const file = new File([blob], filename, { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'Proofshot',
                            text: 'Check out my proofshot!'
                        });
                        resolve(true);
                    } else {
                        // Fallback to download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve(true);
                    }
                } catch (shareError) {
                    if (shareError.name === 'AbortError') {
                        resolve(false);
                    } else {
                        // Fallback to download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve(true);
                    }
                }
            }, 'image/png', 0.95);
        });
    },

    /**
     * Handle QR code generation
     */
    handleQRCode() {
        const currentUrl = window.location.href;

        // Clear previous QR code
        this.elements.qrCodeContainer.innerHTML = '';

        // Generate QR code
        if (typeof QRCode !== 'undefined') {
            new QRCode(this.elements.qrCodeContainer, {
                text: currentUrl,
                width: 200,
                height: 200,
                colorDark: '#2d3748',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            this.showNotification('QR code library not loaded', 'error');
            return;
        }

        // Set share URL
        this.elements.shareUrlInput.value = currentUrl;

        // Show modal
        this.openModal();
    },

    /**
     * Copy share URL to clipboard
     */
    async copyShareUrl() {
        const url = this.elements.shareUrlInput.value;

        try {
            await navigator.clipboard.writeText(url);
            this.showNotification('Link copied to clipboard', 'success');

            // Visual feedback
            const btn = this.elements.copyUrlBtn;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
            this.initializeLucideIcons();

            setTimeout(() => {
                btn.innerHTML = originalText;
                this.initializeLucideIcons();
            }, 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Failed to copy link', 'error');
        }
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.handleReset();
                }
                break;
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.handleSave();
                }
                break;
            case 'h':
                this.canvas.flipHorizontal();
                break;
            case 'v':
                this.canvas.flipVertical();
                break;
            case '[':
                this.canvas.rotateLeft();
                break;
            case ']':
                this.canvas.rotateRight();
                break;
            case 'escape':
                this.closeModal();
                break;
        }
    },

    /**
     * Toggle toploader visibility
     */
    toggleToploader(show) {
        this.canvas.toggleToploader(show);
    },

    /**
     * Show canvas overlay
     */
    showCanvasOverlay() {
        this.elements.canvasOverlay.classList.remove('hidden');
    },

    /**
     * Hide canvas overlay
     */
    hideCanvasOverlay() {
        this.elements.canvasOverlay.classList.add('hidden');
    },

    /**
     * Open modal
     */
    openModal() {
        this.elements.qrModal.classList.add('active');
    },

    /**
     * Close modal
     */
    closeModal() {
        this.elements.qrModal.classList.remove('active');
    },

    /**
     * Show loading indicator
     */
    showLoading(message = 'Loading...') {
        // Simple implementation - could be enhanced with a proper loading overlay
        console.log('Loading:', message);
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        console.log('Loading complete');
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple console notification - could be enhanced with toast notifications
        const styles = {
            info: 'color: #3182ce',
            success: 'color: #38a169',
            error: 'color: #e53e3e'
        };

        console.log(`%c${message}`, styles[type] || styles.info);

        // Could also create a toast element here for visual feedback
        this.createToast(message, type);
    },

    /**
     * Create toast notification
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add styles
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: type === 'success' ? '#6dd5a0' : type === 'error' ? '#ff6b9d' : '#c7b6f9',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px'
        });

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    },

    /**
     * Sync background sliders with canvas state
     */
    syncBackgroundSliders() {
        const bg = this.canvas.background;

        this.elements.bgXSlider.value = bg.x;
        this.elements.bgXValue.textContent = Math.round(bg.x);

        this.elements.bgYSlider.value = bg.y;
        this.elements.bgYValue.textContent = Math.round(bg.y);

        this.elements.bgScaleSlider.value = bg.scale;
        this.elements.bgScaleValue.textContent = bg.scale.toFixed(2);

        this.elements.bgRotationSlider.value = bg.rotation;
        this.elements.bgRotationValue.textContent = Math.round(bg.rotation) + '°';
    },

    /**
     * Sync objekt sliders with canvas state
     */
    syncObjektSliders() {
        const obj = this.canvas.objekt;
        const rect = this.canvas.canvas.getBoundingClientRect();

        // Update slider max values based on canvas size
        this.elements.objektXSlider.max = rect.width;
        this.elements.objektYSlider.max = rect.height;

        this.elements.objektXSlider.value = obj.x;
        this.elements.objektXValue.textContent = Math.round(obj.x);

        this.elements.objektYSlider.value = obj.y;
        this.elements.objektYValue.textContent = Math.round(obj.y);

        this.elements.objektScaleSlider.value = obj.scale;
        this.elements.objektScaleValue.textContent = obj.scale.toFixed(2);

        const degrees = (obj.rotation * 180) / Math.PI;
        this.elements.objektRotationSlider.value = degrees;
        this.elements.objektRotationValue.textContent = Math.round(degrees) + '°';
    }
};

// Add toast animations to document
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
