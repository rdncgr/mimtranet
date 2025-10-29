// Mimtranet - Main JavaScript File

class MIMTranet {
    constructor() {
        this.currentPage = 'dashboard';
        this.excelFiles = [];
        this.currentExcelData = null;
        this.previousPage = null;
        this.notes = [];
        this.quill = null;
        // Template editor removed - unused
        this.teklifler = [];
        this.sablonlar = [];
        this.parametreler = [];
        this.hazirMetinler = [];
        this.editingSablonIndex = null;
        this.editingParametreIndex = null;
        this.currentSablonForCopy = null;
        // Template functionality removed - unused
        this.editingTeklifId = null;
        this.editingNoteId = null;
        // Template functionality removed - unused
        this.draggedElement = null;
        this.draggedIndex = null;
        this.evrakManager = new EvrakManager();
        window.evrakManager = this.evrakManager;
        this.onboardingCurrentStep = 1;
        this.onboardingTotalSteps = 8;
        this.onboardingUpdating = false;
        this.init();
    }

    openSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        const overlay = document.getElementById('settings-panel-overlay');
        
        if (panel && overlay) {
            panel.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        const overlay = document.getElementById('settings-panel-overlay');
        
        if (panel && overlay) {
            panel.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 🔄 LocalStorage Migration (Leasing ERP çakışmasını önlemek için)
    migrateLocalStorageKeys() {
        console.log('🔄 LocalStorage migration başlatılıyor...');
        
        // Migration yapılacak key'ler
        const keysToMigrate = [
            { old: 'evraklar', new: 'mimtranet_evraklar' },
            { old: 'menuVisibilitySettings', new: 'mimtranet_menuVisibilitySettings' },
            { old: 'darkMode', new: 'mimtranet_darkMode' },
            { old: 'showStats', new: 'mimtranet_showStats' }
        ];
        
        let migratedCount = 0;
        
        keysToMigrate.forEach(({ old: oldKey, new: newKey }) => {
            try {
                const oldValue = localStorage.getItem(oldKey);
                const newValue = localStorage.getItem(newKey);
                
                // Eski key'de veri var ve yeni key'de yoksa veya boşsa
                if (oldValue && !newValue) {
                    localStorage.setItem(newKey, oldValue);
                    migratedCount++;
                    console.log(`✅ Migrated: ${oldKey} -> ${newKey}`);
                    
                    // GÜVENLİ MOD: Eski key'i SİLMİYORUZ (Leasing ERP için güvenlik)
                    // localStorage.removeItem(oldKey); // Bu satırı açarsanız eski key'ler silinir
                }
            } catch (error) {
                console.error(`❌ Migration error for ${oldKey}:`, error);
            }
        });
        
        if (migratedCount > 0) {
            console.log(`✅ Migration tamamlandı: ${migratedCount} key taşındı`);
        } else {
            console.log('ℹ️ Migration gerekmiyor (zaten güncel)');
        }
    }

    // Onboarding Functions
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('mimtranet_hasVisited');
        if (!hasVisited) {
            console.log('First visit detected, starting onboarding');
            this.showOnboarding();
        } else {
            console.log('User has visited before, skipping onboarding');
        }
    }

    showOnboarding() {
        console.log('=== ONBOARDING START ===');
        
        // Onboarding durumunu sıfırla
        this.onboardingCurrentStep = 1;
        this.onboardingUpdating = false;
        
        const overlayElement = document.getElementById('onboardingOverlay');
        if (!overlayElement) {
            console.error('Onboarding overlay not found');
            return;
        }
        
        // Overlay zaten açık mı kontrol et
        if (overlayElement.style.display !== 'none') {
            console.log('Overlay already open');
            return;
        }
        
        try {
            // Event listener'ları temizle ve yeniden ekle
            this.setupOnboardingEventListeners();
            
            // Overlay'i göster
            overlayElement.style.display = 'flex';
            
            // Body'yi kilitle
            document.body.style.overflow = 'hidden';
            
            // İlk adımı göster
            this.updateOnboardingStep();
            
            console.log('Onboarding overlay shown successfully');
        } catch (error) {
            console.error('Onboarding error:', error);
        }
    }

    setupOnboardingEventListeners() {
        console.log('Setting up onboarding event listeners...');
        
        // Mevcut event listener'ları temizle
        const nextBtn = document.getElementById('onboardingNextBtn');
        const prevBtn = document.getElementById('onboardingPrevBtn');
        const skipBtn = document.getElementById('onboardingSkipBtn');
        
        // Eski event listener'ları kaldır
        if (nextBtn) {
            nextBtn.onclick = null;
            nextBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Next clicked');
                this.nextOnboardingStep();
            };
        }
        
        if (prevBtn) {
            prevBtn.onclick = null;
            prevBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Previous clicked');
                this.prevOnboardingStep();
            };
        }
        
