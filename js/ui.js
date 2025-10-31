/**
 * ui.js
 * Manages UI interactions, toolbar events, and modals
 */

const UIManager = {
    elements: {},
    cameraAspectRatio: '3:4', // Default aspect ratio
    canvasAspectRatio: '3:4', // Canvas aspect ratio after capture

    /**
     * Initialize UI manager
     */
    init(canvasInstance) {
        this.canvas = canvasInstance;
        this.cacheElements();
        this.attachEventListeners();
        this.initializeLucideIcons();

        // Show mobile home screen on mobile devices
        if (window.innerWidth <= 767 && this.elements.mobileHome) {
            this.elements.mobileHome.classList.add('active');
        }

        // Sync photocard sliders with the initial placeholder
        setTimeout(() => {
            this.syncPhotocardSliders();
        }, 100);
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Mobile home
            mobileHome: document.getElementById('mobile-home'),
            launchCameraBtn: document.getElementById('launch-camera-btn'),

            // Toolbar toggle
            toolbarToggle: document.getElementById('toolbar-toggle'),
            toolbarToggleIcon: document.getElementById('toolbar-toggle-icon'),
            toolbar: document.getElementById('toolbar'),

            // File inputs
            bgFileInput: document.getElementById('bg-file-input'),
            photocardFileInput: document.getElementById('photocard-file-input'),

            // Upload buttons
            uploadBgBtn: document.getElementById('upload-bg-btn'),
            uploadPhotocardBtn: document.getElementById('upload-photocard-btn'),

            // Camera elements
            cameraBtn: document.getElementById('camera-btn'),
            cameraControls: document.getElementById('camera-controls'),
            cameraShutterBtn: document.getElementById('camera-shutter-btn'),
            cameraUploadBgBtn: document.getElementById('camera-upload-bg-btn'),
            cameraAddPhotocardBtn: document.getElementById('camera-add-photocard-btn'),
            cameraAspectRatioBtn: document.getElementById('camera-aspect-ratio-btn'),
            cameraResetPhotocardBtn: document.getElementById('camera-reset-photocard-btn'),
            cameraActionButtons: document.getElementById('camera-action-buttons'),
            cameraSaveBtn: document.getElementById('camera-save-btn'),
            cameraDiscardBtn: document.getElementById('camera-discard-btn'),

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

            // Photocard controls
            photocardXSlider: document.getElementById('photocard-x-slider'),
            photocardYSlider: document.getElementById('photocard-y-slider'),
            photocardScaleSlider: document.getElementById('photocard-scale-slider'),
            photocardRotationSlider: document.getElementById('photocard-rotation-slider'),
            photocardXValue: document.getElementById('photocard-x-value'),
            photocardYValue: document.getElementById('photocard-y-value'),
            photocardScaleValue: document.getElementById('photocard-scale-value'),
            photocardRotationValue: document.getElementById('photocard-rotation-value'),
            photocardFlipHBtn: document.getElementById('photocard-flip-h-btn'),
            photocardFlipVBtn: document.getElementById('photocard-flip-v-btn'),
            photocardResetBtn: document.getElementById('photocard-reset-btn'),
            photocardResetTransformBtn: document.getElementById('photocard-reset-transform-btn'),

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
        // Mobile home launch camera button
        if (this.elements.launchCameraBtn) {
            this.elements.launchCameraBtn.addEventListener('click', () => {
                this.handleLaunchCamera();
            });
        }

        // Upload buttons
        this.elements.uploadBgBtn.addEventListener('click', () => {
            this.elements.bgFileInput.click();
        });

        this.elements.uploadPhotocardBtn.addEventListener('click', () => {
            this.elements.photocardFileInput.click();
        });

        // Camera button
        if (this.elements.cameraBtn) {
            this.elements.cameraBtn.addEventListener('click', () => {
                this.handleCameraStart();
            });
        }

        // Camera controls
        if (this.elements.cameraShutterBtn) {
            this.elements.cameraShutterBtn.addEventListener('click', () => {
                this.handleCameraCapture();
            });
        }

        if (this.elements.cameraUploadBgBtn) {
            this.elements.cameraUploadBgBtn.addEventListener('click', () => {
                this.handleCameraUploadBackground();
            });
        }

        if (this.elements.cameraAddPhotocardBtn) {
            this.elements.cameraAddPhotocardBtn.addEventListener('click', () => {
                this.handleCameraAddPhotocard();
            });
        }

        if (this.elements.cameraAspectRatioBtn) {
            this.elements.cameraAspectRatioBtn.addEventListener('click', () => {
                this.handleAspectRatioToggle();
            });
        }

        if (this.elements.cameraResetPhotocardBtn) {
            this.elements.cameraResetPhotocardBtn.addEventListener('click', () => {
                this.handleCameraResetPhotocard();
            });
        }

        if (this.elements.cameraSaveBtn) {
            this.elements.cameraSaveBtn.addEventListener('click', () => {
                this.handleCameraSave();
            });
        }

        if (this.elements.cameraDiscardBtn) {
            this.elements.cameraDiscardBtn.addEventListener('click', () => {
                this.handleCameraDiscard();
            });
        }

        // File inputs
        this.elements.bgFileInput.addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });

        this.elements.photocardFileInput.addEventListener('change', (e) => {
            this.handlePhotocardUpload(e);
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

        // Photocard sliders
        this.elements.photocardXSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updatePhotocard('x', value);
            this.elements.photocardXValue.textContent = Math.round(value);
        });

        this.elements.photocardYSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updatePhotocard('y', value);
            this.elements.photocardYValue.textContent = Math.round(value);
        });

        this.elements.photocardScaleSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.canvas.updatePhotocard('scale', value);
            this.elements.photocardScaleValue.textContent = value.toFixed(2);
        });

        this.elements.photocardRotationSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const radians = (value * Math.PI) / 180;
            this.canvas.updatePhotocard('rotation', radians);
            this.elements.photocardRotationValue.textContent = Math.round(value) + '°';
        });

        // Photocard buttons
        this.elements.photocardFlipHBtn.addEventListener('click', () => {
            this.canvas.flipPhotocardHorizontal();
        });

        this.elements.photocardFlipVBtn.addEventListener('click', () => {
            this.canvas.flipPhotocardVertical();
        });

        this.elements.photocardResetBtn.addEventListener('click', () => {
            this.canvas.resetPhotocard();
            this.syncPhotocardSliders();
        });

        this.elements.photocardResetTransformBtn.addEventListener('click', () => {
            this.canvas.resetPhotocard();
            this.syncPhotocardSliders();
            this.showNotification('Photocard position and size reset', 'success');
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

            // If camera is active, stop it
            if (this.canvas.camera.active) {
                this.canvas.stopCamera();

                // Hide camera controls
                if (this.elements.cameraControls) {
                    this.elements.cameraControls.classList.remove('active');
                }
                if (this.elements.cameraAspectRatioBtn) {
                    this.elements.cameraAspectRatioBtn.classList.remove('active');
                }
                if (this.elements.cameraResetPhotocardBtn) {
                    this.elements.cameraResetPhotocardBtn.classList.remove('active');
                }

                // Exit fullscreen mode
                const canvasContainer = document.querySelector('.canvas-container');
                if (canvasContainer) {
                    canvasContainer.classList.remove('camera-active');
                    const canvas = document.getElementById('proofshot-canvas');
                    if (canvas) {
                        canvas.style.width = '';
                        canvas.style.height = '';
                    }
                }
            }

            await this.canvas.loadBackground(file);
            this.hideCanvasOverlay();
            this.syncBackgroundSliders();

            // Resize canvas after upload
            setTimeout(() => {
                this.canvas.resizeCanvas();
            }, 100);

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
     * Handle photocard image upload
     */
    async handlePhotocardUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        try {
            this.showLoading('Loading photocard...');
            await this.canvas.loadPhotocard(file);
            this.syncPhotocardSliders();
            this.showNotification('Photocard loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading photocard:', error);
            this.showNotification('Failed to load photocard', 'error');
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

        // First image as background, second as photocard
        if (imageFiles.length >= 1) {
            await this.canvas.loadBackground(imageFiles[0]);
            this.syncBackgroundSliders();
            this.hideCanvasOverlay();
        }

        if (imageFiles.length >= 2) {
            await this.canvas.loadPhotocard(imageFiles[1]);
            this.syncPhotocardSliders();
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
        this.syncPhotocardSliders();
        this.showCanvasOverlay();
        this.showNotification('Canvas reset', 'success');
    },

    /**
     * Handle save/export
     */
    async handleSave() {
        if (!this.canvas.backgroundImage) {
            this.showNotification('Please add a background image before saving', 'error');
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
     * Handle launch camera from mobile home
     */
    async handleLaunchCamera() {
        // Hide mobile home
        if (this.elements.mobileHome) {
            this.elements.mobileHome.classList.remove('active');
        }

        // Start camera
        await this.handleCameraStart();
    },

    /**
     * Handle camera start
     */
    async handleCameraStart() {
        try {
            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showNotification('Camera not supported on this device', 'error');
                return;
            }

            this.showLoading('Starting camera...');
            await this.canvas.startCamera();

            // Show camera controls
            if (this.elements.cameraControls) {
                this.elements.cameraControls.classList.add('active');
            }

            // Show aspect ratio button
            if (this.elements.cameraAspectRatioBtn) {
                this.elements.cameraAspectRatioBtn.classList.add('active');
            }

            // Show reset photocard button
            if (this.elements.cameraResetPhotocardBtn) {
                this.elements.cameraResetPhotocardBtn.classList.add('active');
            }

            // Make canvas container fullscreen with aspect ratio
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.add('camera-active');
                this.applyAspectRatio(canvasContainer);
                // Resize canvas to fit fullscreen
                setTimeout(() => {
                    this.canvas.resizeCanvas();
                }, 100);
            }

            // Hide canvas overlay
            this.hideCanvasOverlay();

            // Collapse toolbar on mobile
            if (window.innerWidth <= 767) {
                this.elements.toolbar.classList.add('collapsed');
            }

            // Don't show notification - keep UI clean
        } catch (error) {
            console.error('Error starting camera:', error);

            let errorMessage = 'Failed to access camera';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = 'No camera found on this device';
            }

            this.showNotification(errorMessage, 'error');
        } finally {
            this.hideLoading();
        }
    },

    /**
     * Handle camera capture
     */
    handleCameraCapture() {
        try {
            // Save the current aspect ratio
            this.canvasAspectRatio = this.cameraAspectRatio;

            // Capture the current frame
            this.canvas.captureFrame();

            // Hide camera controls
            if (this.elements.cameraControls) {
                this.elements.cameraControls.classList.remove('active');
            }

            // Hide aspect ratio button
            if (this.elements.cameraAspectRatioBtn) {
                this.elements.cameraAspectRatioBtn.classList.remove('active');
            }

            // Hide reset photocard button
            if (this.elements.cameraResetPhotocardBtn) {
                this.elements.cameraResetPhotocardBtn.classList.remove('active');
            }

            // Hide upload background and add photocard buttons
            if (this.elements.cameraUploadBgBtn) {
                this.elements.cameraUploadBgBtn.style.display = 'none';
            }
            if (this.elements.cameraAddPhotocardBtn) {
                this.elements.cameraAddPhotocardBtn.style.display = 'none';
            }

            // Exit fullscreen mode but keep aspect ratio
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.remove('camera-active');

                // Keep the aspect ratio for the canvas
                this.applyCanvasAspectRatio(canvasContainer);

                // Reset canvas style
                const canvas = document.getElementById('proofshot-canvas');
                if (canvas) {
                    canvas.style.width = '';
                    canvas.style.height = '';
                }

                // Resize canvas to new aspect ratio
                setTimeout(() => {
                    this.canvas.resizeCanvas();
                }, 100);
            }

            // Show action buttons after capture
            if (this.elements.cameraActionButtons) {
                this.elements.cameraActionButtons.classList.add('active');
            }

            // Show success notification with flash effect
            this.showCameraFlash();
            this.showNotification('Photo captured!', 'success');
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showNotification('Failed to capture photo', 'error');
        }
    },

    /**
     * Handle camera close
     */
    handleCameraClose() {
        this.canvas.stopCamera();

        // Hide camera controls
        if (this.elements.cameraControls) {
            this.elements.cameraControls.classList.remove('active');
        }

        // Hide aspect ratio button
        if (this.elements.cameraAspectRatioBtn) {
            this.elements.cameraAspectRatioBtn.classList.remove('active');
        }

        // Hide reset photocard button
        if (this.elements.cameraResetPhotocardBtn) {
            this.elements.cameraResetPhotocardBtn.classList.remove('active');
        }

        // Hide action buttons
        if (this.elements.cameraActionButtons) {
            this.elements.cameraActionButtons.classList.remove('active');
        }

        // Exit fullscreen mode
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.classList.remove('camera-active');
            // Remove aspect ratio classes
            canvasContainer.classList.remove('aspect-3-4', 'aspect-9-16', 'aspect-1-1');

            // Reset canvas style
            const canvas = document.getElementById('proofshot-canvas');
            if (canvas) {
                canvas.style.width = '';
                canvas.style.height = '';
            }

            // Resize canvas back to normal
            setTimeout(() => {
                this.canvas.resizeCanvas();
            }, 100);
        }

        this.showNotification('Camera closed', 'info');
    },

    /**
     * Handle upload background from camera
     */
    handleCameraUploadBackground() {
        // Trigger background upload
        if (this.elements.bgFileInput) {
            this.elements.bgFileInput.click();
        }
    },

    /**
     * Handle add photocard from camera
     */
    handleCameraAddPhotocard() {
        // Trigger photocard upload
        if (this.elements.photocardFileInput) {
            this.elements.photocardFileInput.click();
        }
    },

    /**
     * Handle camera reset photocard
     */
    handleCameraResetPhotocard() {
        this.canvas.resetPhotocard();
        this.syncPhotocardSliders();
        this.showNotification('Photocard position reset', 'success');
    },

    /**
     * Handle aspect ratio toggle
     */
    handleAspectRatioToggle() {
        // Cycle through aspect ratios: 3:4 -> 9:16 -> 1:1 -> 3:4
        const ratios = ['3:4', '9:16', '1:1'];
        const currentIndex = ratios.indexOf(this.cameraAspectRatio);
        const nextIndex = (currentIndex + 1) % ratios.length;
        this.cameraAspectRatio = ratios[nextIndex];

        // Update button text
        if (this.elements.cameraAspectRatioBtn) {
            this.elements.cameraAspectRatioBtn.textContent = this.cameraAspectRatio;
        }

        // Apply new aspect ratio
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            this.applyAspectRatio(canvasContainer);
            // Resize canvas
            setTimeout(() => {
                this.canvas.resizeCanvas();
            }, 100);
        }

        // Hide aspect ratio notification in camera view
        // this.showNotification(`Aspect ratio: ${this.cameraAspectRatio}`, 'info');
    },

    /**
     * Apply aspect ratio class to container (for camera mode)
     */
    applyAspectRatio(container) {
        // Remove all aspect ratio classes
        container.classList.remove('aspect-3-4', 'aspect-9-16', 'aspect-1-1');

        // Add the current aspect ratio class
        switch (this.cameraAspectRatio) {
            case '3:4':
                container.classList.add('aspect-3-4');
                break;
            case '9:16':
                container.classList.add('aspect-9-16');
                break;
            case '1:1':
                container.classList.add('aspect-1-1');
                break;
        }
    },

    /**
     * Apply aspect ratio class to container (for normal canvas mode)
     */
    applyCanvasAspectRatio(container) {
        // Remove all aspect ratio classes
        container.classList.remove('aspect-3-4', 'aspect-9-16', 'aspect-1-1');

        // Add the canvas aspect ratio class
        switch (this.canvasAspectRatio) {
            case '3:4':
                container.classList.add('aspect-3-4');
                break;
            case '9:16':
                container.classList.add('aspect-9-16');
                break;
            case '1:1':
                container.classList.add('aspect-1-1');
                break;
        }
    },

    /**
     * Show camera flash effect
     */
    showCameraFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            z-index: 9999;
            pointer-events: none;
            animation: cameraFlash 0.3s ease-out;
        `;

        document.body.appendChild(flash);

        setTimeout(() => {
            document.body.removeChild(flash);
        }, 300);
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
     * Handle camera save
     */
    async handleCameraSave() {
        try {
            this.showLoading('Preparing to share...');
            const canvas = this.canvas.canvas;
            const filename = `proofshot-${Date.now()}.png`;

            // Use mobile share API
            const shared = await this.exportImageShare(canvas, filename);

            // Hide action buttons
            if (this.elements.cameraActionButtons) {
                this.elements.cameraActionButtons.classList.remove('active');
            }

            if (shared) {
                this.showNotification('Photo shared successfully!', 'success');
            } else {
                this.showNotification('Photo saved!', 'success');
            }
        } catch (error) {
            console.error('Error saving/sharing photo:', error);
            this.showNotification('Failed to save photo', 'error');
        } finally {
            this.hideLoading();
        }
    },

    /**
     * Handle camera discard
     */
    async handleCameraDiscard() {
        try {
            // Hide action buttons
            if (this.elements.cameraActionButtons) {
                this.elements.cameraActionButtons.classList.remove('active');
            }

            // Show upload background and add photocard buttons again
            if (this.elements.cameraUploadBgBtn) {
                this.elements.cameraUploadBgBtn.style.display = '';
            }
            if (this.elements.cameraAddPhotocardBtn) {
                this.elements.cameraAddPhotocardBtn.style.display = '';
            }

            // Clear the background image but keep the photocard
            this.canvas.backgroundImage = null;

            // Restart camera
            this.showLoading('Restarting camera...');
            await this.canvas.startCamera();

            // Show camera controls again
            if (this.elements.cameraControls) {
                this.elements.cameraControls.classList.add('active');
            }

            // Show aspect ratio button
            if (this.elements.cameraAspectRatioBtn) {
                this.elements.cameraAspectRatioBtn.classList.add('active');
            }

            // Show reset photocard button
            if (this.elements.cameraResetPhotocardBtn) {
                this.elements.cameraResetPhotocardBtn.classList.add('active');
            }

            // Make canvas container fullscreen with aspect ratio
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.add('camera-active');
                this.applyAspectRatio(canvasContainer);
                // Resize canvas to fit fullscreen
                setTimeout(() => {
                    this.canvas.resizeCanvas();
                }, 100);
            }

            this.showNotification('Ready to take another photo', 'info');
        } catch (error) {
            console.error('Error restarting camera:', error);
            this.showNotification('Failed to restart camera', 'error');
        } finally {
            this.hideLoading();
        }
    },

    /**
     * Sync photocard sliders with canvas state
     */
    syncPhotocardSliders() {
        const photocard = this.canvas.photocard;
        const rect = this.canvas.canvas.getBoundingClientRect();

        // Update slider max values based on canvas size
        this.elements.photocardXSlider.max = rect.width;
        this.elements.photocardYSlider.max = rect.height;

        this.elements.photocardXSlider.value = photocard.x;
        this.elements.photocardXValue.textContent = Math.round(photocard.x);

        this.elements.photocardYSlider.value = photocard.y;
        this.elements.photocardYValue.textContent = Math.round(photocard.y);

        this.elements.photocardScaleSlider.value = photocard.scale;
        this.elements.photocardScaleValue.textContent = photocard.scale.toFixed(2);

        const degrees = (photocard.rotation * 180) / Math.PI;
        this.elements.photocardRotationSlider.value = degrees;
        this.elements.photocardRotationValue.textContent = Math.round(degrees) + '°';
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
