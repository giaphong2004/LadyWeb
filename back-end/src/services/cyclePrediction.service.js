// services/cyclePrediction.service.js
/**
 * Intelligent Cycle Prediction Service
 * Uses adaptive learning from user data instead of fixed formulas
 */

const { Op } = require('sequelize');

class CyclePredictionService {
    constructor() {
        // Minimum cycles needed for personalized predictions
        this.MIN_CYCLES_FOR_PREDICTION = 3;
        // Default values (used only when insufficient data)
        this.DEFAULT_CYCLE_LENGTH = 28;
        this.DEFAULT_PERIOD_LENGTH = 5;
        this.DEFAULT_LUTEAL_PHASE = 14;
    }

    /**
     * Calculate weighted average with more recent cycles having higher weight
     * @param {Array} values - Array of values (most recent first)
     * @param {number} decayFactor - How much weight decreases per cycle (0.1-0.3)
     */
    weightedAverage(values, decayFactor = 0.15) {
        if (!values || values.length === 0) return null;
        if (values.length === 1) return values[0];

        let weightedSum = 0;
        let weightSum = 0;

        values.forEach((value, index) => {
            // More recent cycles get higher weight
            const weight = Math.exp(-decayFactor * index);
            weightedSum += value * weight;
            weightSum += weight;
        });

        return weightedSum / weightSum;
    }