        if (skipBtn) {
            skipBtn.onclick = null;
            skipBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Skip clicked');
                this.completeOnboarding();
            };
        }
        
        console.log('Event listeners set up');
    }

    nextOnboardingStep() {
        if (this.onboardingUpdating) return;
        this.onboardingUpdating = true;
        
        console.log(`Next: ${this.onboardingCurrentStep}/${this.onboardingTotalSteps}`);
        
        if (this.onboardingCurrentStep < this.onboardingTotalSteps) {
            this.onboardingCurrentStep++;
            this.updateOnboardingStep();
        } else {
            this.completeOnboarding();
        }
        
        setTimeout(() => {
            this.onboardingUpdating = false;
        }, 200);
    }

    prevOnboardingStep() {
        if (this.onboardingUpdating) return;
        this.onboardingUpdating = true;
        
        console.log(`Previous: ${this.onboardingCurrentStep}`);
        
        if (this.onboardingCurrentStep > 1) {
            this.onboardingCurrentStep--;
            this.updateOnboardingStep();
        }
        
        setTimeout(() => {
            this.onboardingUpdating = false;
        }, 200);
    }

    updateOnboardingStep() {
        console.log(`Update step: ${this.onboardingCurrentStep}`);
        
        // Tüm adımları gizle
        const allSteps = document.querySelectorAll('.onboarding-step');
        allSteps.forEach(step => {
            step.classList.remove('active');
        });

        // Mevcut adımı göster
        const currentStepElement = document.querySelector(`[data-step="${this.onboardingCurrentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Progress bar'ı güncelle
        const progress = (this.onboardingCurrentStep / this.onboardingTotalSteps) * 100;
        const progressBar = document.getElementById('onboardingProgress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        // Adım sayısını güncelle
        const currentStepSpan = document.getElementById('currentStep');
        const stepProgressSpan = document.getElementById('stepProgress');
        if (currentStepSpan) currentStepSpan.textContent = this.onboardingCurrentStep;
        if (stepProgressSpan) stepProgressSpan.textContent = Math.round(progress) + '%';

        // Butonları güncelle
        const prevBtn = document.getElementById('onboardingPrevBtn');
        const nextBtn = document.getElementById('onboardingNextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.onboardingCurrentStep === 1;
        }
        
        if (nextBtn) {
            if (this.onboardingCurrentStep === this.onboardingTotalSteps) {
                nextBtn.innerHTML = 'Başlayalım! <i class="bi bi-check-circle"></i>';
            } else {
                nextBtn.innerHTML = 'Sonraki <i class="bi bi-arrow-right"></i>';
            }
        }
    }

    completeOnboarding() {
        console.log('=== ONBOARDING COMPLETE ===');
        localStorage.setItem('mimtranet_hasVisited', 'true');
        
        // Overlay'i kapat
        const overlayElement = document.getElementById('onboardingOverlay');
        if (overlayElement) {
            overlayElement.style.display = 'none';
        }
        
        // Body'yi serbest bırak
        document.body.style.overflow = '';
        
        // Hoş geldin mesajı
        setTimeout(() => {
            this.showNotification('Mimtranet\'e hoş geldiniz!', 'success');
        }, 500);
    }

    resetOnboarding() {
        localStorage.removeItem('mimtranet_hasVisited');
        this.onboardingCurrentStep = 1;
        this.onboardingUpdating = false;
        this.showOnboarding();
    }

    // Acil durum temizleme fonksiyonu
    emergencyCleanup() {
        console.log('=== EMERGENCY CLEANUP ===');
        
        // Onboarding overlay'i kapat
        const onboardingOverlay = document.getElementById('onboardingOverlay');
        if (onboardingOverlay) {
            onboardingOverlay.style.display = 'none';
        }
        
        // Tüm modal'ları kapat
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        });
        
        // Tüm backdrop'ları kaldır
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Body'yi temizle
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Settings panel'i kapat
        const settingsPanel = document.getElementById('settings-panel');
        const settingsOverlay = document.getElementById('settings-panel-overlay');
        if (settingsPanel) settingsPanel.classList.remove('active');
        if (settingsOverlay) settingsOverlay.classList.remove('active');
        
        console.log('Emergency cleanup completed');
    }

    // Template editor functionality removed - unused functions cleaned up

    setupDragAndDrop(item) {
        item.addEventListener('dragstart', (e) => {
            this.draggedElement = item;
            this.draggedIndex = parseInt(item.dataset.index);
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', item.outerHTML);
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            // Remove drag-over class from all items
            document.querySelectorAll('.excel-file-item').forEach(el => {
                el.classList.remove('drag-over');
            });
            this.draggedElement = null;
            this.draggedIndex = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (this.draggedElement !== item) {
                item.classList.add('drag-over');
            }
        });

        item.addEventListener('dragleave', (e) => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            if (this.draggedElement !== item && this.draggedIndex !== null) {
                const dropIndex = parseInt(item.dataset.index);
                this.reorderExcelFiles(this.draggedIndex, dropIndex);
            }
        });
    }

    reorderExcelFiles(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Move the file in the array
        const movedFile = this.excelFiles.splice(fromIndex, 1)[0];
        this.excelFiles.splice(toIndex, 0, movedFile);
        
        // Save to localStorage
        this.saveExcelFiles();
        
        // Update the display
        this.updateExcelMenu();
        
        // Show notification
        this.showNotification('Excel dosyası sıralaması güncellendi', 'success');
    }

    init() {
        // 🔄 Migration: Eski key'leri yeni key'lere taşı (Güvenli Mod)
        this.migrateLocalStorageKeys();
        
        // Global error handler ekle
        window.addEventListener('error', function(e) {
            console.error('=== GLOBAL ERROR CAUGHT ===');
            console.error('Error:', e.error);
            console.error('Message:', e.message);
            console.error('Filename:', e.filename);
            console.error('Line:', e.lineno);
            console.error('Column:', e.colno);
            console.error('Stack:', e.error ? e.error.stack : 'No stack available');
            console.error('=== END ERROR ===');
            
            // Modal backdrop temizleme
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            console.error('=== UNHANDLED PROMISE REJECTION ===');
            console.error('Reason:', e.reason);
            console.error('=== END REJECTION ===');
            
            // Modal backdrop temizleme
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
        
        console.log('=== MIMTRANET INIT STARTED ===');
        
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.loadExcelFiles();
        this.loadNotes();
        this.loadSablonlar();
        this.loadParametreler();
        this.loadHazirMetinler();
        // Template functionality removed - unused
        // TinyMCE'yi sadece gerekli olduğunda başlat (onboarding ile çakışmasın)
        // this.initQuill();
        this.loadTeklifler();
        this.updatePageActions();
        this.updateDashboardFavorites();
        this.updateDashboardRecentNotes();
        this.updateDashboardFavoriteTemplates();
        this.updateDashboardFavoriteEvraklar();
        this.updateDashboardStats();
        
        // Evrak Ekle butonunun başlangıç durumunu ayarla
        const evrakEkleBtn = document.getElementById('evrakEkleBtn');
        if (evrakEkleBtn) {
            if (this.currentPage === 'dashboard' || this.currentPage === 'evraklar') {
                evrakEkleBtn.style.display = 'inline-block';
            } else {
                evrakEkleBtn.style.display = 'none';
            }
        }
        
        // Araçlar sayfası için input event listener'ları ekle
        this.setupAraclarEventListeners();
        
        // Ayarlar paneli event listener'ları ekle
        this.setupSettingsEventListeners();
        
        // Not modal kapatıldığında TinyMCE'yi temizle
        const noteModalElement = document.getElementById('noteAddModal');
        if (noteModalElement) {
            noteModalElement.addEventListener('hidden.bs.modal', () => {
                this.destroyTinyMCE();
            });
        }
        
        console.log('=== STARTING ONBOARDING CHECK ===');
        
        // Onboarding kontrolü - basitleştirilmiş
        setTimeout(() => {
            this.checkFirstVisit();
        }, 2000);
        
        console.log('=== MIMTRANET INIT COMPLETED ===');
    }

    initQuill() {
        // TinyMCE'yi temizle ve yeniden başlat
        this.destroyTinyMCE();
        
        const editorElement = document.getElementById('noteContentEditor');
        if (!window.tinymce || !editorElement) {
            console.warn('TinyMCE veya editor elementi bulunamadı');
            return;
        }

        // Textarea'yı gizle (yükleme sırasında görünmesin)
        editorElement.style.visibility = 'hidden';
        
        // Loading göstergesini göster
        const loadingElement = document.getElementById('editor-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // TinyMCE için temel stil
        const isDarkMode = document.body.classList.contains('dark-mode');
        const baseStyle = isDarkMode ? 
            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 1.7; padding: 20px; margin: 0; min-height: 300px; position: relative; background-color: #2d3748; color: #ffffff; } body[data-mce-placeholder]:not([dir=rtl])::before { line-height: 1.7; padding: 0; margin: 0; vertical-align: baseline; position: absolute; top: 20px; left: 20px; color: #a0aec0; } body[data-mce-placeholder][dir=rtl]::before { line-height: 1.7; padding: 0; margin: 0; vertical-align: baseline; position: absolute; top: 20px; right: 20px; color: #a0aec0; }' :
            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 1.7; padding: 20px; margin: 0; min-height: 300px; position: relative; } body[data-mce-placeholder]:not([dir=rtl])::before { line-height: 1.7; padding: 0; margin: 0; vertical-align: baseline; position: absolute; top: 20px; left: 20px; } body[data-mce-placeholder][dir=rtl]::before { line-height: 1.7; padding: 0; margin: 0; vertical-align: baseline; position: absolute; top: 20px; right: 20px; }';
        
        tinymce.init({
            selector: '#noteContentEditor',
            license_key: 'gpl',
            language: 'tr',
            height: 350,
            menubar: false,
            branding: false,
            toolbar_mode: 'wrap',
            toolbar_sticky: true,
            skin: isDarkMode ? 'oxide-dark' : 'oxide',
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: baseStyle,
            placeholder: 'Not içeriğini buraya yazın...',
            setup: (editor) => {
                this.quill = editor;
                
                // Editör yüklendiğinde textarea'yı göster
                editor.on('init', () => {
                    console.log('TinyMCE başlatıldı');
                    // Editör hazır olduğunda textarea'yı tekrar göster
                    editorElement.style.visibility = 'visible';
                    
                    // Loading göstergesini gizle
                    const loadingElement = document.getElementById('editor-loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                });

                // Editör yükleme hatası durumunda
                editor.on('LoadError', (e) => {
                    console.error('TinyMCE yükleme hatası:', e);
                    // Hata durumunda textarea'yı göster
                    editorElement.style.visibility = 'visible';
                    
                    // Loading göstergesini gizle
                    const loadingElement = document.getElementById('editor-loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                });
            },
            images_upload_handler: (blobInfo, progress) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blobInfo.blob());
                });
            }
        });    
    }

    destroyTinyMCE() {
        if (this.quill) {
            try {
                this.quill.remove();
                this.quill = null;
                console.log('TinyMCE temizlendi');
            } catch (error) {
                console.log('TinyMCE temizleme hatası:', error);
                this.quill = null;
            }
        }
        
        // TinyMCE instance'larını tamamen temizle
        if (window.tinymce) {
            const editor = tinymce.get('noteContentEditor');
            if (editor) {
                editor.remove();
            }
        }
        
        // Textarea'yı tekrar görünür yap
        const editorElement = document.getElementById('noteContentEditor');
        if (editorElement) {
            editorElement.style.visibility = 'visible';
        }
        
        // Loading göstergesini gizle
        const loadingElement = document.getElementById('editor-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Settings Functions
    setupSettingsEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeTogglePanel');
        if (darkModeToggle) {
            // Set initial state
            darkModeToggle.checked = localStorage.getItem('mimtranet_darkMode') === 'true';
            
            darkModeToggle.addEventListener('change', () => {
                this.toggleDarkMode(darkModeToggle.checked);
            });
        }

        // Stats section toggle
        const statsToggle = document.getElementById('statsTogglePanel');
        if (statsToggle) {
            // Set initial state
            statsToggle.checked = localStorage.getItem('mimtranet_showStats') !== 'false';
            
            statsToggle.addEventListener('change', () => {
                this.toggleStatsSection(statsToggle.checked);
            });
        }

        // Import/Export buttons
        this.setupImportExportButtons();
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('mimtranet_darkMode', enabled);
    }

    toggleStatsSection(enabled) {
        const statsFooter = document.getElementById('stats-footer');
        if (statsFooter) {
            statsFooter.style.display = enabled ? 'block' : 'none';
        }
        localStorage.setItem('mimtranet_showStats', enabled);
    }

    setupImportExportButtons() {
        // All Data Export/Import
        const exportAllBtn = document.getElementById('exportAllDataBtn');
        const importAllBtn = document.getElementById('importAllDataBtn');
        const importAllFile = document.getElementById('importAllDataFile');

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllSettings());
        }
        if (importAllBtn) {
            importAllBtn.addEventListener('click', () => importAllFile.click());
        }
        if (importAllFile) {
            importAllFile.addEventListener('change', (e) => this.importAllSettings(e));
        }

        // Notes Export/Import
        const exportNotesBtn = document.getElementById('exportNotesBtn');
        const importNotesBtn = document.getElementById('importNotesBtn');
        const importNotesFile = document.getElementById('importNotesInput');

        if (exportNotesBtn) {
            exportNotesBtn.addEventListener('click', () => this.exportNotes());
        }
        if (importNotesBtn) {
            importNotesBtn.addEventListener('click', () => importNotesFile.click());
        }
        if (importNotesFile) {
            importNotesFile.addEventListener('change', (e) => this.importNotes(e.target.files[0]));
        }

        // Documents Export/Import
        const exportEvraklarBtn = document.getElementById('exportEvraklarBtn');
        const importEvraklarBtn = document.getElementById('importEvraklarBtn');
        const importEvraklarFile = document.getElementById('importEvraklarInput');

        if (exportEvraklarBtn) {
            exportEvraklarBtn.addEventListener('click', () => this.exportEvraklar());
        }
        if (importEvraklarBtn) {
            importEvraklarBtn.addEventListener('click', () => importEvraklarFile.click());
        }
        if (importEvraklarFile) {
            importEvraklarFile.addEventListener('change', (e) => this.importEvraklar(e.target.files[0]));
        }

        // Templates Export/Import
        const exportSablonlarBtn = document.getElementById('exportSablonlarBtn');
        const importSablonlarBtn = document.getElementById('importSablonlarBtn');
        const importSablonlarFile = document.getElementById('importSablonlarInput');

        if (exportSablonlarBtn) {
            exportSablonlarBtn.addEventListener('click', () => this.exportSablonlar());
        }
        if (importSablonlarBtn) {
            importSablonlarBtn.addEventListener('click', () => importSablonlarFile.click());
        }
        if (importSablonlarFile) {
            importSablonlarFile.addEventListener('change', (e) => this.importSablonlar(e.target.files[0]));
        }

        // Parameters Export/Import
        const exportParametrelerBtn = document.getElementById('exportParametrelerBtn');
        const importParametrelerBtn = document.getElementById('importParametrelerBtn');
        const importParametrelerFile = document.getElementById('importParametrelerInput');

        if (exportParametrelerBtn) {
            exportParametrelerBtn.addEventListener('click', () => this.exportParametreler());
        }
        if (importParametrelerBtn) {
            importParametrelerBtn.addEventListener('click', () => importParametrelerFile.click());
        }
        if (importParametrelerFile) {
            importParametrelerFile.addEventListener('change', (e) => this.importParametreler(e.target.files[0]));
        }
    }

    exportEvraklar() {
        if (!evrakManager) {
            this.showNotification('Evrak yöneticisi bulunamadı!', 'error');
            return;
        }

        const evraklar = evrakManager.loadEvraklar();
        if (!evraklar || evraklar.length === 0) {
            this.showNotification('Dışa aktarılacak evrak bulunamadı!', 'warning');
            return;
        }

        // Export verisi hazırla
        const exportData = {
            evraklar: evraklar,
            exportDate: new Date().toISOString(),
            version: '2.0',
            totalEvraklar: evraklar.length,
            metadata: {
                exportedBy: 'Mimtranet',
                exportType: 'evraklar'
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mimtranet_evraklar_${new Date().toISOString().split('T')[0]}.json`;
        
        // Link'i DOM'a ekle, tıkla ve temizle
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification(`${evraklar.length} evrak başarıyla dışa aktarıldı!`, 'success');
    }

    importEvraklar(file) {
        if (!file) {
            const input = document.getElementById('importEvraklarInput');
            if (input) {
                input.click();
            }
            return;
        }

        // Dosya türü kontrolü
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showNotification('Lütfen sadece JSON dosyası seçin!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                let evraklar = [];
                
                // Yeni format (v2.0) kontrolü
                if (importedData.version === '2.0' && importedData.evraklar && Array.isArray(importedData.evraklar)) {
                    evraklar = importedData.evraklar;
                }
                // Eski format (direkt dizi) kontrolü
                else if (Array.isArray(importedData)) {
                    evraklar = importedData;
                }
                else {
                    this.showNotification('Geçersiz evrak dosyası formatı! Dosya bir evrak dizisi içermeli.', 'error');
                    return;
                }

                // EvrakManager kontrolü
                if (!evrakManager) {
                    this.showNotification('Evrak yöneticisi bulunamadı!', 'error');
                    return;
                }

                // Mevcut evrakları al
                const existingEvraklar = evrakManager.loadEvraklar();
                const existingEvrakNames = new Set(existingEvraklar.map(e => e.ad?.toLowerCase().trim()));

                // Yeni evrakları filtrele (sadece benzersiz olanlar)
                const newEvraklar = evraklar.filter(evrak => {
                    // Temel alan kontrolleri
                    if (!evrak.ad || !evrak.ad.trim()) {
                        console.warn('Adı olmayan evrak atlandı:', evrak);
                        return false;
                    }

                    // Çakışma kontrolü
                    const evrakName = evrak.ad.toLowerCase().trim();
                    if (existingEvrakNames.has(evrakName)) {
                        console.warn('Çakışan evrak atlandı:', evrak.ad);
                        return false;
                    }

                    return true;
                });

                if (newEvraklar.length === 0) {
                    this.showNotification('İçe aktarılacak yeni evrak bulunamadı! (Tüm evraklar zaten mevcut)', 'warning');
                    return;
                }

                // Yeni evrakları mevcut listeye ekle
                existingEvraklar.push(...newEvraklar);
                evrakManager.evraklar = existingEvraklar;
                evrakManager.saveEvraklar();
                evrakManager.renderList();

                // Dashboard'ı güncelle
                this.updateDashboardFavoriteEvraklar();
                this.updateDashboardStats();

                this.showNotification(`${newEvraklar.length} evrak başarıyla içe aktarıldı!`, 'success');

            } catch (error) {
                console.error('Evrak içe aktarma hatası:', error);
                this.showNotification('Dosya okuma hatası: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Dosya okunamadı!', 'error');
        };
        
        reader.readAsText(file);
    }

    exportSablonlar() {
        if (!this.sablonlar || this.sablonlar.length === 0) {
            this.showNotification('Dışa aktarılacak şablon bulunamadı!', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.sablonlar, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sablonlar_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Şablonlar başarıyla dışa aktarıldı!', 'success');
    }

    importSablonlar(file) {
        if (!file) {
            const input = document.getElementById('importSablonlarInput');
            if (input) {
                input.click();
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const sablonlar = JSON.parse(e.target.result);
                if (Array.isArray(sablonlar)) {
                    this.sablonlar = sablonlar;
                    this.saveSablonlar();
                    this.updateSablonlarDisplay();
                    this.showNotification('Şablonlar başarıyla içe aktarıldı!', 'success');
                } else {
                    this.showNotification('Geçersiz şablon dosyası formatı!', 'error');
                }
            } catch (error) {
                this.showNotification('Dosya okuma hatası: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    exportParametreler() {
        if (!this.parametreler || this.parametreler.length === 0) {
            this.showNotification('Dışa aktarılacak parametre bulunamadı!', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.parametreler, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `parametreler_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Parametreler başarıyla dışa aktarıldı!', 'success');
    }

    importParametreler(file) {
        if (!file) {
            const input = document.getElementById('importParametrelerInput');
            if (input) {
                input.click();
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parametreler = JSON.parse(e.target.result);
                if (Array.isArray(parametreler)) {
                    this.parametreler = parametreler;
                    this.saveParametreler();
                    this.updateParametreList();
                    this.updateParametreButtons();
                    this.showNotification('Parametreler başarıyla içe aktarıldı!', 'success');
                } else {
                    this.showNotification('Geçersiz parametre dosyası formatı!', 'error');
                }
            } catch (error) {
                this.showNotification('Dosya okuma hatası: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    exportHazirMetinler() {
        if (!this.hazirMetinler || this.hazirMetinler.length === 0) {
            this.showNotification('Dışa aktarılacak hazır metin bulunamadı!', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.hazirMetinler, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hazir_metinler_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Hazır metinler başarıyla dışa aktarıldı!', 'success');
    }

    importHazirMetinler(file) {
        if (!file) {
            const input = document.getElementById('importHazirMetinlerInput');
            if (input) {
                input.click();
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const hazirMetinler = JSON.parse(e.target.result);
                if (Array.isArray(hazirMetinler)) {
                    this.hazirMetinler = hazirMetinler;
                    this.saveHazirMetinler();
                    this.updateHazirMetinlerDisplay();
                    this.updateHazirMetinlerDropdowns();
                    this.showNotification('Hazır metinler başarıyla içe aktarıldı!', 'success');
                } else {
                    this.showNotification('Geçersiz hazır metin dosyası formatı!', 'error');
                }
            } catch (error) {
                this.showNotification('Dosya okuma hatası: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');

        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                content.classList.toggle('expanded');
                
                // Footer margin ayarlaması
                const footer = document.getElementById('stats-footer');
                if (footer) {
                    if (sidebar.classList.contains('collapsed')) {
                        footer.style.marginLeft = '70px';
                    } else {
                        footer.style.marginLeft = '250px';
                    }
                }
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.sidebar .components li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Category toggle
        const categoryLinks = document.querySelectorAll('[data-toggle="collapse"]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                const isExpanded = link.getAttribute('aria-expanded') === 'true';
                
                // Toggle collapse
                const collapseElement = document.querySelector(target);
                if (collapseElement) {
                    if (isExpanded) {
                        collapseElement.classList.remove('show');
                        link.setAttribute('aria-expanded', 'false');
                    } else {
                        collapseElement.classList.add('show');
                        link.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        });

        // Mobile sidebar toggle
        if (window.innerWidth <= 768) {
            if (sidebarCollapse) {
                sidebarCollapse.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                    content.classList.toggle('active');
                });
            }
        }

        // Şablon modal event listeners
        const sablonAddBtn = document.getElementById('sablonAddBtn');
        if (sablonAddBtn) {
            sablonAddBtn.addEventListener('click', () => {
                this.showSablonAddModal();
            });
        }

        // Şablon form submit listeners
        const sablonAddForm = document.getElementById('sablonAddModal');
        if (sablonAddForm) {
            const saveBtn = sablonAddForm.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.removeAttribute('onclick');
                saveBtn.addEventListener('click', () => {
                    this.addSablon();
                });
            }
        }

        const sablonEditForm = document.getElementById('sablonEditModal');
        if (sablonEditForm) {
            const updateBtn = sablonEditForm.querySelector('.btn-primary');
            if (updateBtn) {
                updateBtn.removeAttribute('onclick');
                updateBtn.addEventListener('click', () => {
                    this.updateSablon();
                });
            }
        }

        const sablonCopyForm = document.getElementById('sablonCopyModal');
        if (sablonCopyForm) {
            const copyBtn = sablonCopyForm.querySelector('.btn-success');
            if (copyBtn) {
                copyBtn.removeAttribute('onclick');
                copyBtn.addEventListener('click', () => {
                    this.copySablonToClipboard();
                });
            }
        }

        // Şablon arama input listener
        const sablonArama = document.getElementById('sablonArama');
        if (sablonArama) {
            sablonArama.addEventListener('input', () => {
                this.filterSablonlar();
            });
        }

        // Settings panel event listeners
        const settingsOverlay = document.getElementById('settings-panel-overlay');
        const settingsCloseBtn = document.getElementById('settings-panel-close');
        
        if (settingsOverlay) {
            settingsOverlay.addEventListener('click', () => {
                this.closeSettingsPanel();
            });
        }
        
        if (settingsCloseBtn) {
            settingsCloseBtn.addEventListener('click', () => {
                this.closeSettingsPanel();
            });
        }
        
        // Close settings panel with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const panel = document.getElementById('settings-panel');
                if (panel && panel.classList.contains('active')) {
                    this.closeSettingsPanel();
                }
            }
        });
    }

    navigateToPage(page) {
        // Special handling for settings page - open side panel instead
        if (page === 'settings') {
            this.openSettingsPanel();
            return;
        }

        // Store previous page for back navigation
        if (this.currentPage !== page) {
            this.previousPage = this.currentPage;
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.sidebar .components li');
        navLinks.forEach(li => li.classList.remove('active'));

        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }

        this.currentPage = page;
        this.updatePageActions();
        this.saveToLocalStorage();

        // Update Excel files display when navigating to excel-files page
        if (page === 'excel-files') {
            this.updateExcelFilesDisplay();
        }

        // Update navbar title
        this.updateNavbarTitle();

        // Setup notes search when navigating to notes page
        if (page === 'notes') {
            this.updateNotesDisplay();
            this.setupNotesSearch();
        }

        // Setup sablonlar when navigating to sablonlar page
        if (page === 'sablonlar') {
            this.updateSablonlarDisplay();
            this.setupSablonlarSearch();
            this.loadParametreler();
            this.updateParametreButtons();
            // Parametreler menüsünü göster
            const parametrelerDropdown = document.getElementById('parametrelerDropdown');
            if (parametrelerDropdown) {
                parametrelerDropdown.style.display = 'block';
            }
            // Hazır Metinler butonunu göster
            const hazirMetinlerBtn = document.getElementById('hazirMetinlerBtn');
            if (hazirMetinlerBtn) {
                hazirMetinlerBtn.style.display = 'block';
            }
        } else {
            // Diğer sayfalarda Parametreler menüsünü gizle
            const parametrelerDropdown = document.getElementById('parametrelerDropdown');
            if (parametrelerDropdown) {
                parametrelerDropdown.style.display = 'none';
            }
            // Diğer sayfalarda Hazır Metinler butonunu gizle
            const hazirMetinlerBtn = document.getElementById('hazirMetinlerBtn');
            if (hazirMetinlerBtn) {
                hazirMetinlerBtn.style.display = 'none';
            }
        }

        // Setup teklifler search and sorting when navigating to teklifler page
        if (page === 'teklifler') {
            this.updateTekliflerTable();
            this.setupTekliflerSearch();
        }

        // Update dashboard favorites when navigating to dashboard
        if (page === 'dashboard') {
            this.updateDashboardFavorites();
            this.updateDashboardRecentNotes();
            this.updateDashboardFavoriteTemplates();
            this.updateDashboardFavoriteEvraklar();
            this.updateDashboardStats();
        }

        // Evrak Ekle butonunun görünürlüğünü kontrol et
        const evrakEkleBtn = document.getElementById('evrakEkleBtn');
        if (evrakEkleBtn) {
            if (page === 'dashboard' || page === 'evraklar') {
                evrakEkleBtn.style.display = 'inline-block';
            } else {
                evrakEkleBtn.style.display = 'none';
            }
        }
        
        // Araçlar sayfası için özel işlemler
        if (page === 'araclar') {
            this.clearAraclarForm();
        }
    }

    updateNavbarTitle() {
        const navbarTitle = document.getElementById('navbar-page-title');
        if (!navbarTitle) return;

        switch (this.currentPage) {
            case 'dashboard':
                navbarTitle.textContent = 'Dashboard';
                break;
            case 'teklifler':
                navbarTitle.textContent = 'Teklifler';
                break;
            case 'notes':
                navbarTitle.textContent = 'Notlarım';
                break;
            case 'evraklar':
                navbarTitle.textContent = 'Evraklar';
                break;
            case 'araclar':
                navbarTitle.textContent = 'Araçlar';
                break;
            case 'sablonlar':
                navbarTitle.textContent = 'Şablonlar';
                break;
            case 'excel-file-view':
                if (this.currentExcelData) {
                    navbarTitle.textContent = this.currentExcelData.title;
                } else {
                    navbarTitle.textContent = 'Excel Dosyası';
                }
                break;
            default:
                navbarTitle.textContent = 'Dashboard';
                break;
        }
    }

    goBack() {
        if (this.previousPage) {
            this.navigateToPage(this.previousPage);
        } else {
            this.navigateToPage('dashboard');
        }
    }

    updatePageActions() {
        const pageActions = document.getElementById('page-actions');
        if (!pageActions) return;

        // Clear existing actions
        pageActions.innerHTML = '';

        // Add page-specific actions
        switch (this.currentPage) {
            case 'dashboard':
                const addNoteButton = document.createElement('button');
                addNoteButton.className = 'btn btn-success';
                addNoteButton.innerHTML = '<i class="bi bi-journal-plus"></i> Yeni Not Ekle';
                addNoteButton.onclick = () => this.showNoteAddModal();
                pageActions.appendChild(addNoteButton);

                const addButton = document.createElement('button');
                addButton.className = 'btn btn-success ms-2';
                addButton.innerHTML = '<i class="bi bi-file-earmark-excel"></i> Excel Dosyası Ekle';
                addButton.onclick = () => this.showExcelUploadModal();
                pageActions.appendChild(addButton);

                // Show template add button on dashboard
                const sablonAddBtnDashboard = document.getElementById('sablonAddBtn');
                if (sablonAddBtnDashboard) {
                    sablonAddBtnDashboard.style.display = 'inline-block';
                }
                break;
            case 'teklifler':
                const addTeklifButton = document.createElement('button');
                addTeklifButton.className = 'btn btn-primary';
                addTeklifButton.innerHTML = '<i class="bi bi-plus-circle"></i> Yeni Teklif Ekle';
                addTeklifButton.onclick = () => this.showTekliflerModal();
                pageActions.appendChild(addTeklifButton);
                
                // Hide template add button on teklifler page
                const sablonAddBtnTeklifler = document.getElementById('sablonAddBtn');
                if (sablonAddBtnTeklifler) {
                    sablonAddBtnTeklifler.style.display = 'none';
                }
                break;
            case 'notes':
                const addNoteButton2 = document.createElement('button');
                addNoteButton2.className = 'btn btn-primary';
                addNoteButton2.innerHTML = '<i class="bi bi-journal-plus"></i> Yeni Not Ekle';
                addNoteButton2.onclick = () => this.showNoteAddModal();
                pageActions.appendChild(addNoteButton2);

                // Hide template add button on notes page
                const sablonAddBtnNotes = document.getElementById('sablonAddBtn');
                if (sablonAddBtnNotes) {
                    sablonAddBtnNotes.style.display = 'none';
                }
                break;
            case 'templates':
                // Template functionality removed - unused
                break;
            case 'settings':
                // Hide template add button on settings page
                if (sablonAddBtnSettings) {
                    sablonAddBtnSettings.style.display = 'none';
                }
                break;
            case 'excel-file-view':
                const filterButton = document.createElement('button');
                filterButton.className = 'btn btn-outline-primary';
                filterButton.innerHTML = '<i class="bi bi-funnel"></i> Filtrele';
                filterButton.onclick = () => this.toggleFilters();
                pageActions.appendChild(filterButton);

                // Sil butonu
                if (this.currentExcelData) {
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'btn btn-outline-danger';
                    deleteButton.innerHTML = '<i class="bi bi-trash"></i> Sil';
                    deleteButton.onclick = () => {
                        if (confirm('Bu Excel dosyasını silmek istediğinize emin misiniz?')) {
                            this.deleteExcelFile(this.currentExcelData.id);
                        }
                    };
                    pageActions.appendChild(deleteButton);
                }
                
                // Excel dosyaları sayfasında Şablon Ekle butonunu gizle
                const sablonAddBtnExcel = document.getElementById('sablonAddBtn');
                if (sablonAddBtnExcel) {
                    sablonAddBtnExcel.style.display = 'none';
                }
                break;
            case 'sablonlar':
                // Show template add button only on templates page
                const sablonAddBtn = document.getElementById('sablonAddBtn');
                if (sablonAddBtn) {
                    sablonAddBtn.style.display = 'block';
                }
                break;
            case 'settings':
                // Hide template add button on settings page
                const sablonAddBtnSettings = document.getElementById('sablonAddBtn');
                if (sablonAddBtnSettings) {
                    sablonAddBtnSettings.style.display = 'none';
                }
                this.setupSettingsEventListeners();
                break;
            default:
                // Default actions for other pages
                // Hide template add button on other pages
                const sablonAddBtnDefault = document.getElementById('sablonAddBtn');
                if (sablonAddBtnDefault) {
                    sablonAddBtnDefault.style.display = 'none';
                }
                break;
        }
    }

    // Excel Functions
    showExcelUploadModal() {
        const modal = new bootstrap.Modal(document.getElementById('excelUploadModal'));
        modal.show();
    }

    uploadExcel() {
        const title = document.getElementById('excelTitle').value.trim();
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];

        if (!title || !file) {
            this.showNotification('Lütfen başlık ve dosya seçin', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const excelFile = {
                    id: Date.now().toString(),
                    title: title,
                    fileName: file.name,
                    uploadDate: new Date().toISOString(),
                    data: jsonData
                };

                this.excelFiles.push(excelFile);
                this.saveExcelFiles();
                this.updateExcelFilesDisplay();
                
                this.showNotification('Excel dosyası başarıyla yüklendi', 'success');

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('excelUploadModal'));
                modal.hide();

                // Clear form
                document.getElementById('excelUploadForm').reset();
            } catch (error) {
                this.showNotification('Excel dosyası okunamadı', 'error');
                console.error('Excel read error:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Fiziksel dosya kaydetme özelliği kaldırıldı

    loadExcelFiles() {
        // Load from localStorage
        const files = this.loadData('excel_files');
        if (files) {
            this.excelFiles = files;
        }

        // Update display
        this.updateExcelFilesDisplay();
    }

    updateExcelFilesDisplay() {
        this.updateExcelMenu();
    }

    updateExcelMenu() {
        const excelFilesList = document.getElementById('excel-files-list');
        if (!excelFilesList) return;

        // Clear existing menu items
        excelFilesList.innerHTML = '';

        if (this.excelFiles.length === 0) {
            excelFilesList.innerHTML = `
                <div class="text-muted px-4 py-2" style="font-size:0.9rem;">Henüz dosya yok</div>
            `;
            return;
        }

        // Add each Excel file as menu item
        this.excelFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'excel-file-item' + (this.currentExcelData && this.currentExcelData.id === file.id ? ' active' : '');
            item.draggable = true;
            item.dataset.fileId = file.id;
            item.dataset.index = index;
            item.innerHTML = `
                <div class="excel-file-info">
                    <i class="bi bi-grip-vertical drag-handle"></i>
                    <span class="excel-file-icon"><i class="bi bi-file-earmark-text"></i></span>
                    <span class="excel-file-name">${file.title}</span>
                </div>
            `;
            
            // Drag and drop event listeners
            this.setupDragAndDrop(item);
            
            // Drag handle'ın tıklanmasını engelle
            item.querySelector('.drag-handle').addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Tüm div alanını tıklanabilir hale getir (drag handle hariç)
            item.addEventListener('click', (e) => {
                // Drag handle tıklandıysa işlem yapma
                if (e.target.closest('.drag-handle')) {
                    return;
                }
                e.preventDefault();
                this.viewExcelFile(file.id);
            });
            excelFilesList.appendChild(item);
        });
    }

    viewExcelFile(fileId) {
        const file = this.excelFiles.find(f => f.id === fileId);
        if (!file) return;

        this.currentExcelData = file;
        this.navigateToPage('excel-file-view');
        this.updatePageActions();
        this.renderExcelTable(file.data);

        // Update active menu item
        this.updateActiveExcelMenuItem(fileId);
    }

    updateActiveExcelMenuItem(fileId) {
        // Remove active class from all Excel menu items
        const excelMenuItems = document.querySelectorAll('#excel-files-list .excel-file-item');
        excelMenuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current item
        const activeItem = document.querySelector(`[data-id="${fileId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    renderExcelTable(data) {
        const container = document.getElementById('excel-table-container');
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Veri bulunamadı</p></div>';
            return;
        }

        const headers = data[0];
        const rows = data.slice(1);

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover" id="excel-table">
                    <thead class="table-dark">
                        <tr>
        `;

        headers.forEach((header, index) => {
            html += `<th data-sort="col-${index}">
                        <div style="display: flex; flex-direction: column; align-items: stretch;">
                            <span style="display: flex; align-items: center; justify-content: space-between;">
                                <span>${header || `Sütun ${index + 1}`}</span>
                                <i class="bi bi-arrow-down-up sort-icon" data-sort-index="${index}"></i>
                            </span>
                            <input type="text" class="form-control form-control-sm filter-input" placeholder="Filtrele..." data-column="${index}" style="margin-top: 4px;">
                        </div>
                    </th>`;
        });

        html += '</tr></thead><tbody>';

        rows.forEach(row => {
            html += '<tr>';
            headers.forEach((header, index) => {
                const cellValue = row[index] || '';
                html += `<td>${cellValue}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';

        container.innerHTML = html;

        // Store Excel data for filtering and sorting
        this.currentExcelRows = rows;
        this.currentExcelHeaders = headers;

        // Setup Excel table functionality
        this.setupExcelTableFeatures();
    }

    toggleFilters() {
        const filterInputs = document.querySelectorAll('.filter-input');
        const isVisible = filterInputs[0]?.style.display !== 'none';
        
        filterInputs.forEach(input => {
            input.style.display = isVisible ? 'none' : 'block';
        });
    }

    saveExcelFiles() {
        this.saveData('excel_files', this.excelFiles);
        this.updateDashboardStats();
    }

    // Local Storage Management
    saveToLocalStorage() {
        const data = {
            currentPage: this.currentPage,
            sidebarCollapsed: document.getElementById('sidebar').classList.contains('collapsed')
        };
        localStorage.setItem('mimtranet_data', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('mimtranet_data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.currentPage) {
                    this.navigateToPage(parsed.currentPage);
                }
                if (parsed.sidebarCollapsed) {
                    document.getElementById('sidebar').classList.add('collapsed');
                    document.getElementById('content').classList.add('expanded');
                }
            } catch (e) {
                console.error('Error loading from localStorage:', e);
            }
        }
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        // Convert 'error' type to 'danger' for Bootstrap compatibility
        const alertType = type === 'error' ? 'danger' : type;
        notification.className = `alert alert-${alertType} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'bottom: 40px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Data Management Methods
    saveData(key, data) {
        try {
            localStorage.setItem(`mimtranet_${key}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(`mimtranet_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }

    clearData(key) {
        localStorage.removeItem(`mimtranet_${key}`);
    }

    deleteExcelFile(fileId) {
        const fileToDelete = this.excelFiles.find(f => f.id === fileId);
        
        this.excelFiles = this.excelFiles.filter(f => f.id !== fileId);
        this.saveExcelFiles();
        this.updateExcelMenu();
        
        // Eğer silinen dosya görüntüleniyorsa, dashboard'a dön
        if (this.currentExcelData && this.currentExcelData.id === fileId) {
            this.currentExcelData = null;
            this.navigateToPage('dashboard');
        }
        
        this.showNotification('Excel dosyası silindi', 'success');
    }

    loadNotes() {
        const notes = this.loadData('notes');
        if (notes) {
            // Ensure all notes have createdAt field
            this.notes = notes.map(note => {
                if (!note.createdAt) {
                    // If createdAt is missing, use id (timestamp) or createdDate as fallback
                    note.createdAt = note.createdDate || new Date(parseInt(note.id)).toISOString();
                }
                return note;
            });
        }
        this.updateNotesDisplay();
        this.updateDashboardFavorites();
        this.updateDashboardRecentNotes();
        this.updateDashboardStats();
    }

    // Template functionality removed - unused

    updateNotesDisplay(notesToDisplay = null) {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        let displayNotes = notesToDisplay || this.notes;
        // En yeni en üstte olacak şekilde sırala
        displayNotes = [...displayNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (displayNotes.length === 0) {
            notesList.innerHTML = '<tr><td colspan="4" class="text-center py-4">Henüz not yok</td></tr>';
            return;
        }

        let html = '';
        displayNotes.forEach(note => {
            const plainContent = this.stripHtml(note.content);
            const truncatedContent = plainContent.length > 100 ? plainContent.substring(0, 100) + '...' : plainContent;
            const truncatedTitle = note.title.length > 30 ? note.title.substring(0, 30) + '...' : note.title;
            const date = new Date(note.createdAt).toLocaleDateString('tr-TR');
            
            html += `
                <tr style="cursor: pointer;" onclick="mimtranet.showNotePreview('${note.id}')">
                    <td class="note-title-cell" style="width: 25%;" title="${note.title}">${truncatedTitle}</td>
                    <td class="note-content-cell" style="width: 45%;" title="${plainContent}">${truncatedContent}</td>
                    <td style="width: 20%;">
                        <span class="note-date-small">${date}</span>
                    </td>
                    <td style="width: 10%;">
                        <div class="btn-group" role="group" onclick="event.stopPropagation();">
                            <button class="btn btn-outline-${note.favorite ? 'warning' : 'secondary'} btn-sm" 
                                    onclick="mimtranet.toggleFavorite('${note.id}')" 
                                    title="${note.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                                <i class="bi bi-star${note.favorite ? '-fill' : ''}"></i>
                            </button>
                            <button class="btn btn-outline-info btn-sm" 
                                    onclick="mimtranet.exportSingleNote('${note.id}')" 
                                    title="Bu Notu Dışa Aktar">
                                <i class="bi bi-download"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm" 
                                    onclick="mimtranet.editNote('${note.id}')" 
                                    title="Düzenle">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="mimtranet.deleteNote('${note.id}')" 
                                    title="Sil">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        notesList.innerHTML = html;
    }

    toggleFavorite(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.favorite = !note.favorite;
            this.saveNotes();
            this.updateNotesDisplay();
            this.updateDashboardFavorites();
            this.updateDashboardRecentNotes();
            this.updateDashboardStats();
            this.showNotification(
                note.favorite ? 'Not favorilere eklendi' : 'Not favorilerden çıkarıldı', 
                'success'
            );
            
            // Close modal if it's open
            const modal = bootstrap.Modal.getInstance(document.getElementById('notePreviewModal'));
            if (modal) {
                modal.hide();
            }
        }
    }

    showNoteAddModal() {
        this.clearNoteForm();
        
        const modalElement = document.getElementById('noteAddModal');
        const modal = new bootstrap.Modal(modalElement);
        
        // Modal tamamen açıldıktan SONRA TinyMCE'yi başlat
        modalElement.addEventListener('shown.bs.modal', () => {
            // TinyMCE'yi sadece modal açıldığında başlat
            this.initQuill();
        }, { once: true }); // once: true -> sadece bir kez çalışır
        
        modal.show();
    }

    // Template functionality removed - unused

    addNote() {
        const title = document.getElementById('noteTitle').value.trim();
        let content = '';
        
        if (this.quill) {
            content = this.quill.getContent();
        } else {
            const noteContentElement = document.getElementById('noteContentEditor');
            if (noteContentElement) {
                content = noteContentElement.value.trim();
            }
        }
        
        this._saveNoteWithContent(title, content);
    }

    _saveNoteWithContent(title, content) {
        if (!title.trim()) {
            this.showNotification('Lütfen not başlığını girin', 'error');
            return;
        }
        
        if (this.editingNoteId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(n => n.id === this.editingNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex].title = title;
                this.notes[noteIndex].content = content;
                this.notes[noteIndex].updatedAt = new Date().toISOString();
                this.editingNoteId = null;
                this.showNotification('Not başarıyla güncellendi', 'success');
            }
        } else {
            // Add new note
            const note = {
                id: Date.now().toString(),
                title: title,
                content: content,
                createdAt: new Date().toISOString(),
                favorite: false
            };
            this.notes.push(note);
            this.showNotification('Not başarıyla eklendi', 'success');
        }
        this.saveNotes();
        this.updateNotesDisplay();
        this.updateDashboardFavorites();
        this.updateDashboardRecentNotes();
        this.updateDashboardStats();
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('noteAddModal'));
        if (modal) {
            modal.hide();
        }
        // Clear form
        this.clearNoteForm();
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.editingNoteId = noteId;
        document.getElementById('noteTitle').value = note.title;
        
        // Update modal title
        document.getElementById('noteModalTitle').textContent = 'Not Düzenle';
        
        const modalElement = document.getElementById('noteAddModal');
        const modal = new bootstrap.Modal(modalElement);
        
        // Modal tamamen açıldıktan SONRA TinyMCE'yi başlat ve içeriği yükle
        modalElement.addEventListener('shown.bs.modal', () => {
            // TinyMCE'yi başlat
            this.initQuill();
            
            // TinyMCE yüklendikten sonra içeriği set et
            setTimeout(() => {
                if (this.quill) {
                    this.quill.setContent(note.content);
                } else {
                    const noteContentElement = document.getElementById('noteContentEditor');
                    if (noteContentElement) {
                        noteContentElement.value = note.content;
                    }
                }
            }, 300); // 500ms'den 300ms'ye düşürdük
        }, { once: true }); // once: true -> sadece bir kez çalışır
        
        modal.show();
    }

    clearNoteForm() {
        document.getElementById('noteTitle').value = '';
        
        // TinyMCE'yi temizle
        this.destroyTinyMCE();
        
        // Textarea'yı da temizle
        const noteContentElement = document.getElementById('noteContentEditor');
        if (noteContentElement) {
            noteContentElement.value = '';
            noteContentElement.style.visibility = 'visible'; // Yeni form için görünür yap
        }
        
        this.editingNoteId = null;
        document.getElementById('noteModalTitle').textContent = 'Yeni Not Ekle';
    }

    // Template functionality removed - unused
    
    copyToClipboard(content) {
        // HTML'i temiz metne çevir
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        navigator.clipboard.writeText(textContent).then(() => {
            this.showNotification('Şablon içeriği panoya kopyalandı', 'success');
            
            // Modal'ı kapat
            // Template functionality removed - unused
        }).catch(() => {
            this.showNotification('Kopyalama işlemi başarısız', 'error');
        });
    }

    deleteNote(noteId) {
        if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.saveNotes();
            this.updateNotesDisplay();
            this.updateDashboardFavorites();
            this.updateDashboardRecentNotes();
            this.updateDashboardStats();
            this.showNotification('Not başarıyla silindi', 'success');
            
            // Close modal if it's open
            const modal = bootstrap.Modal.getInstance(document.getElementById('notePreviewModal'));
            if (modal) {
                modal.hide();
            }
        }
    }

    saveNotes() {
        this.saveData('notes', this.notes);
        this.updateDashboardFavorites();
        this.updateDashboardRecentNotes();
        this.updateDashboardStats();
    }

    setupNotesSearch() {
        const searchInput = document.getElementById('notes-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterNotes(searchTerm);
        });
    }

    filterNotes(searchTerm) {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        const rows = notesList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const titleCell = row.querySelector('td:first-child');
            const contentCell = row.querySelector('td:nth-child(2)');
            
            if (!titleCell || !contentCell) return;
            
            const title = titleCell.textContent.toLowerCase();
            const content = contentCell.textContent.toLowerCase();
            
            const matches = title.includes(searchTerm) || content.includes(searchTerm);
            row.style.display = matches ? '' : 'none';
        });
    }

    // Template functionality removed - unused

    setupTableSorting(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                this.sortTable(tableId, column);
            });
        });
    }

    sortTable(tableId, column) {
        const table = document.getElementById(tableId);
        if (!table) return;

        // Update sort direction
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        // Update sort icons
        this.updateSortIcons(tableId, column, this.currentSort.direction);

        // Sort data based on table type
        if (tableId === 'notes-table') {
            this.sortNotes(column, this.currentSort.direction);
        } else if (tableId === 'teklifler-table') {
            this.sortTeklifler(column, this.currentSort.direction);
        } else if (tableId === 'excel-table') {
            this.sortExcelTable(column, this.currentSort.direction);
        }
    }

    updateSortIcons(tableId, activeColumn, direction) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            const column = header.getAttribute('data-sort');
            
            if (icon) {
                icon.className = 'bi sort-icon';
                if (column === activeColumn) {
                    icon.classList.add(direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down');
                    icon.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
                } else {
                    icon.classList.add('bi-arrow-down-up');
                }
            }
        });
    }

    sortNotes(column, direction) {
        const dataToSort = this.filteredNotes.length > 0 ? this.filteredNotes : this.notes;
        
        dataToSort.sort((a, b) => {
            let aValue = a[column] || '';
            let bValue = b[column] || '';

            // Handle date sorting
            if (column === 'date') {
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            } else {
                // Convert to string for text comparison
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        this.updateNotesDisplay(dataToSort);
    }

    sortTeklifler(column, direction) {
        const dataToSort = this.filteredTeklifler.length > 0 ? this.filteredTeklifler : this.teklifler;
        
        dataToSort.sort((a, b) => {
            let aValue = a[column] || '';
            let bValue = b[column] || '';

            // Convert to string for text comparison
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        this.updateTekliflerTable(dataToSort);
    }

    sortExcelTable(column, direction) {
        if (!this.currentExcelRows) return;

        const columnIndex = parseInt(column.replace('col-', ''));
        const rowsToSort = [...this.currentExcelRows];

        rowsToSort.sort((a, b) => {
            let aValue = a[columnIndex] || '';
            let bValue = b[columnIndex] || '';

            // Try to convert to numbers for numeric sorting
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                aValue = aNum;
                bValue = bNum;
            } else {
                // Convert to string for text comparison
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        this.updateExcelTableDisplay(rowsToSort);
    }

    // Teklifler
    loadTeklifler() {
        const teklifler = this.loadData('teklifler');
        if (teklifler) {
            this.teklifler = teklifler;
        }
        this.updateTekliflerTable();
    }

    updateTekliflerTable(tekliflerToDisplay = null) {
        const tekliflerList = document.getElementById('teklifler-list');
        if (!tekliflerList) return;
        const displayTeklifler = tekliflerToDisplay || this.teklifler;
        if (displayTeklifler.length === 0) {
            tekliflerList.innerHTML = `<tr><td colspan="15" class="text-center py-4">Henüz teklif yok</td></tr>`;
            return;
        }
        let html = '';
        displayTeklifler.forEach((teklif, idx) => {
            html += `
                <tr>
                    <td>${teklif.title || '-'}</td>
                    <td>${teklif.vkn || '-'}</td>
                    <td>${teklif.name || '-'}</td>
                    <td>${teklif.phone || '-'}</td>
                    <td>${teklif.email || '-'}</td>
                    <td>${teklif.price || '-'}</td>
                    <td>${teklif.desc || '-'}</td>
                    <td>${teklif.downPayment || '-'}</td>
                    <td>${teklif.downRate || '-'}</td>
                    <td>${teklif.term || '-'}</td>
                    <td>${teklif.branch || '-'}</td>
                    <td>${teklif.currency || '-'}</td>
                    <td>${teklif.rentCurrency || '-'}</td>
                    <td>${teklif.notes || '-'}</td>
                    <td>
                        <button class="btn btn-outline-primary btn-sm" onclick="mimtranet.editTeklif(${idx})" title="Düzenle"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-outline-danger btn-sm" onclick="mimtranet.deleteTeklif(${idx})" title="Sil"><i class="bi bi-trash"></i></button>
                        <button class="btn btn-outline-success btn-sm" onclick="mimtranet.mailTeklif(${idx})" title="Mail Gönder"><i class="bi bi-envelope"></i></button>
                    </td>
                </tr>
            `;
        });
        tekliflerList.innerHTML = html;
    }

    showTekliflerModal(isEdit = false) {
        this.clearTeklifForm();
        this.editingTeklifId = null;
        document.getElementById('teklifModalTitle').textContent = isEdit ? 'Teklif Düzenle' : 'Teklif Ekle';
        const modal = new bootstrap.Modal(document.getElementById('teklifModal'));
        modal.show();
    }

    clearTeklifForm() {
        document.getElementById('teklifForm').reset();
        document.getElementById('teklifTerm').selectedIndex = -1;
    }

    saveTeklif() {
        const teklif = {
            title: document.getElementById('teklifTitle').value.trim(),
            vkn: document.getElementById('teklifVKN').value.trim(),
            name: document.getElementById('teklifName').value.trim(),
            phone: document.getElementById('teklifPhone').value.trim(),
            email: document.getElementById('teklifEmail').value.trim(),
            price: document.getElementById('teklifPrice').value.trim(),
            currency: document.getElementById('teklifCurrency').value,
            desc: document.getElementById('teklifDesc').value.trim(),
            downPayment: document.getElementById('teklifDownPayment').value.trim(),
            downRate: document.getElementById('teklifDownRate').value.trim(),
            term: Array.from(document.getElementById('teklifTerm').selectedOptions).map(opt => opt.value).join(', '),
            branch: document.getElementById('teklifBranch').value.trim(),
            rentCurrency: document.getElementById('teklifRentCurrency').value,
            notes: document.getElementById('teklifNotes').value.trim()
        };
        if (this.editingTeklifId !== null) {
            this.teklifler[this.editingTeklifId] = teklif;
        } else {
            this.teklifler.push(teklif);
        }
        this.saveTeklifler();
        this.updateTekliflerTable();
        const modal = bootstrap.Modal.getInstance(document.getElementById('teklifModal'));
        modal.hide();
        this.showNotification('Teklif kaydedildi', 'success');
    }

    editTeklif(idx) {
        const teklif = this.teklifler[idx];
        if (!teklif) return;
        this.showTekliflerModal(true);
        document.getElementById('teklifTitle').value = teklif.title;
        document.getElementById('teklifVKN').value = teklif.vkn || '';
        document.getElementById('teklifName').value = teklif.name;
        document.getElementById('teklifPhone').value = teklif.phone;
        document.getElementById('teklifEmail').value = teklif.email;
        document.getElementById('teklifPrice').value = teklif.price;
        document.getElementById('teklifCurrency').value = teklif.currency;
        document.getElementById('teklifDesc').value = teklif.desc;
        document.getElementById('teklifDownPayment').value = teklif.downPayment;
        document.getElementById('teklifDownRate').value = teklif.downRate;
        // Vade (çoklu seçim)
        const termSelect = document.getElementById('teklifTerm');
        Array.from(termSelect.options).forEach(opt => {
            opt.selected = teklif.term.split(', ').includes(opt.value);
        });
        document.getElementById('teklifBranch').value = teklif.branch;
        document.getElementById('teklifRentCurrency').value = teklif.rentCurrency;
        document.getElementById('teklifNotes').value = teklif.notes;
        this.editingTeklifId = idx;
    }

    deleteTeklif(idx) {
        if (confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
            this.teklifler.splice(idx, 1);
            this.saveTeklifler();
            this.updateTekliflerTable();
            this.showNotification('Teklif silindi', 'success');
        }
    }

    mailTeklif(idx) {
        const teklif = this.teklifler[idx];
        if (!teklif) return;
        // Subject: Yeni Teklif - <unvan> - <Ad Soyad>
        const subject = encodeURIComponent(`Yeni Teklif - ${teklif.title || ''} - ${teklif.name || ''}`);
        const body = encodeURIComponent(
            `Unvan: ${teklif.title}\nTCKN: ${teklif.vkn || ''}\nAd Soyad: ${teklif.name}\nTelefon: ${teklif.phone}\nE-posta: ${teklif.email}\nMal Bedeli: ${teklif.price}\nPara Birimi: ${teklif.currency}\nMal Tanıtı: ${teklif.desc}\nPeşinat: ${teklif.downPayment}\nPeşinat Oranı: ${teklif.downRate}\nVade: ${teklif.term}\nŞube: ${teklif.branch}\nKira Para Birimi: ${teklif.rentCurrency}\nNotlar: ${teklif.notes}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    saveTeklifler() {
        this.saveData('teklifler', this.teklifler);
        this.updateDashboardStats();
    }

    exportNotes() {
        if (this.notes.length === 0) {
            this.showNotification('Dışa aktarılacak not bulunamadı', 'warning');
            return;
        }

        const exportData = {
            notes: this.notes,
            exportDate: new Date().toISOString(),
            totalNotes: this.notes.length,
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `notlar_${timestamp}.json`;
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification(`${this.notes.length} not başarıyla dışa aktarıldı`, 'success');
    }

    importNotes(file) {
        if (!file) {
            const input = document.getElementById('importNotesInput');
            if (input) {
                input.click();
            }
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                
                // Validate import data
                if (!importData.notes || !Array.isArray(importData.notes)) {
                    this.showNotification('Geçersiz dosya formatı', 'error');
                    return;
                }
                
                // Check if notes have required fields
                const validNotes = importData.notes.filter(note => 
                    note.title && note.content && note.id
                );
                
                if (validNotes.length === 0) {
                    this.showNotification('Geçerli not bulunamadı', 'error');
                    return;
                }
                
                // Merge notes (avoid duplicates by ID)
                const existingIds = new Set(this.notes.map(note => note.id));
                const newNotes = validNotes.filter(note => !existingIds.has(note.id));
                
                if (newNotes.length === 0) {
                    this.showNotification('Tüm notlar zaten mevcut', 'info');
                    return;
                }
                
                // Add new notes
                this.notes.push(...newNotes);
                    this.saveNotes();
                    this.updateNotesDisplay();
                    
                    this.showNotification(`${newNotes.length} yeni not başarıyla içe aktarıldı`, 'success');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Dosya okunamadı', 'error');
                }
            };
            
            reader.readAsText(file);
    }

    // Tek not dışa aktarma
    exportSingleNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            this.showNotification('Not bulunamadı', 'error');
            return;
        }

        const exportData = {
            notes: [note],
            exportDate: new Date().toISOString(),
            totalNotes: 1,
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `not_${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Not başarıyla dışa aktarıldı', 'success');
    }

    // Tüm verileri dışa aktarma (ayarlar sayfası için)
    exportAllData() {
        this.exportAllSettings();
    }

    // Tüm ayarları dışa aktarma
    exportAllSettings() {
        console.log('Parametreler dışa aktarma sırasında:', this.parametreler);
        const exportData = {
            notes: this.notes,
            teklifler: this.teklifler,
            excelFiles: this.excelFiles.map(file => ({
                ...file,
                data: file.data // Excel verilerini de dahil et
            })),
            evraklar: evrakManager ? evrakManager.loadEvraklar() : [],
            sablonlar: this.sablonlar || [],
            parametreler: this.parametreler || [],
            hazirMetinler: this.hazirMetinler || [],
            exportDate: new Date().toISOString(),
            version: '2.0',
            totalItems: {
                notes: this.notes.length,
                teklifler: this.teklifler.length,
                excelFiles: this.excelFiles.length,
                evraklar: evrakManager ? evrakManager.loadEvraklar().length : 0,
                sablonlar: this.sablonlar ? this.sablonlar.length : 0,
                parametreler: this.parametreler ? this.parametreler.length : 0,
                hazirMetinler: this.hazirMetinler ? this.hazirMetinler.length : 0
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `mimtranet_tum_ayarlar_${timestamp}.json`;
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const totalItems = Object.values(exportData.totalItems).reduce((a, b) => a + b, 0);
        this.showNotification(`Tüm ayarlar başarıyla dışa aktarıldı (${totalItems} öğe)`, 'success');
    }

    // Tüm ayarları içe aktarma
    importAllSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (!importData.version || importData.version !== '2.0') {
                        this.showNotification('Geçersiz veya eski dosya formatı', 'error');
                        return;
                    }

                    let importedCount = 0;
                    
                    // Notları içe aktar
                    if (importData.notes && Array.isArray(importData.notes)) {
                        const existingNoteIds = new Set(this.notes.map(note => note.id));
                        const newNotes = importData.notes.filter(note => 
                            note.title && note.content && note.id && !existingNoteIds.has(note.id)
                        );
                        this.notes.push(...newNotes);
                        this.saveNotes();
                        importedCount += newNotes.length;
                    }

                    // Teklifleri içe aktar
                    if (importData.teklifler && Array.isArray(importData.teklifler)) {
                        const existingTeklifIds = new Set(this.teklifler.map(t => t.id));
                        const newTeklifler = importData.teklifler.filter(teklif => 
                            teklif.id && !existingTeklifIds.has(teklif.id)
                        );
                        this.teklifler.push(...newTeklifler);
                        this.saveTeklifler();
                        importedCount += newTeklifler.length;
                    }

                    // Excel dosyalarını içe aktar
                    if (importData.excelFiles && Array.isArray(importData.excelFiles)) {
                        const existingExcelIds = new Set(this.excelFiles.map(f => f.id));
                        const newExcelFiles = importData.excelFiles.filter(file => 
                            file.id && file.title && file.data && !existingExcelIds.has(file.id)
                        );
                        this.excelFiles.push(...newExcelFiles);
                        this.saveExcelFiles();
                        importedCount += newExcelFiles.length;
                    }

                    // Evrakları içe aktar
                    if (importData.evraklar && Array.isArray(importData.evraklar) && evrakManager) {
                        const existingEvraklar = evrakManager.loadEvraklar();
                        const existingEvrakNames = new Set(existingEvraklar.map(e => e.ad?.toLowerCase().trim()));
                        const newEvraklar = importData.evraklar.filter(evrak => {
                            // Temel alan kontrolleri
                            if (!evrak.ad || !evrak.ad.trim()) {
                                console.warn('Adı olmayan evrak atlandı:', evrak);
                                return false;
                            }
                            // Çakışma kontrolü
                            const evrakName = evrak.ad.toLowerCase().trim();
                            return !existingEvrakNames.has(evrakName);
                        });
                        
                        if (newEvraklar.length > 0) {
                            existingEvraklar.push(...newEvraklar);
                            evrakManager.evraklar = existingEvraklar;
                            evrakManager.saveEvraklar();
                            evrakManager.renderList();
                            importedCount += newEvraklar.length;
                        }
                    }

                    // Görünümleri güncelle
                    this.updateNotesDisplay();
                    this.updateTekliflerTable();
                    this.updateExcelFilesDisplay();
                    this.updateDashboardStats();
                    if (evrakManager) evrakManager.renderList();
                    
                    this.showNotification(`${importedCount} yeni öğe başarıyla içe aktarıldı`, 'success');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Dosya okunamadı', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    updateDashboardFavorites() {
        const favoritesContainer = document.getElementById('dashboard-favorites');
        if (!favoritesContainer) return;

        const favoriteNotes = this.notes.filter(note => note.favorite);
        
        if (favoriteNotes.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-star"></i>
                    <p>Henüz favori not yok</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th style="width: 40%;">Başlık</th>
                            <th style="width: 60%;">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        favoriteNotes.forEach(note => {
            const plainContent = this.stripHtml(note.content);
            const truncatedContent = plainContent.length > 150 ? plainContent.substring(0, 150) + '...' : plainContent;
            
            html += `
                <tr style="cursor: pointer;" onclick="mimtranet.showNotePreview('${note.id}')">
                    <td style="width: 40%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${note.title}</td>
                    <td style="width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${truncatedContent}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        favoritesContainer.innerHTML = html;
    }

    updateDashboardFavoriteTemplates() {
        const templatesContainer = document.getElementById('dashboard-favorite-templates');
        if (!templatesContainer) return;

        const favoriteTemplates = this.sablonlar.filter(sablon => sablon.isFavorite);
        
        if (favoriteTemplates.length === 0) {
            templatesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-heart"></i>
                    <p>Henüz favori şablon yok</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th style="width: 10%;">İşlem</th>
                            <th style="width: 40%;">Şablon Adı</th>
                            <th style="width: 50%;">İçerik Önizleme</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        favoriteTemplates.forEach((sablon, index) => {
            const originalIndex = this.sablonlar.indexOf(sablon);
            const preview = sablon.content.length > 80 ? sablon.content.substring(0, 80) + '...' : sablon.content;
            
            // Parametre kontrolü yap (başlık ve içerik)
            const parameters = this.extractParameters(sablon.content, sablon.name);
            const hasParameters = parameters.length > 0;
            
            // E-posta butonu sadece parametre yoksa gösterilecek
            const emailButton = hasParameters ? '' : `
                <button class="btn btn-outline-info btn-sm" onclick="mimtranet.sendSablonDirectByEmail(${originalIndex})" title="E-Posta ile Gönder">
                    <i class="bi bi-envelope"></i>
                </button>`;
            
            html += `
                <tr>
                    <td style="width: 10%;">
                        <div class="btn-group" role="group">
                            ${emailButton}
                            <button class="btn btn-outline-primary btn-sm" onclick="mimtranet.showSablonCopyModal(${originalIndex})" title="Kopyala">
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </div>
                    </td>
                    <td style="width: 40%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sablon.name}</td>
                    <td style="width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${preview}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        templatesContainer.innerHTML = html;
    }

    updateDashboardRecentNotes() {
        const recentContainer = document.getElementById('dashboard-recent-notes');
        if (!recentContainer) return;

        // Get last 5 notes sorted by creation date with fallback
        const recentNotes = [...this.notes]
            .sort((a, b) => {
                // Use createdAt if available, otherwise use id (timestamp) or createdDate as fallback
                const dateA = a.createdAt || a.createdDate || a.id;
                const dateB = b.createdAt || b.createdDate || b.id;
                return new Date(dateB) - new Date(dateA);
            })
            .slice(0, 5);
        
        if (recentNotes.length === 0) {
            recentContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-journal-text"></i>
                    <p>Henüz not yok</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th style="width: 40%;">Başlık</th>
                            <th style="width: 60%;">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        recentNotes.forEach(note => {
            const plainContent = this.stripHtml(note.content);
            const truncatedContent = plainContent.length > 150 ? plainContent.substring(0, 150) + '...' : plainContent;
            
            html += `
                <tr style="cursor: pointer;" onclick="mimtranet.showNotePreview('${note.id}')">
                    <td style="width: 40%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${note.title}</td>
                    <td style="width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${truncatedContent}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        recentContainer.innerHTML = html;
    }

    updateDashboardFavoriteEvraklar() {
        console.log('updateDashboardFavoriteEvraklar çağrıldı');
        const container = document.getElementById('favori-evraklar-widget');
        if (!container) {
            console.log('favori-evraklar-widget container bulunamadı!');
            return;
        }
        
        console.log('evrakManager:', this.evrakManager);
        const favoriteEvraklar = this.evrakManager ? this.evrakManager.evraklar.filter(evrak => evrak.favori) : [];
        console.log('Favori evraklar:', favoriteEvraklar);
        
        let html = '';
        if (favoriteEvraklar.length === 0) {
            html = '<p class="text-muted mb-0">Henüz favori evrak yok</p>';
        } else {
            html = `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Dosyalar</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            favoriteEvraklar.slice(0, 5).forEach((evrak, idx) => {
                const dosyalarHtml = evrak.dosyalar && evrak.dosyalar.length > 0 
                    ? evrak.dosyalar.map((d, di) => `<a href="#" onclick="evrakManager.openEvrak(${idx},${di});return false;" class="text-decoration-none me-2"><i class="bi bi-paperclip"></i> ${d.dosya}</a>`).join('')
                    : '<span class="text-muted">-</span>';
                
                html += `
                    <tr>
                        <td>
                            <div class="fw-bold text-primary">${evrak.ad}</div>
                            ${evrak.icerik ? `<small class="text-muted">${evrak.icerik}</small>` : ''}
                        </td>
                        <td>${dosyalarHtml}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            if (favoriteEvraklar.length > 5) {
                html += `<small class="text-muted">ve ${favoriteEvraklar.length - 5} evrak daha...</small>`;
            }
        }
        
        container.innerHTML = html;
    }
    
    updateDashboardStats() {
        const statsContainer = document.getElementById('dashboard-stats');
        if (!statsContainer) return;

        const totalNotes = this.notes.length;
        const favoriteNotes = this.notes.filter(note => note.favorite).length;
        const totalExcelFiles = this.excelFiles.length;
        const totalTeklifler = this.teklifler.length;
        const totalEvraklar = window.evrakManager ? window.evrakManager.evraklar.length : 0;
        const totalSablonlar = this.sablonlar.length;

        const html = `
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-journal-text mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${totalNotes}</div>
                            <small class="ms-2">Toplam Not</small>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-star-fill text-warning mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${favoriteNotes}</div>
                            <small class="ms-2">Favori Not</small>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-file-earmark-excel text-success mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${totalExcelFiles}</div>
                            <small class="ms-2">Excel Dosya</small>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-file-earmark-text text-info mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${totalTeklifler}</div>
                            <small class="ms-2">Teklif</small>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-folder2-open text-secondary mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${totalEvraklar}</div>
                            <small class="ms-2">Evrak</small>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex flex-column align-items-center justify-content-center text-center">
                        <i class="bi bi-file-earmark-code text-primary mb-2" style="font-size: 1.5rem;"></i>
                        <div class="d-flex align-items-center">
                            <div class="fw-bold">${totalSablonlar}</div>
                            <small class="ms-2">Şablon</small>
                        </div>
                    </div>
                </div>
        `;
        
        statsContainer.innerHTML = html;
    }

    stripHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    showNotePreview(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        document.getElementById('notePreviewTitle').textContent = note.title;
        document.getElementById('notePreviewContent').innerHTML = note.content;
        
        // Update action buttons in modal footer
        const modalFooter = document.getElementById('notePreviewModalFooter');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-${note.favorite ? 'warning' : 'secondary'}" 
                            onclick="mimtranet.toggleFavorite('${note.id}')" 
                            title="${note.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                        <i class="bi bi-star${note.favorite ? '-fill' : ''}"></i>
                        ${note.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    </button>
                    <button class="btn btn-outline-info" 
                            onclick="mimtranet.exportSingleNote('${note.id}')" 
                            title="Bu Notu Dışa Aktar">
                        <i class="bi bi-download"></i>
                        Dışa Aktar
                    </button>
                    <button class="btn btn-outline-success" 
                            onclick="mimtranet.editNote('${note.id}')" 
                            title="Düzenle">
                        <i class="bi bi-pencil"></i>
                        Düzenle
                    </button>
                    <button class="btn btn-outline-danger" 
                            onclick="mimtranet.deleteNote('${note.id}')" 
                            title="Sil">
                        <i class="bi bi-trash"></i>
                        Sil
                    </button>
                </div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
            `;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('notePreviewModal'));
        modal.show();
    }

    filterTeklifler(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredTeklifler = [];
            this.updateTekliflerTable();
            return;
        }

        this.filteredTeklifler = this.teklifler.filter(teklif => {
            const title = (teklif.title || '').toLowerCase();
            const name = (teklif.name || '').toLowerCase();
            const phone = (teklif.phone || '').toLowerCase();
            const email = (teklif.email || '').toLowerCase();
            const price = (teklif.price || '').toLowerCase();
            const desc = (teklif.desc || '').toLowerCase();
            const downPayment = (teklif.downPayment || '').toLowerCase();
            const downRate = (teklif.downRate || '').toLowerCase();
            const term = (teklif.term || '').toLowerCase();
            const branch = (teklif.branch || '').toLowerCase();
            const currency = (teklif.currency || '').toLowerCase();
            const rentCurrency = (teklif.rentCurrency || '').toLowerCase();
            const notes = (teklif.notes || '').toLowerCase();
            
            return title.includes(searchTerm) || 
                   name.includes(searchTerm) || 
                   phone.includes(searchTerm) || 
                   email.includes(searchTerm) || 
                   price.includes(searchTerm) || 
                   desc.includes(searchTerm) || 
                   downPayment.includes(searchTerm) || 
                   downRate.includes(searchTerm) || 
                   term.includes(searchTerm) || 
                   branch.includes(searchTerm) || 
                   currency.includes(searchTerm) || 
                   rentCurrency.includes(searchTerm) || 
                   notes.includes(searchTerm);
        });

        this.updateTekliflerTable(this.filteredTeklifler);
    }

    setupTekliflerSearch() {
        const searchInput = document.getElementById('teklifler-global-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterTeklifler(searchTerm);
        });

        // Setup sorting for teklifler table
        this.setupTableSorting('teklifler-table');
    }

    setupExcelTableFeatures() {
        // Filtre inputları
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.filterExcelTable();
            });
        });

        // Sıralama ikonları
        const sortIcons = document.querySelectorAll('.sort-icon');
        sortIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const colIndex = parseInt(icon.getAttribute('data-sort-index'));
                this.sortExcelTable(colIndex);
            });
        });

        // Sıralama durumu
        this.excelSortState = { col: null, asc: true };
    }

    filterExcelTable() {
        const filterInputs = document.querySelectorAll('.filter-input');
        let filteredRows = this.currentExcelRows;
        filterInputs.forEach((input, colIdx) => {
            const value = input.value.trim().toLowerCase();
            if (value) {
                filteredRows = filteredRows.filter(row => {
                    const cell = (row[colIdx] || '').toString().toLowerCase();
                    return cell.includes(value);
                });
            }
        });
        this.updateExcelTableDisplay(filteredRows);
    }

    sortExcelTable(colIndex) {
        if (!this.currentExcelRows) return;
        // Sıralama yönünü değiştir
        if (this.excelSortState && this.excelSortState.col === colIndex) {
            this.excelSortState.asc = !this.excelSortState.asc;
        } else {
            this.excelSortState = { col: colIndex, asc: true };
        }
        // Sıralama
        const sortedRows = [...this.currentExcelRows].sort((a, b) => {
            let aValue = a[colIndex] || '';
            let bValue = b[colIndex] || '';
            // Sayısal sıralama desteği
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                aValue = aNum;
                bValue = bNum;
            } else {
                aValue = aValue.toString().toLowerCase();
                bValue = bValue.toString().toLowerCase();
            }
            if (aValue > bValue) return this.excelSortState.asc ? 1 : -1;
            if (aValue < bValue) return this.excelSortState.asc ? -1 : 1;
            return 0;
        });
        this.updateExcelTableDisplay(sortedRows);
    }

    updateExcelTableDisplay(rowsToDisplay) {
        const tbody = document.querySelector('#excel-table tbody');
        if (!tbody) return;
        if (!rowsToDisplay || rowsToDisplay.length === 0) {
            tbody.innerHTML = '<tr><td colspan="' + this.currentExcelHeaders.length + '" class="text-center py-4">Veri bulunamadı</td></tr>';
            return;
        }
        let html = '';
        rowsToDisplay.forEach(row => {
            html += '<tr>';
            this.currentExcelHeaders.forEach((header, index) => {
                const cellValue = row[index] || '';
                html += `<td>${cellValue}</td>`;
         });
         html += '</tr>';
        });
        
        tbody.innerHTML = html;
    }

    // Parametre Yönetimi Fonksiyonları
    loadParametreler() {
        const saved = this.loadData('parametreler');
        if (saved) {
            this.parametreler = saved;
        }
    }

    saveParametreler() {
        this.saveData('parametreler', this.parametreler);
    }

    // Hazır Metinler Fonksiyonları
    loadHazirMetinler() {
        const saved = this.loadData('hazir_metinler');
        if (saved) {
            this.hazirMetinler = saved;
        }
    }

    saveHazirMetinler() {
        this.saveData('hazir_metinler', this.hazirMetinler);
    }

    showHazirMetinlerModal() {
        this.updateHazirMetinlerDisplay();
        const modal = new bootstrap.Modal(document.getElementById('hazirMetinlerModal'));
        modal.show();
    }

    showHazirMetinAddModal() {
        this.clearHazirMetinForm();
        const modal = new bootstrap.Modal(document.getElementById('hazirMetinAddModal'));
        modal.show();
    }

    clearHazirMetinForm() {
        document.getElementById('hazirMetinIcerik').value = '';
    }

    addHazirMetin() {
        const icerik = document.getElementById('hazirMetinIcerik').value.trim();
        
        if (!icerik) {
            this.showNotification('Lütfen içerik alanını doldurun!', 'error');
            return;
        }
        
        const yeniMetin = {
            id: Date.now(),
            icerik: icerik,
            createdAt: new Date().toISOString()
        };
        
        this.hazirMetinler.push(yeniMetin);
        this.saveHazirMetinler();
        this.updateHazirMetinlerDisplay();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('hazirMetinAddModal'));
        modal.hide();
        
        this.showNotification('Hazır metin başarıyla eklendi!', 'success');
    }

    updateHazirMetinlerDisplay() {
        const tbody = document.getElementById('hazir-metinler-list');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.hazirMetinler.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Henüz hazır metin eklenmemiş</td></tr>';
            return;
        }
        
        this.hazirMetinler.forEach((metin, index) => {
            const row = document.createElement('tr');
            const preview = metin.icerik.length > 150 ? metin.icerik.substring(0, 150) + '...' : metin.icerik;
            
            row.innerHTML = `
                <td>${preview}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="mimtranet.editHazirMetin(${index})" title="Düzenle">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="mimtranet.deleteHazirMetin(${index})" title="Sil">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Dropdown'ları da güncelle
        this.updateHazirMetinlerDropdowns();
    }

    editHazirMetin(index) {
        const metin = this.hazirMetinler[index];
        if (!metin) return;
        
        document.getElementById('editHazirMetinIcerik').value = metin.icerik;
        
        this.currentEditingHazirMetinIndex = index;
        
        const modal = new bootstrap.Modal(document.getElementById('hazirMetinEditModal'));
        modal.show();
    }

    updateHazirMetin() {
        if (this.currentEditingHazirMetinIndex === undefined) return;
        
        const icerik = document.getElementById('editHazirMetinIcerik').value.trim();
        
        if (!icerik) {
            this.showNotification('Lütfen içerik alanını doldurun!', 'error');
            return;
        }
        
        this.hazirMetinler[this.currentEditingHazirMetinIndex].icerik = icerik;
        
        this.saveHazirMetinler();
        this.updateHazirMetinlerDisplay();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('hazirMetinEditModal'));
        modal.hide();
        
        this.showNotification('Hazır metin başarıyla güncellendi!', 'success');
        
        this.currentEditingHazirMetinIndex = undefined;
    }

    deleteHazirMetin(index) {
        if (confirm('Bu hazır metni silmek istediğinizden emin misiniz?')) {
            this.hazirMetinler.splice(index, 1);
            this.saveHazirMetinler();
            this.updateHazirMetinlerDisplay();
            this.showNotification('Hazır metin başarıyla silindi!', 'success');
        }
    }

    updateHazirMetinlerDropdowns() {
        // Şablon ekleme modalı için dropdown güncelle
        const addDropdown = document.getElementById('hazirMetinlerListAdd');
        if (addDropdown) {
            this.populateHazirMetinlerDropdown(addDropdown, 'sablonContent');
        }
        
        // Şablon düzenleme modalı için dropdown güncelle
        const editDropdown = document.getElementById('hazirMetinlerListEdit');
        if (editDropdown) {
            this.populateHazirMetinlerDropdown(editDropdown, 'editSablonContent');
        }
    }

    populateHazirMetinlerDropdown(dropdown, targetTextareaId) {
        dropdown.innerHTML = '';
        
        if (this.hazirMetinler.length === 0) {
            dropdown.innerHTML = '<li><span class="dropdown-item-text text-muted">Henüz hazır metin yok</span></li>';
            return;
        }
        
        this.hazirMetinler.forEach((metin, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.innerHTML = `${metin.icerik.substring(0, 80)}${metin.icerik.length > 80 ? '...' : ''}`;
            a.onclick = (e) => {
                e.preventDefault();
                this.insertHazirMetinToTextarea(targetTextareaId, metin.icerik);
            };
            li.appendChild(a);
            dropdown.appendChild(li);
        });
    }

    insertHazirMetinToTextarea(textareaId, content) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;
        
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const textBefore = textarea.value.substring(0, startPos);
        const textAfter = textarea.value.substring(endPos, textarea.value.length);
        
        // İmlecin bulunduğu yere hazır metni ekle
        textarea.value = textBefore + content + textAfter;
        
        // İmleci eklenen metnin sonuna konumlandır
        const newCursorPos = startPos + content.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        this.showNotification('Hazır metin eklendi!', 'success');
    }

    showParametreAddModal() {
        this.clearParametreForm();
        const modal = new bootstrap.Modal(document.getElementById('parametreAddModal'));
        modal.show();
    }

    showParametreListModal() {
        this.updateParametreList();
        const modal = new bootstrap.Modal(document.getElementById('parametreListModal'));
        modal.show();
    }

    clearParametreForm() {
        document.getElementById('parametreName').value = '';
        document.getElementById('parametreDescription').value = '';
        document.getElementById('parametreType').value = 'text';
    }

    addParametre() {
        const adi = document.getElementById('parametreName').value.trim();
        const aciklama = document.getElementById('parametreDescription').value.trim();
        const inputType = document.getElementById('parametreType').value;

        if (!adi) {
            this.showNotification('Parametre adı boş olamaz!', 'error');
            return;
        }

        // Aynı isimde parametre var mı kontrol et
        if (this.parametreler.some(p => p.adi === adi)) {
            this.showNotification('Bu isimde bir parametre zaten mevcut!', 'error');
            return;
        }

        const parametre = {
            id: Date.now(),
            adi: adi,
            aciklama: aciklama,
            inputType: inputType
        };

        this.parametreler.push(parametre);
        this.saveParametreler();
        this.showNotification('Parametre başarıyla eklendi!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('parametreAddModal'));
        modal.hide();
        this.updateParametreButtons();
    }

    editParametre(index) {
        const parametre = this.parametreler[index];
        if (!parametre) return;

        this.editingParametreIndex = index;
        document.getElementById('editParametreName').value = parametre.adi;
        document.getElementById('editParametreDescription').value = parametre.aciklama;
        document.getElementById('editParametreType').value = parametre.inputType || 'text';
        const modal = new bootstrap.Modal(document.getElementById('parametreEditModal'));
        modal.show();
    }

    updateParametre() {
        if (this.editingParametreIndex === null) return;

        const adi = document.getElementById('editParametreName').value.trim();
        const aciklama = document.getElementById('editParametreDescription').value.trim();
        const inputType = document.getElementById('editParametreType').value;

        if (!adi) {
            this.showNotification('Parametre adı boş olamaz!', 'error');
            return;
        }

        // Aynı isimde başka parametre var mı kontrol et (kendisi hariç)
        if (this.parametreler.some((p, i) => p.adi === adi && i !== this.editingParametreIndex)) {
            this.showNotification('Bu isimde bir parametre zaten mevcut!', 'error');
            return;
        }

        this.parametreler[this.editingParametreIndex].adi = adi;
        this.parametreler[this.editingParametreIndex].aciklama = aciklama;
        this.parametreler[this.editingParametreIndex].inputType = inputType;
        
        this.saveParametreler();
        this.showNotification('Parametre başarıyla güncellendi!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('parametreEditModal'));
        modal.hide();
        this.editingParametreIndex = null;
        this.updateParametreList();
        this.updateParametreButtons();
    }

    deleteParametre(index) {
        if (confirm('Bu parametreyi silmek istediğinizden emin misiniz?')) {
            this.parametreler.splice(index, 1);
            this.saveParametreler();
            this.showNotification('Parametre başarıyla silindi!', 'success');
            this.updateParametreList();
            this.updateParametreButtons();
        }
    }

    updateParametreList() {
        const tbody = document.querySelector('#parametreler-list');
        if (!tbody) return;

        const inputTypeLabels = {
            'text': 'Metin',
            'date': 'Tarih',
            'number': 'Sayı',
            'email': 'E-posta'
        };

        let html = '';
        this.parametreler.forEach((parametre, index) => {
            const inputTypeLabel = inputTypeLabels[parametre.inputType] || 'Metin';
            html += `
                <tr>
                    <td>${parametre.adi}</td>
                    <td>${inputTypeLabel}</td>
                    <td>${parametre.aciklama || '-'}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-success" onclick="mimtranet.editParametre(${index})" title="Düzenle">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="mimtranet.deleteParametre(${index})" title="Sil">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateParametreButtons() {
        const containers = [
            document.getElementById('addParametreButtons'),
            document.getElementById('editParametreButtons')
        ];

        containers.forEach(container => {
            if (!container) return;

            let html = '';
            this.parametreler.forEach(parametre => {
                html += `
                    <button type="button" class="btn btn-outline-primary btn-sm me-1 mb-1" 
                            onclick="mimtranet.insertParametreAtCursor('${parametre.adi}')" 
                            title="${parametre.aciklama || parametre.adi}">
                        ${parametre.adi}
                    </button>
                `;
            });

            container.innerHTML = html;
        });
    }

    insertParametreAtCursor(parametreAdi) {
        const parameterText = `/${parametreAdi}`;
        
        // Şablon ekleme modalı açık mı kontrol et
        const addModal = document.getElementById('sablonAddModal');
        const editModal = document.getElementById('sablonEditModal');
        
        if (addModal && addModal.classList.contains('show')) {
            // TinyMCE editörü var mı kontrol et
            if (typeof tinymce !== 'undefined' && tinymce.get('sablonContent')) {
                const editor = tinymce.get('sablonContent');
                editor.insertContent(parameterText);
                editor.focus();
            } else {
                // Fallback: normal textarea
                const textarea = document.getElementById('sablonContent');
                if (textarea) {
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(textarea.selectionEnd);
                    textarea.value = textBefore + parameterText + textAfter;
                    const newCursorPos = cursorPos + parameterText.length;
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                    textarea.focus();
                }
            }
        } else if (editModal && editModal.classList.contains('show')) {
            // TinyMCE editörü var mı kontrol et
            if (typeof tinymce !== 'undefined' && tinymce.get('editSablonContent')) {
                const editor = tinymce.get('editSablonContent');
                editor.insertContent(parameterText);
                editor.focus();
            } else {
                // Fallback: normal textarea
                const textarea = document.getElementById('editSablonContent');
                if (textarea) {
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(textarea.selectionEnd);
                    textarea.value = textBefore + parameterText + textAfter;
                    const newCursorPos = cursorPos + parameterText.length;
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                    textarea.focus();
                }
            }
        }
    }

    // Araçlar sayfası fonksiyonları
    setupAraclarEventListeners() {
        // Input değişikliklerinde otomatik hesaplama
        const tutarInput = document.getElementById('tutarInput');
        const payInput = document.getElementById('payInput');
        const kdvInput = document.getElementById('kdvInput');
        const yuzdeInput = document.getElementById('yuzdeInput');
        
        if (tutarInput) {
            // Tutar formatlaması için event listener
            tutarInput.addEventListener('input', (e) => {
                this.formatTutarInput(e.target);
                this.hesapla();
            });
            
            // Focus olduğunda formatı kaldır
            tutarInput.addEventListener('focus', (e) => {
                const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
                e.target.value = value;
            });
            
            // Blur olduğunda formatla
            tutarInput.addEventListener('blur', (e) => {
                this.formatTutarInput(e.target);
            });
        }
        if (payInput) {
            // Pay formatlaması için event listener
            payInput.addEventListener('input', (e) => {
                this.formatTutarInput(e.target);
                this.hesapla();
            });
            
            // Focus olduğunda formatı kaldır
            payInput.addEventListener('focus', (e) => {
                const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
                e.target.value = value;
            });
            
            // Blur olduğunda formatla
            payInput.addEventListener('blur', (e) => {
                this.formatTutarInput(e.target);
            });
        }
        if (kdvInput) {
            kdvInput.addEventListener('change', () => this.hesapla());
        }
        if (yuzdeInput) {
            yuzdeInput.addEventListener('input', () => this.hesapla());
        }
    }
    
    formatTutarInput(input) {
        let value = input.value;
        
        // Sadece sayı, virgül karakterlerini kabul et (nokta binlik ayırıcı olduğu için input sırasında kaldır)
        value = value.replace(/[^0-9,]/g, '');
        
        // Birden fazla virgül engelle
        const commaCount = (value.match(/,/g) || []).length;
        if (commaCount > 1) {
            const firstCommaIndex = value.indexOf(',');
            value = value.substring(0, firstCommaIndex + 1) + value.substring(firstCommaIndex + 1).replace(/,/g, '');
        }
        
        // Virgül varsa ondalık kısmı kontrol et
        if (value.includes(',')) {
            const [integerPart, decimalPart] = value.split(',');
            // Ondalık kısmı maksimum 2 hane
            const limitedDecimal = decimalPart ? decimalPart.substring(0, 2) : '';
            
            // Tam kısmı formatla (binlik ayırıcı)
            const formattedInteger = this.addThousandSeparators(integerPart);
            
            input.value = limitedDecimal ? `${formattedInteger},${limitedDecimal}` : formattedInteger + ',';
        } else {
            // Sadece tam sayı varsa binlik ayırıcı ekle
            input.value = this.addThousandSeparators(value);
        }
    }
    
    addThousandSeparators(num) {
        if (!num || num === '') return '';
        // Sadece sayıları al, diğer karakterleri temizle
        const cleanNum = num.toString().replace(/[^0-9]/g, '');
        if (!cleanNum) return '';
        return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    clearAraclarForm() {
        const tutarInput = document.getElementById('tutarInput');
        const payInput = document.getElementById('payInput');
        const kdvInput = document.getElementById('kdvInput');
        const yuzdeInput = document.getElementById('yuzdeInput');
        const sonuclar = document.getElementById('hesaplamaSonuclari');
        
        if (tutarInput) tutarInput.value = '';
        if (payInput) payInput.value = '';
        if (kdvInput) kdvInput.value = '20';
        if (yuzdeInput) yuzdeInput.value = '';
        if (sonuclar) sonuclar.style.display = 'none';
    }
    
    hesapla() {
        const tutarInput = document.getElementById('tutarInput');
        const payInput = document.getElementById('payInput');
        const kdvInput = document.getElementById('kdvInput');
        const yuzdeInput = document.getElementById('yuzdeInput');
        const sonuclar = document.getElementById('hesaplamaSonuclari');
        
        if (!tutarInput || !kdvInput || !yuzdeInput || !sonuclar) return;
        
        // Formatlanmış tutarı sayıya çevir
        let tutarValue = tutarInput.value.replace(/\./g, '').replace(',', '.');
        const tutar = parseFloat(tutarValue) || 0;
        const kdvOrani = parseFloat(kdvInput.value) || 0;
        const yuzdeOrani = parseFloat(yuzdeInput.value) || 0;
        
        // Pay değerini al
        let payValue = 0;
        let payOrani = 0;
        if (payInput) {
            payValue = payInput.value.replace(/\./g, '').replace(',', '.');
            payValue = parseFloat(payValue) || 0;
            
            // Pay oranını hesapla (Pay/Değer * 100)
            if (tutar > 0 && payValue > 0) {
                payOrani = (payValue / tutar) * 100;
            }
        }
        
        if (tutar <= 0) {
            sonuclar.style.display = 'none';
            return;
        }
        
        // KDV Hesaplamaları - İki farklı senaryo
        // Senaryo 1: Girilen tutar KDV hariç kabul edilirse
        const kdvHaricTutar = tutar;
        const kdvMiktari1 = (tutar * kdvOrani) / 100;
        const kdvDahilTutar = tutar + kdvMiktari1;
        
        // Senaryo 2: Girilen tutar KDV dahil kabul edilirse  
        const kdvDahilTutar2 = tutar;
        const kdvHaricTutar2 = tutar / (1 + (kdvOrani / 100));
        const kdvMiktari2 = kdvDahilTutar2 - kdvHaricTutar2;
        
        // Hangi senaryonun kullanılacağını belirle (varsayılan: KDV dahil)
        const finalKdvHaric = kdvHaricTutar2;
        const finalKdvDahil = kdvDahilTutar;
        const finalKdvMiktari = kdvMiktari2; // KDV dahil senaryosundan matrah alınmalı
        
        // Yüzde Hesaplamaları
        const yuzdeMiktari = (tutar * yuzdeOrani) / 100;
        const tutarArtiYuzde = tutar + yuzdeMiktari;
        const tutarEksiYuzde = tutar - yuzdeMiktari;
        const yuzdeOraniDegeri = yuzdeMiktari; // Tutarın yüzde oranının değeri
        
        // Sonuçları güncelle
        this.updateHesaplamaSonuclari({
            kdvHaricTutar: finalKdvHaric,
            kdvDahilTutar: finalKdvDahil,
            kdvMiktari1: kdvMiktari1, // KDV Dahil alanı için matrah
            kdvMiktari2: kdvMiktari2, // KDV Hariç alanı için matrah
            tutarArtiYuzde: tutarArtiYuzde,
            tutarEksiYuzde: tutarEksiYuzde,
            yuzdeOraniDegeri: yuzdeOraniDegeri,
            payOrani: payOrani
        });
        
        sonuclar.style.display = 'block';
    }
    
    updateHesaplamaSonuclari(sonuclar) {
        const formatTutar = (tutar) => {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2
            }).format(tutar);
        };
        
        // KDV Bilgileri
        const kdvHaricElement = document.getElementById('kdvHaricTutar');
        const kdvDahilElement = document.getElementById('kdvDahilTutar');
        const kdvMatrahi1Element = document.getElementById('kdvMatrahi1');
        const kdvMatrahi2Element = document.getElementById('kdvMatrahi2');
        
        if (kdvHaricElement) kdvHaricElement.textContent = formatTutar(sonuclar.kdvHaricTutar);
        if (kdvDahilElement) kdvDahilElement.textContent = formatTutar(sonuclar.kdvDahilTutar);
        if (kdvMatrahi1Element) kdvMatrahi1Element.textContent = formatTutar(sonuclar.kdvMiktari2); // KDV Hariç alanı için matrah
        if (kdvMatrahi2Element) kdvMatrahi2Element.textContent = formatTutar(sonuclar.kdvMiktari1); // KDV Dahil alanı için matrah
        
        // Yüzde Bilgileri
        const tutarArtiYuzdeElement = document.getElementById('tutarArtiYuzde');
        const tutarEksiYuzdeElement = document.getElementById('tutarEksiYuzde');
        const yuzdeOraniDegeriElement = document.getElementById('yuzdeOraniDegeri');
        const yuzdeArtiLabelElement = document.getElementById('yuzdeArtiLabel');
        const yuzdeEksiLabelElement = document.getElementById('yuzdeEksiLabel');
        const yuzdeOraniLabelElement = document.getElementById('yuzdeOraniLabel');
        
        // Yüzde oranını al
        const yuzdeInput = document.getElementById('yuzdeInput');
        const yuzdeOrani = yuzdeInput ? parseFloat(yuzdeInput.value) || 0 : 0;
        
        if (tutarArtiYuzdeElement) tutarArtiYuzdeElement.textContent = formatTutar(sonuclar.tutarArtiYuzde);
        if (tutarEksiYuzdeElement) tutarEksiYuzdeElement.textContent = formatTutar(sonuclar.tutarEksiYuzde);
        if (yuzdeOraniDegeriElement) yuzdeOraniDegeriElement.textContent = formatTutar(sonuclar.yuzdeOraniDegeri);
        
        // Dinamik etiketleri güncelle
        if (yuzdeArtiLabelElement) {
            yuzdeArtiLabelElement.textContent = yuzdeOrani > 0 ? `%${yuzdeOrani} fazlası` : 'Tutarın + Yüzdesi';
        }
        if (yuzdeEksiLabelElement) {
            yuzdeEksiLabelElement.textContent = yuzdeOrani > 0 ? `%${yuzdeOrani} eksiği` : 'Tutarın - Yüzdesi';
        }
        if (yuzdeOraniLabelElement) {
            yuzdeOraniLabelElement.textContent = yuzdeOrani > 0 ? `%${yuzdeOrani} Oranı` : 'Yüzde Oranı';
        }
        
        // Pay Oranı
        const payOraniSonucuElement = document.getElementById('payOraniSonucu');
        if (payOraniSonucuElement) {
            if (sonuclar.payOrani && sonuclar.payOrani > 0) {
                payOraniSonucuElement.textContent = `%${sonuclar.payOrani.toFixed(2)}`;
            } else {
                payOraniSonucuElement.textContent = '%0';
            }
        }
    }

    // Şablon Fonksiyonları
    loadSablonlar() {
        const savedSablonlar = this.loadData('sablonlar');
        if (savedSablonlar) {
            this.sablonlar = savedSablonlar;
        }
        this.updateSablonlarDisplay();
    }

    saveSablonlar() {
        this.saveData('sablonlar', this.sablonlar);
        // Dashboard'ı güncelle
        this.updateDashboardFavoriteTemplates();
    }

    updateSablonlarDisplay() {
        const tbody = document.querySelector('#sablonlar-list');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.sablonlar.forEach((sablon, index) => {
            const row = document.createElement('tr');
            
            // İçerik önizlemesi (ilk 50 karakter)
            const preview = sablon.content.length > 50 ? sablon.content.substring(0, 50) + '...' : sablon.content;
            
            const favoriteIcon = sablon.isFavorite ? 'bi-star-fill' : 'bi-star';
            const favoriteTitle = sablon.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
            
            // Parametre kontrolü yap (başlık ve içerik)
            const parameters = this.extractParameters(sablon.content, sablon.name);
            const hasParameters = parameters.length > 0;
            
            // E-posta butonu sadece parametre yoksa gösterilecek
            const emailButton = hasParameters ? '' : `
                <button class="btn btn-outline-info btn-sm" onclick="mimtranet.sendSablonDirectByEmail(${index})" title="E-Posta ile Gönder">
                    <i class="bi bi-envelope"></i>
                </button>`;
            
            row.innerHTML = `
                <td>${sablon.name}</td>
                <td>${preview}</td>
                <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-${sablon.isFavorite ? 'warning' : 'secondary'} btn-sm" onclick="mimtranet.toggleSablonFavorite(${index})" title="${favoriteTitle}">
                                <i class="bi ${favoriteIcon}"></i>
                            </button>${emailButton}
                            <button class="btn btn-outline-primary btn-sm" onclick="mimtranet.showSablonCopyModal(${index})" title="Kopyala">
                                <i class="bi bi-clipboard"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm" onclick="mimtranet.editSablon(${index})" title="Düzenle">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="mimtranet.deleteSablon(${index})" title="Sil">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
            `;
            
            // Satıra tıklama olayı ekle (kopyala fonksiyonunu çalıştır)
            row.style.cursor = 'pointer';
            row.addEventListener('click', (e) => {
                // Eğer butonlara tıklanmışsa, satır tıklama olayını çalıştırma
                if (e.target.closest('button')) {
                    return;
                }
                this.showSablonCopyModal(index);
            });
            
            tbody.appendChild(row);
        });
    }

    extractParameters(content, title = '', emailSubject = '') {
        const regex = /\/([a-zA-ZğüşıöçĞÜŞIÖÇ0-9_]+)/g;
        const parameters = [];
        let match;
        
        // İçerikten parametreleri çıkar
        while ((match = regex.exec(content)) !== null) {
            if (!parameters.includes(match[1])) {
                parameters.push(match[1]);
            }
        }
        
        // Başlıktan da parametreleri çıkar
        if (title) {
            regex.lastIndex = 0; // Regex'i sıfırla
            while ((match = regex.exec(title)) !== null) {
                if (!parameters.includes(match[1])) {
                    parameters.push(match[1]);
                }
            }
        }
        
        // E-posta konusundan da parametreleri çıkar
        if (emailSubject) {
            regex.lastIndex = 0; // Regex'i sıfırla
            while ((match = regex.exec(emailSubject)) !== null) {
                if (!parameters.includes(match[1])) {
                    parameters.push(match[1]);
                }
            }
        }
        
        return parameters;
    }

    showSablonAddModal() {
        this.clearSablonForm();
        this.updateHazirMetinlerDropdowns();
        const modal = new bootstrap.Modal(document.getElementById('sablonAddModal'));
        modal.show();
    }

    showSablonEditModal() {
        this.updateHazirMetinlerDropdowns();
        const modal = new bootstrap.Modal(document.getElementById('sablonEditModal'));
        modal.show();
    }

    showSablonCopyModal(index) {
        this.currentSablonForCopy = this.sablonlar[index];
        const modal = document.getElementById('sablonCopyModal');
        const parametersDiv = document.getElementById('sablonParameters');
        const previewDiv = document.getElementById('sablonPreview');
        
        // Parametreleri çıkar (sadece içerik ve e-posta şablonuysa e-posta konusu)
        const emailSubject = this.currentSablonForCopy.isEmailTemplate ? (this.currentSablonForCopy.emailSubject || '') : '';
        const parameters = this.extractParameters(this.currentSablonForCopy.content, '', emailSubject);
        
        // Eğer parametre yoksa direkt panoya kopyala
        if (parameters.length === 0) {
            this.copyToClipboard(this.currentSablonForCopy.content);
            this.currentSablonForCopy = null;
            return;
        }
        
        // Parametre input'larını oluştur
        parametersDiv.innerHTML = '';
        parameters.forEach(param => {
            // Parametrenin türünü bul
            const parametre = this.parametreler.find(p => p.adi === param);
            const inputType = parametre ? parametre.inputType || 'text' : 'text';
            
            const div = document.createElement('div');
            div.className = 'form-group mb-3';
            
            let inputElement = '';
            switch(inputType) {
                case 'date':
                    inputElement = `<input type="date" id="param_${param}" class="form-control">`;
                    break;
                case 'number':
                    inputElement = `<input type="number" id="param_${param}" class="form-control" placeholder="${param} değerini girin">`;
                    break;
                case 'email':
                    inputElement = `<input type="email" id="param_${param}" class="form-control" placeholder="${param} değerini girin">`;
                    break;
                default:
                    inputElement = `<input type="text" id="param_${param}" class="form-control" placeholder="${param} değerini girin">`;
            }
            
            div.innerHTML = `
                <label for="param_${param}" class="form-label">${param}:</label>
                ${inputElement}
            `;
            parametersDiv.appendChild(div);
        });
        
        // Önizlemeyi güncelle
        this.updateSablonPreview();
        
        // Input değişikliklerini dinle
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (input) {
                input.addEventListener('input', () => this.updateSablonPreview());
            }
        });
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    updateSablonPreview() {
        if (!this.currentSablonForCopy) return;
        
        const previewDiv = document.getElementById('sablonPreview');
        let content = this.currentSablonForCopy.content;
        
        // Parametreleri değiştir (sadece içerik ve e-posta şablonuysa e-posta konusu)
        const emailSubject = this.currentSablonForCopy.isEmailTemplate ? (this.currentSablonForCopy.emailSubject || '') : '';
        const parameters = this.extractParameters(content, '', emailSubject);
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (input && input.value.trim()) {
                let value = input.value.trim();
                
                // Tarih parametresi ise formatı gg/aa/yyyy'ye çevir
                const parametre = this.parametreler.find(p => p.adi === param);
                if (parametre && parametre.inputType === 'date' && input.type === 'date') {
                    // yyyy-mm-dd formatından gg/aa/yyyy formatına çevir
                    const dateParts = value.split('-');
                    if (dateParts.length === 3) {
                        const year = dateParts[0];
                        const month = dateParts[1];
                        const day = dateParts[2];
                        value = `${day}/${month}/${year}`;
                    }
                }
                
                const regex = new RegExp(`\/${param}`, 'g');
                content = content.replace(regex, value);
            }
        });
        
        previewDiv.textContent = content;
    }

    clearSablonForm() {
        document.getElementById('sablonName').value = '';
        document.getElementById('sablonContent').value = '';
        // E-posta alanlarını da temizle
        const emailCheckbox = document.getElementById('isEmailTemplate');
        const toField = document.getElementById('emailTo');
        const ccField = document.getElementById('emailCc');
        
        if (emailCheckbox) emailCheckbox.checked = false;
        if (toField) toField.value = '';
        if (ccField) ccField.value = '';
        
        // E-posta alanlarını gizle
        this.toggleEmailFields();
    }

    toggleEmailFields() {
        const checkbox = document.getElementById('isEmailTemplate');
        const emailFields = document.getElementById('emailFields');
        
        if (checkbox && emailFields) {
            if (checkbox.checked) {
                emailFields.style.display = 'block';
            } else {
                emailFields.style.display = 'none';
            }
        }
    }

    toggleEditEmailFields() {
        const checkbox = document.getElementById('editIsEmailTemplate');
        const emailFields = document.getElementById('editEmailFields');
        
        if (checkbox && emailFields) {
            if (checkbox.checked) {
                emailFields.style.display = 'block';
            } else {
                emailFields.style.display = 'none';
            }
        }
    }

    addSablon() {
        const name = document.getElementById('sablonName').value.trim();
        const content = document.getElementById('sablonContent').value.trim();
        
        if (!name || !content) {
            this.showNotification('Şablon adı ve içerik boş olamaz!', 'error');
            return;
        }
        
        // E-posta şablonu bilgilerini al
        const isEmailTemplate = document.getElementById('isEmailTemplate').checked;
        const emailTo = document.getElementById('emailTo').value.trim();
        const emailCc = document.getElementById('emailCc').value.trim();
        const emailSubject = document.getElementById('emailSubject').value.trim();
        
        const newSablon = {
            id: Date.now(),
            name: name,
            content: content,
            createdAt: new Date().toISOString(),
            isFavorite: false,
            isEmailTemplate: isEmailTemplate,
            emailTo: emailTo,
            emailCc: emailCc,
            emailSubject: emailSubject
        };
        
        this.sablonlar.push(newSablon);
        this.saveSablonlar();
        this.updateSablonlarDisplay();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('sablonAddModal'));
        if (modal) modal.hide();
        this.showNotification('Şablon başarıyla eklendi!', 'success');
    }

    editSablon(index) {
        this.editingSablonIndex = index;
        const sablon = this.sablonlar[index];
        
        document.getElementById('editSablonName').value = sablon.name;
        document.getElementById('editSablonContent').value = sablon.content;
        
        // E-posta şablonu alanlarını doldur
        const emailCheckbox = document.getElementById('editIsEmailTemplate');
        const emailToField = document.getElementById('editEmailTo');
        const emailCcField = document.getElementById('editEmailCc');
        const emailSubjectField = document.getElementById('editEmailSubject');
        
        if (emailCheckbox) {
            emailCheckbox.checked = sablon.isEmailTemplate || false;
            this.toggleEditEmailFields();
        }
        
        if (emailToField) {
            emailToField.value = sablon.emailTo || '';
        }
        
        if (emailCcField) {
            emailCcField.value = sablon.emailCc || '';
        }
        
        if (emailSubjectField) {
            emailSubjectField.value = sablon.emailSubject || '';
        }
        
        this.showSablonEditModal();
    }

    updateSablon() {
        if (this.editingSablonIndex === null) return;
        
        const name = document.getElementById('editSablonName').value.trim();
        const content = document.getElementById('editSablonContent').value.trim();
        
        if (!name || !content) {
            this.showNotification('Şablon adı ve içerik boş olamaz!', 'error');
            return;
        }
        
        // E-posta şablonu bilgilerini al
        const isEmailTemplate = document.getElementById('editIsEmailTemplate').checked;
        const emailTo = document.getElementById('editEmailTo').value.trim();
        const emailCc = document.getElementById('editEmailCc').value.trim();
        const emailSubject = document.getElementById('editEmailSubject').value.trim();
        
        this.sablonlar[this.editingSablonIndex].name = name;
        this.sablonlar[this.editingSablonIndex].content = content;
        this.sablonlar[this.editingSablonIndex].updatedAt = new Date().toISOString();
        this.sablonlar[this.editingSablonIndex].isEmailTemplate = isEmailTemplate;
        this.sablonlar[this.editingSablonIndex].emailTo = emailTo;
        this.sablonlar[this.editingSablonIndex].emailCc = emailCc;
        this.sablonlar[this.editingSablonIndex].emailSubject = emailSubject;
        
        this.saveSablonlar();
        this.updateSablonlarDisplay();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('sablonEditModal'));
        if (modal) modal.hide();
        this.editingSablonIndex = null;
        this.showNotification('Şablon başarıyla güncellendi!', 'success');
    }

    deleteSablon(index) {
        if (confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
            this.sablonlar.splice(index, 1);
            this.saveSablonlar();
            this.updateSablonlarDisplay();
            this.showNotification('Şablon başarıyla silindi!', 'success');
        }
    }

    toggleSablonFavorite(index) {
        this.sablonlar[index].isFavorite = !this.sablonlar[index].isFavorite;
        this.saveSablonlar();
        this.updateSablonlarDisplay();
        
        const message = this.sablonlar[index].isFavorite ? 
            'Şablon favorilere eklendi!' : 'Şablon favorilerden çıkarıldı!';
        this.showNotification(message, 'success');
    }

    copySablonToClipboard() {
        if (!this.currentSablonForCopy) return;
        
        let content = this.currentSablonForCopy.content;
        const emailSubject = this.currentSablonForCopy.isEmailTemplate ? (this.currentSablonForCopy.emailSubject || '') : '';
        const parameters = this.extractParameters(content, '', emailSubject);
        
        // Tüm parametrelerin doldurulup doldurulmadığını kontrol et
        let allFilled = true;
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (!input || !input.value.trim()) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            this.showNotification('Lütfen tüm parametreleri doldurun!', 'error');
            return;
        }
        
        // E-posta konusunu belirle: E-posta şablonuysa emailSubject, değilse name kullan
        let subject = this.currentSablonForCopy.isEmailTemplate && this.currentSablonForCopy.emailSubject 
            ? this.currentSablonForCopy.emailSubject 
            : this.currentSablonForCopy.name;
        
        // Parametreleri değiştir (hem içerik hem başlık)
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (input && input.value.trim()) {
                let value = input.value.trim();
                
                // Tarih parametresi ise formatı gg/aa/yyyy'ye çevir
                const parametre = this.parametreler.find(p => p.adi === param);
                if (parametre && parametre.inputType === 'date' && input.type === 'date') {
                    // yyyy-mm-dd formatından gg/aa/yyyy formatına çevir
                    const dateParts = value.split('-');
                    if (dateParts.length === 3) {
                        const year = dateParts[0];
                        const month = dateParts[1];
                        const day = dateParts[2];
                        value = `${day}/${month}/${year}`;
                    }
                }
                
                const regex = new RegExp(`\/${param}`, 'g');
                content = content.replace(regex, value);
                subject = subject.replace(regex, value);
            }
        });
        
        // Panoya kopyala
        this.copyToClipboard(content);
        const modal = bootstrap.Modal.getInstance(document.getElementById('sablonCopyModal'));
        if (modal) modal.hide();
        this.currentSablonForCopy = null;
    }

    sendSablonByEmail() {
        if (!this.currentSablonForCopy) return;
        
        let content = this.currentSablonForCopy.content;
        const emailSubject = this.currentSablonForCopy.isEmailTemplate ? (this.currentSablonForCopy.emailSubject || '') : '';
        const parameters = this.extractParameters(content, '', emailSubject);
        
        // Tüm parametrelerin doldurulup doldurulmadığını kontrol et
        let allFilled = true;
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (!input || !input.value.trim()) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            this.showNotification('Lütfen tüm parametreleri doldurun!', 'error');
            return;
        }
        
        // E-posta şablonu ise E-Posta Konusu'nu, değilse şablon adını kullan
        let subject = this.currentSablonForCopy.isEmailTemplate && this.currentSablonForCopy.emailSubject 
            ? this.currentSablonForCopy.emailSubject 
            : this.currentSablonForCopy.name;
        
        // Parametreleri değiştir (içerik, başlık ve e-posta konusu)
        parameters.forEach(param => {
            const input = document.getElementById(`param_${param}`);
            if (input && input.value.trim()) {
                let value = input.value.trim();
                
                // Tarih parametresi ise formatı gg/aa/yyyy'ye çevir
                const parametre = this.parametreler.find(p => p.adi === param);
                if (parametre && parametre.inputType === 'date' && input.type === 'date') {
                    // yyyy-mm-dd formatından gg/aa/yyyy formatına çevir
                    const dateParts = value.split('-');
                    if (dateParts.length === 3) {
                        const year = dateParts[0];
                        const month = dateParts[1];
                        const day = dateParts[2];
                        value = `${day}/${month}/${year}`;
                    }
                }
                
                const regex = new RegExp(`\/${param}`, 'g');
                content = content.replace(regex, value);
                subject = subject.replace(regex, value);
            }
        });
        
        // HTML'i temiz metne çevir
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // E-posta şablonu bilgilerini kullan
        const encodedSubject = encodeURIComponent(subject);
        const body = encodeURIComponent(textContent);
        
        let mailtoUrl = `mailto:`;
        
        // To alanını ekle
        if (this.currentSablonForCopy.emailTo) {
            mailtoUrl += this.currentSablonForCopy.emailTo;
        }
        
        // Subject ve body parametrelerini ekle
        const params = [];
        params.push(`subject=${encodedSubject}`);
        params.push(`body=${body}`);
        
        // Cc alanını ekle
        if (this.currentSablonForCopy.emailCc) {
            params.push(`cc=${encodeURIComponent(this.currentSablonForCopy.emailCc)}`);
        }
        
        if (params.length > 0) {
            mailtoUrl += '?' + params.join('&');
        }
        
        // Outlook'u aç
        try {
            window.open(mailtoUrl, '_self');
            this.showNotification('E-posta uygulaması açılıyor...', 'success');
            
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('sablonCopyModal'));
            if (modal) modal.hide();
            this.currentSablonForCopy = null;
        } catch (error) {
            this.showNotification('E-posta uygulaması açılamadı!', 'error');
        }
    }

    sendSablonDirectByEmail(index) {
        // Şablon kontrolü
        if (!this.sablonlar[index]) {
            this.showNotification('Şablon bulunamadı!', 'error');
            return;
        }

        const sablon = this.sablonlar[index];
        
        // Parametre kontrolü - parametre varsa bu fonksiyon çalışmamalı (sadece içerik ve e-posta şablonuysa e-posta konusu)
        const emailSubject = sablon.isEmailTemplate ? (sablon.emailSubject || '') : '';
        const parameters = this.extractParameters(sablon.content, '', emailSubject);
        if (parameters.length > 0) {
            this.showNotification('Bu şablonda parametre bulunuyor! Lütfen normal kopyala işlemini kullanın.', 'warning');
            return;
        }

        // HTML içeriği varsa düz metne çevir
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sablon.content;
        const plainTextContent = tempDiv.textContent || tempDiv.innerText || '';

        // E-posta konusunu belirle: E-posta şablonuysa emailSubject, değilse name kullan
        const subjectText = sablon.isEmailTemplate && sablon.emailSubject 
            ? sablon.emailSubject 
            : sablon.name;
        const subject = encodeURIComponent(subjectText);
        const body = encodeURIComponent(plainTextContent);

        // E-posta şablonu bilgilerini kullan
        let mailtoUrl = `mailto:`;
        
        // To alanını ekle
        if (sablon.emailTo) {
            mailtoUrl += sablon.emailTo;
        }
        
        // Subject ve body parametrelerini ekle
        const params = [];
        params.push(`subject=${subject}`);
        params.push(`body=${body}`);
        
        // Cc alanını ekle
        if (sablon.emailCc) {
            params.push(`cc=${encodeURIComponent(sablon.emailCc)}`);
        }
        
        if (params.length > 0) {
            mailtoUrl += '?' + params.join('&');
        }

        try {
            // E-posta istemcisini aç
            window.open(mailtoUrl, '_self');
            this.showNotification('E-posta uygulaması açılıyor...', 'success');
        } catch (error) {
            console.error('E-posta gönderme hatası:', error);
            this.showNotification('E-posta uygulaması açılamadı!', 'error');
        }
    }

    setupSablonlarSearch() {
        const searchInput = document.getElementById('sablonArama');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSablonlar(e.target.value);
            });
        }
    }

    filterSablonlar(searchTerm) {
        if (!searchTerm.trim()) {
            this.updateSablonlarDisplay();
            return;
        }
        
        const filteredSablonlar = this.sablonlar.filter(sablon => 
            sablon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sablon.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.updateSablonlarDisplayFiltered(filteredSablonlar);
    }

    // Import fonksiyonları
    importAllData(file) {
        if (!file) {
            const input = document.getElementById('importAllDataInput');
            if (input) {
                input.click();
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                
                if (!importData.version || importData.version !== '2.0') {
                    this.showNotification('Geçersiz veya eski dosya formatı', 'error');
                    return;
                }

                let importedCount = 0;
                
                // Notları içe aktar
                if (importData.notes && Array.isArray(importData.notes)) {
                    const existingNoteIds = new Set(this.notes.map(note => note.id));
                    const newNotes = importData.notes.filter(note => 
                        note.title && note.content && note.id && !existingNoteIds.has(note.id)
                    );
                    this.notes.push(...newNotes);
                    this.saveNotes();
                    importedCount += newNotes.length;
                }

                // Teklifleri içe aktar
                if (importData.teklifler && Array.isArray(importData.teklifler)) {
                    const existingTeklifIds = new Set(this.teklifler.map(t => t.id));
                    const newTeklifler = importData.teklifler.filter(teklif => 
                        teklif.id && !existingTeklifIds.has(teklif.id)
                    );
                    this.teklifler.push(...newTeklifler);
                    this.saveTeklifler();
                    importedCount += newTeklifler.length;
                }

                // Excel dosyalarını içe aktar
                if (importData.excelFiles && Array.isArray(importData.excelFiles)) {
                    const existingExcelIds = new Set(this.excelFiles.map(f => f.id));
                    const newExcelFiles = importData.excelFiles.filter(file => 
                        file.id && file.title && file.data && !existingExcelIds.has(file.id)
                    );
                    this.excelFiles.push(...newExcelFiles);
                    this.saveExcelFiles();
                    importedCount += newExcelFiles.length;
                }

                // Evrakları içe aktar
                if (importData.evraklar && Array.isArray(importData.evraklar) && evrakManager) {
                    const existingEvraklar = evrakManager.loadEvraklar();
                    const existingEvrakNames = new Set(existingEvraklar.map(e => e.ad?.toLowerCase().trim()));
                    const newEvraklar = importData.evraklar.filter(evrak => {
                        // Temel alan kontrolleri
                        if (!evrak.ad || !evrak.ad.trim()) {
                            console.warn('Adı olmayan evrak atlandı:', evrak);
                            return false;
                        }
                        // Çakışma kontrolü
                        const evrakName = evrak.ad.toLowerCase().trim();
                        return !existingEvrakNames.has(evrakName);
                    });
                    
                    if (newEvraklar.length > 0) {
                        existingEvraklar.push(...newEvraklar);
                        evrakManager.evraklar = existingEvraklar;
                        evrakManager.saveEvraklar();
                        evrakManager.renderList();
                        importedCount += newEvraklar.length;
                    }
                }

                // Şablonları içe aktar
                if (importData.sablonlar && Array.isArray(importData.sablonlar)) {
                    const existingSablonNames = new Set(this.sablonlar.map(s => s.name));
                    const newSablonlar = importData.sablonlar.filter(sablon => 
                        sablon.name && sablon.content && !existingSablonNames.has(sablon.name)
                    );
                    this.sablonlar.push(...newSablonlar);
                    this.saveSablonlar();
                    importedCount += newSablonlar.length;
                }

                // Parametreleri içe aktar
                console.log('İçe aktarılan veri:', importData.parametreler);
                console.log('Mevcut parametreler:', this.parametreler);
                if (importData.parametreler && Array.isArray(importData.parametreler)) {
                    const existingParametreNames = new Set(this.parametreler.map(p => p.adi));
                    const newParametreler = importData.parametreler.filter(parametre => 
                        parametre.adi && parametre.id && !existingParametreNames.has(parametre.adi)
                    );
                    console.log('Yeni parametreler:', newParametreler);
                    this.parametreler.push(...newParametreler);
                    this.saveParametreler();
                    importedCount += newParametreler.length;
                }

                // Hazır metinleri içe aktar
                if (importData.hazirMetinler && Array.isArray(importData.hazirMetinler)) {
                    const existingHazirMetinIds = new Set(this.hazirMetinler.map(h => h.id));
                    const newHazirMetinler = importData.hazirMetinler.filter(metin => 
                        metin.id && metin.icerik && !existingHazirMetinIds.has(metin.id)
                    );
                    this.hazirMetinler.push(...newHazirMetinler);
                    this.saveHazirMetinler();
                    importedCount += newHazirMetinler.length;
                }

                // Görünümleri güncelle
                this.updateNotesDisplay();
                this.updateTekliflerTable();
                this.updateExcelFilesDisplay();
                if (evrakManager) {
                    evrakManager.renderList();
                }
                this.updateSablonlarDisplay();
                this.updateParametreButtons();
                this.updateHazirMetinlerDisplay();
                this.updateHazirMetinlerDropdowns();
                this.updateDashboardStats();

                this.showNotification(`${importedCount} öğe başarıyla içe aktarıldı`, 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Dosya okuma hatası: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }







    updateSablonlarDisplayFiltered(sablonlarToDisplay) {
        const tbody = document.getElementById('sablonlar-list');
        if (!tbody) return;

        tbody.innerHTML = '';

        sablonlarToDisplay.forEach((sablon, originalIndex) => {
            const index = this.sablonlar.indexOf(sablon);
            const row = document.createElement('tr');
            
            // İçerik önizlemesi (ilk 50 karakter)
            const preview = sablon.content.length > 50 ? sablon.content.substring(0, 50) + '...' : sablon.content;
            
            const favoriteIcon = sablon.isFavorite ? 'bi-star-fill' : 'bi-star';
            const favoriteTitle = sablon.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
            
            // Parametre kontrolü yap (başlık ve içerik)
            const parameters = this.extractParameters(sablon.content, sablon.name);
            const hasParameters = parameters.length > 0;
            
            // E-posta butonu sadece parametre yoksa gösterilecek
            const emailButton = hasParameters ? '' : `
                <button class="btn btn-outline-info btn-sm" onclick="mimtranet.sendSablonDirectByEmail(${index})" title="E-Posta ile Gönder">
                    <i class="bi bi-envelope"></i>
                </button>`;
            
            row.innerHTML = `
                <td>${sablon.name}</td>
                <td>${preview}</td>
                <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-${sablon.isFavorite ? 'warning' : 'secondary'} btn-sm" onclick="mimtranet.toggleSablonFavorite(${index})" title="${favoriteTitle}">
                                <i class="bi ${favoriteIcon}"></i>
                            </button>${emailButton}
                            <button class="btn btn-outline-primary btn-sm" onclick="mimtranet.showSablonCopyModal(${index})" title="Kopyala">
                                <i class="bi bi-clipboard"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm" onclick="mimtranet.editSablon(${index})" title="Düzenle">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="mimtranet.deleteSablon(${index})" title="Sil">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
            `;
            
            // Satıra tıklama olayı ekle (kopyala fonksiyonunu çalıştır)
            row.style.cursor = 'pointer';
            row.addEventListener('click', (e) => {
                // Eğer butonlara tıklanmışsa, satır tıklama olayını çalıştırma
                if (e.target.closest('button')) {
                    return;
                }
                this.showSablonCopyModal(index);
            });
            
            tbody.appendChild(row);
        });
    }


}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mimtranet = new MIMTranet();
    
    // Gizli dosya input elementleri için event listener'ları ekle
    const importAllDataInput = document.getElementById('importAllDataInput');
    const importNotesInput = document.getElementById('importNotesInput');
    const importEvraklarInput = document.getElementById('importEvraklarInput');
    const importSablonlarInput = document.getElementById('importSablonlarInput');
    const importParametrelerInput = document.getElementById('importParametrelerInput');
    
    if (importAllDataInput) {
        importAllDataInput.addEventListener('change', (e) => {
            window.mimtranet.importAllData(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
    
    if (importNotesInput) {
        importNotesInput.addEventListener('change', (e) => {
            window.mimtranet.importNotes(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
    
    if (importEvraklarInput) {
        importEvraklarInput.addEventListener('change', (e) => {
            window.mimtranet.importEvraklar(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
    
    if (importSablonlarInput) {
        importSablonlarInput.addEventListener('change', (e) => {
            window.mimtranet.importSablonlar(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
    
    if (importParametrelerInput) {
        importParametrelerInput.addEventListener('change', (e) => {
            window.mimtranet.importParametreler(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
    
    const importHazirMetinlerInput = document.getElementById('importHazirMetinlerInput');
    if (importHazirMetinlerInput) {
        importHazirMetinlerInput.addEventListener('change', (e) => {
            window.mimtranet.importHazirMetinler(e.target.files[0]);
            e.target.value = ''; // Reset input
        });
    }
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        content.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Load dark mode preference
    if (localStorage.getItem('mimtranet_darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Load stats section preference
    const showStats = localStorage.getItem('mimtranet_showStats');
    if (showStats === 'false') {
        const statsFooter = document.getElementById('stats-footer');
        if (statsFooter) {
            statsFooter.style.display = 'none';
        }
    }
    
    // Settings button event listener
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            if (window.mimtranet) {
                window.mimtranet.navigateToPage('settings');
            }
        });
    }
});

// Evraklar özelliği
class EvrakManager {
    constructor() {
        this.evraklar = this.loadEvraklar();
        this.setupEvents();
        this.renderList();
    }
    setupEvents() {
        const btn = document.getElementById('evrakEkleBtn');
        if (btn) btn.onclick = () => new bootstrap.Modal(document.getElementById('evrakEkleModal')).show();
        const kaydetBtn = document.getElementById('evrakKaydetBtn');
        if (kaydetBtn) kaydetBtn.onclick = () => this.saveEvrak();
        const guncelleBtn = document.getElementById('evrakGuncelleBtn');
        if (guncelleBtn) guncelleBtn.onclick = () => this.updateEvrak();
    }
    loadEvraklar() {
        try {
            return JSON.parse(localStorage.getItem('mimtranet_evraklar') || '[]');
        } catch { return []; }
    }
    saveEvraklar() {
        localStorage.setItem('mimtranet_evraklar', JSON.stringify(this.evraklar));
    }
    saveEvrak() {
        const dosyaAdi = document.getElementById('evrakDosyaAdi').value.trim();
        const dosyaInput = document.getElementById('evrakDosya');
        const icerik = document.getElementById('evrakIcerik').value.trim();
        const durumDiv = document.getElementById('evrakKayitDurum');
        if (!dosyaAdi || !dosyaInput.files.length) return alert('Dosya adı ve dosya seçimi zorunlu!');
        // Toplam dosya boyutu kontrolü (4MB = 4*1024*1024)
        let toplamBoyut = Array.from(dosyaInput.files).reduce((acc, f) => acc + f.size, 0);
        if (toplamBoyut > 4*1024*1024) {
            alert('Toplam dosya boyutu 4MB\'dan büyük! Daha küçük dosyalar seçin.');
            return;
        }
        durumDiv.style.display = 'block';
        let files = [];
        let filesProcessed = 0;
        Array.from(dosyaInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                files.push({
                    dosya: file.name,
                    tip: file.type,
                    boyut: file.size,
                    base64: e.target.result
                });
                filesProcessed++;
                if (filesProcessed === dosyaInput.files.length) {
                    this.evraklar.push({
                        ad: dosyaAdi,
                        dosyalar: files,
                        icerik
                    });
                    this.saveEvraklar();
                    this.renderList();
                    // Dashboard'ı güncelle
                    if (window.mimtranet) {
                        window.mimtranet.updateDashboardStats();
                        window.mimtranet.updateDashboardFavoriteEvraklar();
                    }
                    document.getElementById('evrakEkleForm').reset();
                    durumDiv.style.display = 'none';
                    bootstrap.Modal.getInstance(document.getElementById('evrakEkleModal')).hide();
                }
            };
            reader.readAsDataURL(file);
        });
    }
    renderList(evraklar = null) {
        const tbody = document.querySelector('#evraklar-listesi tbody');
        if (!tbody) return;
        const data = evraklar || this.evraklar;
        let html = '';
        data.forEach((evrak, idx) => {
            html += `
                <tr>
                    <td>${evrak.ad}</td>
                    <td>${evrak.icerik || ''}</td>
                    <td>
                        ${(evrak.dosyalar||[]).map((d,di) => `
                            <span style="display:inline-block;margin-right:8px;">
                                <a href="#" onclick="evrakManager.openEvrak(${idx},${di});return false;" title="Aç/İndir">
                                    <i class="bi bi-paperclip"></i> ${d.dosya}
                                </a>
                            </span>
                        `).join('')}
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-warning btn-sm" title="${evrak.favori ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}" onclick="evrakManager.toggleEvrakFavorite(${idx})">
                                <i class="bi ${evrak.favori ? 'bi-star-fill' : 'bi-star'}"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm" title="Düzenle" onclick="evrakManager.editEvrak(${idx})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-outline-danger btn-sm" title="Sil" onclick="evrakManager.deleteEvrak(${idx})"><i class="bi bi-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
    openEvrak(evIdx, dosyaIdx) {
        const evrak = this.evraklar[evIdx];
        if (!evrak || !evrak.dosyalar || !evrak.dosyalar[dosyaIdx]) return alert('Dosya bulunamadı!');
        const d = evrak.dosyalar[dosyaIdx];
        // İndirilebilir link oluştur
        const a = document.createElement('a');
        a.href = d.base64;
        a.download = d.dosya;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    editEvrak(idx) {
        const evrak = this.evraklar[idx];
        document.getElementById('duzenleIndex').value = idx;
        document.getElementById('duzenleDosyaAdi').value = evrak.ad;
        document.getElementById('duzenleIcerik').value = evrak.icerik;
        document.getElementById('duzenleDosya').value = '';
        // Dosya listesi
        this._duzenleDosyaList = (evrak.dosyalar || []).map(d => ({...d}));
        this.renderDuzenleDosyaListesi();
        new bootstrap.Modal(document.getElementById('evrakDuzenleModal')).show();
    }
    renderDuzenleDosyaListesi() {
        const listDiv = document.getElementById('duzenleDosyaListesi');
        if (!listDiv) return;
        listDiv.innerHTML = this._duzenleDosyaList.map((d, i) =>
            `<span class='duzenle-dosya-etiket'>${d.dosya}<span class='duzenle-dosya-x' onclick='evrakManager.removeDuzenleDosya(${i})' title='Sil'>&times;</span></span>`
        ).join('');
    }
    removeDuzenleDosya(i) {
        this._duzenleDosyaList.splice(i, 1);
        this.renderDuzenleDosyaListesi();
    }
    updateEvrak() {
        const idx = parseInt(document.getElementById('duzenleIndex').value);
        if (isNaN(idx)) return;
        this.evraklar[idx].ad = document.getElementById('duzenleDosyaAdi').value.trim();
        this.evraklar[idx].icerik = document.getElementById('duzenleIcerik').value.trim();
        const dosyaInput = document.getElementById('duzenleDosya');
        if (dosyaInput.files.length) {
            let filesProcessed = 0;
            let newFiles = [];
            Array.from(dosyaInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newFiles.push({
                        dosya: file.name,
                        tip: file.type,
                        boyut: file.size,
                        base64: e.target.result
                    });
                    filesProcessed++;
                    if (filesProcessed === dosyaInput.files.length) {
                        // Mevcut listeden silinmeyenler + yeni eklenenler
                        this.evraklar[idx].dosyalar = (this._duzenleDosyaList || []).concat(newFiles);
                        this.saveEvraklar();
                        this.renderList();
                        bootstrap.Modal.getInstance(document.getElementById('evrakDuzenleModal')).hide();
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            this.evraklar[idx].dosyalar = (this._duzenleDosyaList || []);
            this.saveEvraklar();
            this.renderList();
            // Dashboard'ı güncelle
            if (window.mimtranet) {
                window.mimtranet.updateDashboardStats();
                window.mimtranet.updateDashboardFavoriteEvraklar();
            }
            bootstrap.Modal.getInstance(document.getElementById('evrakDuzenleModal')).hide();
        }
    }
    
    deleteEvrak(idx) {
        if (!confirm('Bu evrakı silmek istiyor musunuz?')) return;
        this.evraklar.splice(idx, 1);
        this.saveEvraklar();
        this.renderList();
        // Dashboard'ı güncelle
        if (window.mimtranet) {
            window.mimtranet.updateDashboardStats();
            window.mimtranet.updateDashboardFavoriteEvraklar();
        }
    }
    toggleEvrakFavorite(idx) {
        console.log('toggleEvrakFavorite çağrıldı, idx:', idx);
        console.log('Önceki favori durumu:', this.evraklar[idx].favori);
        this.evraklar[idx].favori = !this.evraklar[idx].favori;
        console.log('Yeni favori durumu:', this.evraklar[idx].favori);
        this.saveEvraklar();
        this.renderList();
        // Dashboard'ı güncelle
        if (window.mimtranet) {
            console.log('Dashboard güncelleniyor...');
            window.mimtranet.updateDashboardStats();
            window.mimtranet.updateDashboardFavoriteEvraklar();
        } else {
            console.log('window.mimtranet bulunamadı!');
        }
    }
    filterEvraklar() {
        const aramaMetni = document.getElementById('evrakArama').value.toLowerCase().trim();
        let filtreli = this.evraklar;
        if (aramaMetni) {
            filtreli = this.evraklar.filter(evrak =>
                (evrak.ad && evrak.ad.toLowerCase().includes(aramaMetni)) ||
                (evrak.icerik && evrak.icerik.toLowerCase().includes(aramaMetni))
            );
        }
        this.renderList(filtreli);
    }
}

let evrakManager;
document.addEventListener('DOMContentLoaded', function() {
    // EvrakManager'ı her zaman oluştur (dashboard için gerekli)
    evrakManager = new EvrakManager();
    window.evrakManager = evrakManager; // Global erişim için
    
    // Menü görünürlük ayarlarını yükle
    loadMenuVisibilitySettings();
});

// Menü Görünürlük Ayarları Fonksiyonları
window.applyMenuVisibilitySettings = function() {
    const menuItems = {
        'dashboard': document.getElementById('menuDashboard').checked,
        'notes': document.getElementById('menuNotes').checked,
        'sablonlar': document.getElementById('menuSablonlar').checked,
        'evraklar': document.getElementById('menuEvraklar').checked,
        'teklifler': document.getElementById('menuTeklifler').checked,
        'araclar': document.getElementById('menuAraclar').checked
    };
    
    // Ayarları localStorage'a kaydet
    localStorage.setItem('mimtranet_menuVisibilitySettings', JSON.stringify(menuItems));
    
    // Menü öğelerini göster/gizle
    updateMenuVisibility(menuItems);
    
    // Başarı mesajı göster
    showNotification('Menü görünürlük ayarları başarıyla uygulandı!', 'success');
};

window.resetMenuVisibilitySettings = function() {
    // Tüm checkbox'ları işaretle
    document.getElementById('menuDashboard').checked = true;
    document.getElementById('menuNotes').checked = true;
    document.getElementById('menuSablonlar').checked = true;
    document.getElementById('menuEvraklar').checked = true;
    document.getElementById('menuTeklifler').checked = true;
    document.getElementById('menuAraclar').checked = true;
    
    // Ayarları uygula
    applyMenuVisibilitySettings();
};

function loadMenuVisibilitySettings() {
    const savedSettings = localStorage.getItem('mimtranet_menuVisibilitySettings');
    
    if (savedSettings) {
        const menuItems = JSON.parse(savedSettings);
        
        // Checkbox'ları güncelle
        document.getElementById('menuDashboard').checked = menuItems.dashboard !== false;
        document.getElementById('menuNotes').checked = menuItems.notes !== false;
        document.getElementById('menuSablonlar').checked = menuItems.sablonlar !== false;
        document.getElementById('menuEvraklar').checked = menuItems.evraklar !== false;
        document.getElementById('menuTeklifler').checked = menuItems.teklifler !== false;
        document.getElementById('menuAraclar').checked = menuItems.araclar !== false;
        
        // Menü görünürlüğünü uygula
        updateMenuVisibility(menuItems);
    }
}

function updateMenuVisibility(menuItems) {
    // Menü öğelerini ID'leri kullanarak göster/gizle
    const menuMapping = {
        'dashboard': 'menu-dashboard',
        'notes': 'menu-notes',
        'sablonlar': 'menu-sablonlar',
        'evraklar': 'menu-evraklar',
        'teklifler': 'menu-teklifler',
        'araclar': 'menu-araclar'
    };
    
    Object.keys(menuItems).forEach(page => {
        const menuId = menuMapping[page];
        const menuElement = document.getElementById(menuId);
        if (menuElement) {
            menuElement.style.display = menuItems[page] ? 'block' : 'none';
        }
    });
}

// Global showNotification fonksiyonu kaldırıldı - class içindeki kullanılıyor

// Global acil durum temizleme fonksiyonu
window.emergencyCleanup = function() {
    if (window.mimtranet) {
        window.mimtranet.emergencyCleanup();
    } else {
        console.log('Mimtranet not available, manual cleanup...');
        // Manuel temizleme
        const onboardingOverlay = document.getElementById('onboardingOverlay');
        if (onboardingOverlay) {
            onboardingOverlay.style.display = 'none';
        }
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        });
        
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        const settingsPanel = document.getElementById('settings-panel');
        const settingsOverlay = document.getElementById('settings-panel-overlay');
        if (settingsPanel) settingsPanel.classList.remove('active');
        if (settingsOverlay) settingsOverlay.classList.remove('active');
    }
};