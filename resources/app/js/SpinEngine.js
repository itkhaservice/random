class SpinEngine {
    constructor(options = {}) {
        this.digitCount = options.digitCount || 3;
        this.minSpinValue = options.minSpinValue || 0;
        this.maxSpinValue = options.maxSpinValue || 999;
        this.allowDuplicates = options.allowDuplicates || false;
        this.stopInterval = options.stopInterval || 1200;
        this.resultDisplayTime = options.resultDisplayTime || 5;
        
        this.isSpinning = false;
        this.spinningInterval = null;
        
        // Callbacks
        this.onDigitChange = options.onDigitChange || (() => {});
        this.onDigitStop = options.onDigitStop || (() => {});
        this.onSpinStart = options.onSpinStart || (() => {});
        this.onSpinStop = options.onSpinStop || (() => {});
        this.onSpinFinalized = options.onSpinFinalized || (() => {});
    }

    updateConfig(config) {
        if (config.digitCount !== undefined) this.digitCount = config.digitCount;
        if (config.stopInterval !== undefined) this.stopInterval = config.stopInterval;
        if (config.resultDisplayTime !== undefined) this.resultDisplayTime = config.resultDisplayTime;
        if (config.minSpinValue !== undefined) this.minSpinValue = config.minSpinValue;
        if (config.maxSpinValue !== undefined) this.maxSpinValue = config.maxSpinValue;
        if (config.allowDuplicates !== undefined) this.allowDuplicates = config.allowDuplicates;
    }

    generateLuckyNumber(existingNumbers = []) {
        let luckyNumber;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            luckyNumber = Math.floor(Math.random() * (this.maxSpinValue - this.minSpinValue + 1)) + this.minSpinValue;
            attempts++;
            if (this.allowDuplicates) break;
            if (!existingNumbers.includes(luckyNumber.toString().padStart(this.digitCount, '0'))) break;
        } while (attempts < maxAttempts);

        return luckyNumber.toString().padStart(this.digitCount, '0');
    }

    startSpinning() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.onSpinStart();

        let lastUpdateTime = 0;
        const update = (timestamp) => {
            if (!this.isSpinning) return;

            // Cập nhật số mỗi 50ms (~20fps) để giữ cảm giác quay casino
            if (timestamp - lastUpdateTime > 50) {
                for (let i = 1; i <= this.digitCount; i++) {
                    const randomDigit = Math.floor(Math.random() * 10);
                    this.onDigitChange(i, randomDigit);
                }
                lastUpdateTime = timestamp;
            }
            this.spinningInterval = requestAnimationFrame(update);
        };
        this.spinningInterval = requestAnimationFrame(update);
    }

    stopSpinning(existingNumbers = []) {
        if (!this.isSpinning) return;
        
        this.isSpinning = false;
        cancelAnimationFrame(this.spinningInterval);
        this.onSpinStop();

        const luckyString = this.generateLuckyNumber(existingNumbers);
        this.stopDigitsSequentially(luckyString);
    }

    stopDigitsSequentially(luckyString) {
        for (let i = 0; i < this.digitCount; i++) {
            let lastUpdate = 0;
            let digitInterval;
            
            const updateDigit = (timestamp) => {
                if (timestamp - lastUpdate > 50) {
                    const randomDigit = Math.floor(Math.random() * 10);
                    this.onDigitChange(i + 1, randomDigit);
                    lastUpdate = timestamp;
                }
                digitInterval = requestAnimationFrame(updateDigit);
            };
            digitInterval = requestAnimationFrame(updateDigit);

            const stopDelay = (i + 1) * this.stopInterval + (i * i * 200);

            setTimeout(() => {
                cancelAnimationFrame(digitInterval);
                const finalDigit = luckyString[i];
                this.onDigitChange(i + 1, finalDigit);
                this.onDigitStop(i + 1, finalDigit, i === this.digitCount - 1);
                
                if (i === this.digitCount - 1) {
                    this.onSpinFinalized(luckyString);
                }
            }, stopDelay);
        }
    }
}