    /**
     * Calculate standard deviation for prediction confidence
     */
    calculateStdDev(values) {
        if (!values || values.length < 2) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Analyze cycle patterns and detect trends
     * @param {Array} cycles - Array of cycle history (most recent first)
     */
    analyzeCyclePatterns(cycles) {
        if (!cycles || cycles.length < this.MIN_CYCLES_FOR_PREDICTION) {
            return {
                hasEnoughData: false,
                avgCycleLength: this.DEFAULT_CYCLE_LENGTH,
                avgPeriodLength: this.DEFAULT_PERIOD_LENGTH,
                avgLutealPhase: this.DEFAULT_LUTEAL_PHASE,
                cycleRegularity: 'unknown',
                trend: 'unknown',
                confidence: 0.3
            };
        }

        const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
        const periodLengths = cycles.filter(c => c.period_length).map(c => c.period_length);
        const lutealPhases = cycles.filter(c => c.luteal_phase_length).map(c => c.luteal_phase_length);

        // Calculate weighted averages
        const avgCycleLength = this.weightedAverage(cycleLengths) || this.DEFAULT_CYCLE_LENGTH;
        const avgPeriodLength = this.weightedAverage(periodLengths) || this.DEFAULT_PERIOD_LENGTH;
        const avgLutealPhase = this.weightedAverage(lutealPhases) || this.DEFAULT_LUTEAL_PHASE;

        // Calculate variability
        const cycleStdDev = this.calculateStdDev(cycleLengths);
        
        // Determine regularity
        let cycleRegularity;
        if (cycleStdDev <= 2) cycleRegularity = 'very_regular';
        else if (cycleStdDev <= 4) cycleRegularity = 'regular';
        else if (cycleStdDev <= 7) cycleRegularity = 'somewhat_irregular';
        else cycleRegularity = 'irregular';

        // Detect trend (lengthening, shortening, stable)
        let trend = 'stable';
        if (cycleLengths.length >= 4) {
            const recentAvg = (cycleLengths[0] + cycleLengths[1]) / 2;
            const olderAvg = (cycleLengths[cycleLengths.length - 2] + cycleLengths[cycleLengths.length - 1]) / 2;
            const diff = recentAvg - olderAvg;
            
            if (diff > 2) trend = 'lengthening';
            else if (diff < -2) trend = 'shortening';
        }

        // Calculate confidence based on data quality
        let confidence = Math.min(0.95, 0.5 + (cycles.length * 0.05));
        if (cycleRegularity === 'irregular') confidence *= 0.7;
        if (cycleRegularity === 'somewhat_irregular') confidence *= 0.85;

        return {
            hasEnoughData: true,
            avgCycleLength: Math.round(avgCycleLength * 10) / 10,
            avgPeriodLength: Math.round(avgPeriodLength * 10) / 10,
            avgLutealPhase: Math.round(avgLutealPhase * 10) / 10,
            cycleStdDev: Math.round(cycleStdDev * 10) / 10,
            cycleRegularity,
            trend,
            confidence: Math.round(confidence * 100) / 100,
            dataPoints: cycles.length
        };
    }

    /**
     * Predict next period date based on user's history
     * @param {Object} profile - User health profile
     * @param {Array} cycles - Cycle history
     * @param {Date} lastPeriodDate - Last period start date
     */
    predictNextPeriod(profile, cycles, lastPeriodDate) {
        const analysis = this.analyzeCyclePatterns(cycles);
        const baseDate = new Date(lastPeriodDate);

        // Use learned cycle length or fall back to profile average
        const predictedCycleLength = analysis.hasEnoughData 
            ? analysis.avgCycleLength 
            : (profile?.avg_cycle_length || this.DEFAULT_CYCLE_LENGTH);

        // Calculate prediction with confidence interval
        const nextPeriodDate = new Date(baseDate);
        nextPeriodDate.setDate(baseDate.getDate() + Math.round(predictedCycleLength));

        // Calculate range based on variability
        const rangeMargin = analysis.hasEnoughData 
            ? Math.ceil(analysis.cycleStdDev * 1.5) 
            : 3;

        const earliestDate = new Date(nextPeriodDate);
        earliestDate.setDate(nextPeriodDate.getDate() - rangeMargin);

        const latestDate = new Date(nextPeriodDate);
        latestDate.setDate(nextPeriodDate.getDate() + rangeMargin);

        return {
            predictedDate: this.formatDate(nextPeriodDate),
            earliestDate: this.formatDate(earliestDate),
            latestDate: this.formatDate(latestDate),
            daysUntil: this.daysBetween(new Date(), nextPeriodDate),
            confidence: analysis.confidence,
            basedOnCycles: analysis.dataPoints || 0,
            predictedCycleLength: Math.round(predictedCycleLength)
        };
    }

    /**
     * Predict ovulation date
     * Uses luteal phase method when possible (more accurate)
     */
    predictOvulation(profile, cycles, lastPeriodDate) {
        const analysis = this.analyzeCyclePatterns(cycles);
        const baseDate = new Date(lastPeriodDate);

        // Luteal phase is more consistent than follicular phase
        // So we calculate backwards from next period
        const predictedCycleLength = analysis.hasEnoughData 
            ? analysis.avgCycleLength 
            : (profile?.avg_cycle_length || this.DEFAULT_CYCLE_LENGTH);

        const lutealPhase = analysis.hasEnoughData && analysis.avgLutealPhase
            ? analysis.avgLutealPhase
            : (profile?.avg_luteal_phase || this.DEFAULT_LUTEAL_PHASE);

        // Ovulation = Next period - luteal phase
        const nextPeriodDate = new Date(baseDate);
        nextPeriodDate.setDate(baseDate.getDate() + predictedCycleLength);

        const ovulationDate = new Date(nextPeriodDate);
        ovulationDate.setDate(nextPeriodDate.getDate() - Math.round(lutealPhase));

        // Fertile window: 5 days before ovulation + ovulation day + 1 day after
        const fertileStart = new Date(ovulationDate);
        fertileStart.setDate(ovulationDate.getDate() - 5);

        const fertileEnd = new Date(ovulationDate);
        fertileEnd.setDate(ovulationDate.getDate() + 1);

        // Peak fertility: 2 days before ovulation + ovulation day
        const peakStart = new Date(ovulationDate);
        peakStart.setDate(ovulationDate.getDate() - 2);

        return {
            ovulationDate: this.formatDate(ovulationDate),
            daysUntilOvulation: this.daysBetween(new Date(), ovulationDate),
            fertileWindow: {
                start: this.formatDate(fertileStart),
                end: this.formatDate(fertileEnd),
                peakStart: this.formatDate(peakStart),
                peakEnd: this.formatDate(ovulationDate)
            },
            confidence: analysis.confidence * 0.9, // Ovulation prediction slightly less certain
            basedOnLutealPhase: Math.round(lutealPhase)
        };
    }

    /**
     * Calculate daily fertility score (0-100)
     * Higher score = higher chance of conception
     */
    calculateFertilityScore(profile, cycles, targetDate = new Date()) {
        const analysis = this.analyzeCyclePatterns(cycles);
        const lastPeriodDate = profile?.last_period_date;
        
        if (!lastPeriodDate) {
            return {
                score: 0,
                level: 'unknown',
                phase: 'unknown',
                message: 'Chưa có dữ liệu chu kỳ'
            };
        }

        const ovulationPrediction = this.predictOvulation(profile, cycles, lastPeriodDate);
        const ovulationDate = new Date(ovulationPrediction.ovulationDate);
        const daysDiff = this.daysBetween(targetDate, ovulationDate);
        const cycleDay = this.daysBetween(new Date(lastPeriodDate), targetDate) + 1;

        let score = 0;
        let level = 'low';
        let phase = 'menstrual';

        // Determine cycle phase and base fertility
        const avgPeriodLength = analysis.avgPeriodLength || this.DEFAULT_PERIOD_LENGTH;
        const avgCycleLength = analysis.avgCycleLength || this.DEFAULT_CYCLE_LENGTH;

        if (cycleDay <= avgPeriodLength) {
            // Menstrual phase
            phase = 'menstrual';
            score = 5;
            level = 'very_low';
        } else if (daysDiff > 6) {
            // Early follicular (not yet fertile)
            phase = 'follicular';
            score = 10;
            level = 'low';
        } else if (daysDiff >= 3 && daysDiff <= 6) {
            // Approaching fertile window
            phase = 'fertile_approaching';
            score = 30 + (6 - daysDiff) * 10;
            level = 'medium';
        } else if (daysDiff >= 1 && daysDiff <= 2) {
            // Peak fertility (2 days before ovulation)
            phase = 'peak_fertility';
            score = 90 + (2 - daysDiff) * 5;
            level = 'very_high';
        } else if (daysDiff === 0) {
            // Ovulation day
            phase = 'ovulation';
            score = 100;
            level = 'peak';
        } else if (daysDiff >= -1 && daysDiff < 0) {
            // Day after ovulation (still possible)
            phase = 'post_ovulation';
            score = 50;
            level = 'medium';
        } else if (daysDiff < -1) {
            // Luteal phase
            phase = 'luteal';
            score = 5;
            level = 'very_low';
        }

        // Adjust confidence based on data quality
        const adjustedScore = Math.round(score * analysis.confidence);

        return {
            score: Math.min(100, Math.max(0, adjustedScore)),
            rawScore: score,
            level,
            phase,
            cycleDay,
            daysToOvulation: daysDiff,
            confidence: analysis.confidence,
            message: this.getFertilityMessage(level, phase, profile?.goal)
        };
    }

    /**
     * Get fertility message based on level and user goal
     */
    getFertilityMessage(level, phase, goal) {
        const messages = {
            trying_to_conceive: {
                very_low: 'Khả năng thụ thai thấp. Đây không phải là thời điểm tối ưu.',
                low: 'Khả năng thụ thai thấp. Cửa sổ sinh sản đang đến gần.',
                medium: 'Khả năng thụ thai trung bình. Cửa sổ sinh sản đang bắt đầu.',
                high: 'Khả năng thụ thai cao! Đây là thời điểm tốt để thụ thai.',
                very_high: 'Khả năng thụ thai rất cao! Đỉnh khả năng sinh sản.',
                peak: 'Đỉnh khả năng sinh sản! Ngày rụng trứng.'
            },
            avoid_pregnancy: {
                very_low: 'Nguy cơ thụ thai thấp, nhưng vẫn nên sử dụng biện pháp bảo vệ.',
                low: 'Nguy cơ thụ thai thấp. Cửa sổ sinh sản đang đến gần.',
                medium: 'Cẩn thận! Đang trong giai đoạn có thể thụ thai.',
                high: 'Cảnh báo! Nguy cơ thụ thai cao.',
                very_high: 'Cảnh báo cao! Đỉnh khả năng sinh sản.',
                peak: 'Cảnh báo tối đa! Ngày rụng trứng - nguy cơ thụ thai cao nhất.'
            },
            track_health: {
                very_low: `Giai đoạn ${phase === 'menstrual' ? 'kinh nguyệt' : 'hoàng thể'}`,
                low: 'Giai đoạn nang trứng sớm',
                medium: 'Đang tiến vào cửa sổ sinh sản',
                high: 'Trong cửa sổ sinh sản',
                very_high: 'Đỉnh cửa sổ sinh sản',
                peak: 'Ngày rụng trứng'
            }
        };

        return messages[goal || 'track_health'][level] || 'Đang theo dõi chu kỳ';
    }

    /**
     * Calculate due date for pregnancy
     * Uses Naegele's rule adjusted by user's cycle length
     */
    calculateDueDate(lastPeriodDate, avgCycleLength = 28) {
        const lmpDate = new Date(lastPeriodDate);
        
        // Standard Naegele's rule assumes 28-day cycle
        // Adjust for actual cycle length
        const cycleAdjustment = avgCycleLength - 28;
        
        // Due date = LMP + 280 days + cycle adjustment
        const dueDate = new Date(lmpDate);
        dueDate.setDate(lmpDate.getDate() + 280 + cycleAdjustment);

        // Calculate trimester dates
        const firstTrimesterEnd = new Date(lmpDate);
        firstTrimesterEnd.setDate(lmpDate.getDate() + 84); // 12 weeks

        const secondTrimesterEnd = new Date(lmpDate);
        secondTrimesterEnd.setDate(lmpDate.getDate() + 182); // 26 weeks

        // Current week calculation
        const today = new Date();
        const daysPregnant = this.daysBetween(lmpDate, today);
        const weeksPregnant = Math.floor(daysPregnant / 7);
        const daysExtra = daysPregnant % 7;

        return {
            dueDate: this.formatDate(dueDate),
            daysUntilDue: this.daysBetween(today, dueDate),
            weeksPregnant,
            daysExtra,
            pregnancyWeek: `${weeksPregnant} tuần ${daysExtra} ngày`,
            trimester: weeksPregnant < 12 ? 1 : (weeksPregnant < 26 ? 2 : 3),
            firstTrimesterEnd: this.formatDate(firstTrimesterEnd),
            secondTrimesterEnd: this.formatDate(secondTrimesterEnd),
            cycleAdjustment
        };
    }

    /**
     * Get health suggestions based on cycle phase and user patterns
     */
    getHealthSuggestions(profile, cycles, symptoms, targetDate = new Date()) {
        const analysis = this.analyzeCyclePatterns(cycles);
        const fertility = this.calculateFertilityScore(profile, cycles, targetDate);
        const suggestions = [];

        // Phase-based suggestions
        switch (fertility.phase) {
            case 'menstrual':
                suggestions.push({
                    category: 'nutrition',
                    title: 'Bổ sung sắt',
                    description: 'Ăn thực phẩm giàu sắt như rau bina, thịt đỏ để bù lại lượng sắt mất đi.',
                    priority: 'high'
                });
                suggestions.push({
                    category: 'activity',
                    title: 'Tập nhẹ nhàng',
                    description: 'Yoga hoặc đi bộ nhẹ có thể giúp giảm đau bụng kinh.',
                    priority: 'medium'
                });
                suggestions.push({
                    category: 'rest',
                    title: 'Nghỉ ngơi đầy đủ',
                    description: 'Cơ thể cần nhiều năng lượng hơn trong giai đoạn này.',
                    priority: 'high'
                });
                break;

            case 'follicular':
                suggestions.push({
                    category: 'activity',
                    title: 'Thời điểm tập luyện tốt',
                    description: 'Estrogen đang tăng, cơ thể có nhiều năng lượng hơn.',
                    priority: 'medium'
                });
                suggestions.push({
                    category: 'nutrition',
                    title: 'Protein và rau xanh',
                    description: 'Hỗ trợ sự phát triển của nang trứng.',
                    priority: 'medium'
                });
                break;

            case 'fertile_approaching':
            case 'peak_fertility':
            case 'ovulation':
                if (profile?.goal === 'trying_to_conceive') {
                    suggestions.push({
                        category: 'fertility',
                        title: 'Thời điểm tốt nhất để thụ thai',
                        description: 'Quan hệ trong 2-3 ngày tới để tối đa hóa cơ hội.',
                        priority: 'high'
                    });
                }
                suggestions.push({
                    category: 'hydration',
                    title: 'Uống nhiều nước',
                    description: 'Giúp duy trì chất nhầy cổ tử cung khỏe mạnh.',
                    priority: 'high'
                });
                break;

            case 'luteal':
                suggestions.push({
                    category: 'nutrition',
                    title: 'Magnesium và Vitamin B6',
                    description: 'Giúp giảm triệu chứng PMS.',
                    priority: 'medium'
                });
                suggestions.push({
                    category: 'mood',
                    title: 'Chú ý tâm trạng',
                    description: 'Progesterone cao có thể ảnh hưởng đến tâm trạng.',
                    priority: 'low'
                });
                break;
        }

        // Symptom-based suggestions (if symptom patterns provided)
        if (symptoms && symptoms.length > 0) {
            symptoms.forEach(pattern => {
                if (pattern.typical_cycle_days?.includes(fertility.cycleDay)) {
                    suggestions.push({
                        category: 'symptom_prep',
                        title: `Chuẩn bị cho ${this.translateSymptom(pattern.symptom)}`,
                        description: `Dựa trên lịch sử, bạn thường gặp triệu chứng này vào ngày ${fertility.cycleDay} của chu kỳ.`,
                        priority: 'medium'
                    });
                }
            });
        }

        // Goal-specific suggestions
        if (profile?.goal === 'trying_to_conceive' && fertility.phase !== 'menstrual') {
            suggestions.push({
                category: 'fertility',
                title: 'Theo dõi BBT',
                description: 'Đo nhiệt độ cơ thể mỗi sáng để xác nhận rụng trứng.',
                priority: 'low'
            });
        }

        // General wellness suggestions
        suggestions.push({
            category: 'hydration',
            title: 'Uống đủ nước',
            description: 'Mục tiêu 8 ly nước mỗi ngày.',
            priority: 'low'
        });

        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Generate 3-month trend insights
     */
    generateTrendInsights(cycles) {
        const analysis = this.analyzeCyclePatterns(cycles);
        const insights = [];

        if (!analysis.hasEnoughData) {
            return [{
                type: 'info',
                title: 'Cần thêm dữ liệu',
                description: `Cần ít nhất ${this.MIN_CYCLES_FOR_PREDICTION} chu kỳ để phân tích xu hướng. Hiện có ${cycles?.length || 0} chu kỳ.`
            }];
        }

        // Cycle length insight
        insights.push({
            type: 'cycle_length',
            title: 'Độ dài chu kỳ trung bình',
            value: `${analysis.avgCycleLength} ngày`,
            description: `Dựa trên ${analysis.dataPoints} chu kỳ gần nhất`,
            trend: analysis.trend
        });

        // Regularity insight
        const regularityMessages = {
            very_regular: 'Chu kỳ của bạn rất đều đặn! Độ biến thiên chỉ ±2 ngày.',
            regular: 'Chu kỳ của bạn khá đều đặn với độ biến thiên ±4 ngày.',
            somewhat_irregular: 'Chu kỳ có biến đổi trung bình. Có thể do stress, thay đổi lối sống.',
            irregular: 'Chu kỳ không đều. Nên tham khảo ý kiến bác sĩ nếu tình trạng kéo dài.'
        };

        insights.push({
            type: 'regularity',
            title: 'Độ đều đặn',
            value: analysis.cycleRegularity,
            description: regularityMessages[analysis.cycleRegularity],
            stdDev: analysis.cycleStdDev
        });

        // Trend insight
        if (analysis.trend !== 'stable') {
            insights.push({
                type: 'trend',
                title: 'Xu hướng chu kỳ',
                value: analysis.trend === 'lengthening' ? 'Đang dài hơn' : 'Đang ngắn hơn',
                description: analysis.trend === 'lengthening' 
                    ? 'Chu kỳ gần đây có xu hướng dài hơn trước.'
                    : 'Chu kỳ gần đây có xu hướng ngắn hơn trước.'
            });
        }

        // Period length insight
        insights.push({
            type: 'period_length',
            title: 'Độ dài kỳ kinh trung bình',
            value: `${analysis.avgPeriodLength} ngày`,
            description: 'Số ngày ra máu trung bình mỗi chu kỳ'
        });

        // Prediction confidence
        insights.push({
            type: 'confidence',
            title: 'Độ tin cậy dự đoán',
            value: `${Math.round(analysis.confidence * 100)}%`,
            description: analysis.confidence > 0.8 
                ? 'Dự đoán có độ tin cậy cao dựa trên dữ liệu của bạn.'
                : 'Độ tin cậy sẽ tăng khi bạn ghi nhận thêm chu kỳ.'
        });

        return insights;
    }

    // ==================== HELPER METHODS ====================

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        const diffTime = d2 - d1;
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    translateSymptom(symptom) {
        const translations = {
            cramps: 'đau bụng kinh',
            headache: 'đau đầu',
            fatigue: 'mệt mỏi',
            mood_swings: 'thay đổi tâm trạng',
            bloating: 'đầy hơi',
            breast_tenderness: 'căng ngực',
            acne: 'mụn',
            backache: 'đau lưng',
            nausea: 'buồn nôn',
            insomnia: 'mất ngủ',
            appetite_changes: 'thay đổi khẩu vị',
            cravings: 'thèm ăn'
        };
        return translations[symptom] || symptom;
    }
}

module.exports = new CyclePredictionService();
