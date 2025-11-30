// services/healthAnalytics.service.js
/**
 * Health Analytics Service
 * Analyzes user data patterns and generates personalized insights
 */

class HealthAnalyticsService {
    /**
     * Analyze symptom patterns from daily logs
     * @param {Array} dailyLogs - Array of daily log entries
     * @returns {Object} Symptom analysis results
     */
    analyzeSymptomPatterns(dailyLogs, cycleLengthAvg = 28) {
        if (!dailyLogs || dailyLogs.length === 0) {
            return { patterns: [], insights: [] };
        }

        const symptomData = {};
        
        // Aggregate symptom occurrences by cycle day
        dailyLogs.forEach(log => {
            if (!log.symptoms || log.symptoms.length === 0) return;
            
            const cycleDay = log.cycle_day || 0;
            const phase = this.getCyclePhase(cycleDay, cycleLengthAvg);
            
            log.symptoms.forEach(symptom => {
                if (!symptomData[symptom]) {
                    symptomData[symptom] = {
                        symptom,
                        occurrences: [],
                        cycleDays: [],
                        phases: { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 },
                        totalCount: 0
                    };
                }
                
                symptomData[symptom].occurrences.push({
                    date: log.log_date,
                    cycleDay,
                    phase
                });
                symptomData[symptom].cycleDays.push(cycleDay);
                symptomData[symptom].phases[phase]++;
                symptomData[symptom].totalCount++;
            });
        });

        // Calculate patterns for each symptom
        const patterns = Object.values(symptomData).map(data => {
            const totalLogs = dailyLogs.length;
            const frequency = data.totalCount / totalLogs;
            
            // Find most common cycle days
            const dayFrequency = {};
            data.cycleDays.forEach(day => {
                dayFrequency[day] = (dayFrequency[day] || 0) + 1;
            });
            
            const typicalDays = Object.entries(dayFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([day]) => parseInt(day));

            // Calculate phase distribution
            const totalPhaseCount = Object.values(data.phases).reduce((a, b) => a + b, 0);
            const phaseDistribution = {};
            Object.entries(data.phases).forEach(([phase, count]) => {
                phaseDistribution[phase] = totalPhaseCount > 0 ? count / totalPhaseCount : 0;
            });

            // Find dominant phase
            const dominantPhase = Object.entries(phaseDistribution)
                .sort((a, b) => b[1] - a[1])[0];

            return {
                symptom: data.symptom,
                frequency: Math.round(frequency * 100) / 100,
                typical_cycle_days: typicalDays,
                phase_distribution: phaseDistribution,
                dominant_phase: dominantPhase ? dominantPhase[0] : null,
                occurrence_count: data.totalCount
            };
        });

        // Generate insights
        const insights = this.generateSymptomInsights(patterns);

        return { patterns, insights };
    }

    /**
     * Generate insights from symptom patterns
     */
    generateSymptomInsights(patterns) {
        const insights = [];

        // Find PMS indicators (symptoms in luteal phase)
        const pmsSymptoms = patterns.filter(p => 
            p.dominant_phase === 'luteal' && p.frequency > 0.3
        );

        if (pmsSymptoms.length > 0) {
            insights.push({
                type: 'pms',
                title: 'Triệu chứng PMS phổ biến',
                description: `Bạn thường gặp ${pmsSymptoms.map(s => this.translateSymptom(s.symptom)).join(', ')} trong giai đoạn hoàng thể (trước kỳ kinh).`,
                symptoms: pmsSymptoms.map(s => s.symptom),
                recommendation: 'Bổ sung Magnesium và Vitamin B6 có thể giúp giảm triệu chứng.'
            });
        }

        // Find menstrual symptoms
        const menstrualSymptoms = patterns.filter(p => 
            p.dominant_phase === 'menstrual' && p.frequency > 0.3
        );

        if (menstrualSymptoms.length > 0) {
            insights.push({
                type: 'menstrual',
                title: 'Triệu chứng kỳ kinh',
                description: `Trong kỳ kinh, bạn thường gặp: ${menstrualSymptoms.map(s => this.translateSymptom(s.symptom)).join(', ')}.`,
                symptoms: menstrualSymptoms.map(s => s.symptom),
                recommendation: 'Nghỉ ngơi, chườm ấm, và tập yoga nhẹ có thể giúp giảm triệu chứng.'
            });
        }

        // Recurring symptoms analysis
        const frequentSymptoms = patterns.filter(p => p.frequency > 0.5);
        if (frequentSymptoms.length > 0) {
            insights.push({
                type: 'frequent',
                title: 'Triệu chứng xuất hiện thường xuyên',
                description: `Triệu chứng xuất hiện hơn 50% số ngày ghi nhận: ${frequentSymptoms.map(s => this.translateSymptom(s.symptom)).join(', ')}.`,
                symptoms: frequentSymptoms.map(s => s.symptom),
                recommendation: 'Nếu triệu chứng ảnh hưởng đến cuộc sống hàng ngày, nên tham khảo ý kiến bác sĩ.'
            });
        }

        return insights;
    }

    /**
     * Analyze lifestyle factors and their correlation with symptoms
     */
    analyzeLifestyleCorrelations(dailyLogs) {
        if (!dailyLogs || dailyLogs.length < 14) {
            return { correlations: [], insights: [] };
        }

        const correlations = [];

        // Analyze sleep vs symptoms
        const logsWithSleep = dailyLogs.filter(l => l.sleep_hours != null);
        if (logsWithSleep.length > 7) {
            const avgSleep = logsWithSleep.reduce((sum, l) => sum + l.sleep_hours, 0) / logsWithSleep.length;
            const badSleepDays = logsWithSleep.filter(l => l.sleep_hours < 6);
            const symptomCountOnBadSleep = badSleepDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0);
            const avgSymptomsBadSleep = badSleepDays.length > 0 ? symptomCountOnBadSleep / badSleepDays.length : 0;
            
            const goodSleepDays = logsWithSleep.filter(l => l.sleep_hours >= 7);
            const symptomCountOnGoodSleep = goodSleepDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0);
            const avgSymptomsGoodSleep = goodSleepDays.length > 0 ? symptomCountOnGoodSleep / goodSleepDays.length : 0;

            if (avgSymptomsBadSleep > avgSymptomsGoodSleep * 1.3) {
                correlations.push({
                    factor: 'sleep',
                    correlation: 'negative',
                    insight: 'Bạn có nhiều triệu chứng hơn khi ngủ ít hơn 6 tiếng.',
                    recommendation: 'Cố gắng ngủ đủ 7-8 tiếng mỗi đêm.'
                });
            }
        }

        // Analyze exercise vs symptoms
        const logsWithExercise = dailyLogs.filter(l => l.exercise_minutes != null);
        if (logsWithExercise.length > 7) {
            const exerciseDays = logsWithExercise.filter(l => l.exercise_minutes >= 30);
            const noExerciseDays = logsWithExercise.filter(l => l.exercise_minutes < 15);
            
            const avgSymptomsExercise = exerciseDays.length > 0 
                ? exerciseDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0) / exerciseDays.length 
                : 0;
            const avgSymptomsNoExercise = noExerciseDays.length > 0 
                ? noExerciseDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0) / noExerciseDays.length 
                : 0;

            if (avgSymptomsNoExercise > avgSymptomsExercise * 1.3) {
                correlations.push({
                    factor: 'exercise',
                    correlation: 'positive',
                    insight: 'Tập thể dục có vẻ giúp giảm triệu chứng của bạn.',
                    recommendation: 'Duy trì tập luyện ít nhất 30 phút mỗi ngày.'
                });
            }
        }

        // Analyze hydration vs symptoms
        const logsWithWater = dailyLogs.filter(l => l.water_intake != null);
        if (logsWithWater.length > 7) {
            const wellHydratedDays = logsWithWater.filter(l => l.water_intake >= 8);
            const dehydratedDays = logsWithWater.filter(l => l.water_intake < 5);

            const avgSymptomsHydrated = wellHydratedDays.length > 0
                ? wellHydratedDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0) / wellHydratedDays.length
                : 0;
            const avgSymptomsDehydrated = dehydratedDays.length > 0
                ? dehydratedDays.reduce((sum, l) => sum + (l.symptoms?.length || 0), 0) / dehydratedDays.length
                : 0;

            if (avgSymptomsDehydrated > avgSymptomsHydrated * 1.2) {
                correlations.push({
                    factor: 'hydration',
                    correlation: 'positive',
                    insight: 'Uống đủ nước có vẻ giúp giảm triệu chứng.',
                    recommendation: 'Uống ít nhất 8 ly nước mỗi ngày.'
                });
            }
        }

        return { correlations };
    }

    /**
     * Generate cycle chart data for visualization
     */
    generateCycleChartData(cycles, months = 3) {
        if (!cycles || cycles.length === 0) {
            return { chartData: [], summary: null };
        }

        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        const recentCycles = cycles.filter(c => new Date(c.start_date) >= cutoffDate);
        
        const chartData = recentCycles.map((cycle, index) => ({
            cycleNumber: index + 1,
            startDate: cycle.start_date,
            cycleLength: cycle.cycle_length,
            periodLength: cycle.period_length,
            ovulationDay: cycle.ovulation_date 
                ? this.daysBetween(cycle.start_date, cycle.ovulation_date)
                : null
        }));

        // Calculate summary statistics
        const cycleLengths = recentCycles.filter(c => c.cycle_length).map(c => c.cycle_length);
        const periodLengths = recentCycles.filter(c => c.period_length).map(c => c.period_length);

        const summary = {
            totalCycles: recentCycles.length,
            avgCycleLength: cycleLengths.length > 0 
                ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length * 10) / 10
                : null,
            minCycleLength: cycleLengths.length > 0 ? Math.min(...cycleLengths) : null,
            maxCycleLength: cycleLengths.length > 0 ? Math.max(...cycleLengths) : null,
            avgPeriodLength: periodLengths.length > 0
                ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length * 10) / 10
                : null
        };

        return { chartData, summary };
    }

    /**
     * Get personalized daily recommendations
     */
    getDailyRecommendations(profile, cyclePhase, symptoms = [], goal = 'track_health') {
        const recommendations = [];
        const today = new Date();
        const hour = today.getHours();

        // Time-based recommendations
        if (hour < 10) {
            recommendations.push({
                type: 'morning',
                icon: '☀️',
                title: 'Buổi sáng',
                text: 'Đo nhiệt độ cơ thể (BBT) ngay khi thức dậy để theo dõi rụng trứng chính xác hơn.',
                priority: goal === 'trying_to_conceive' ? 'high' : 'low'
            });
        }

        // Phase-based recommendations
        const phaseRecommendations = {
            menstrual: [
                { icon: '🩸', title: 'Bổ sung sắt', text: 'Ăn rau xanh, thịt đỏ, đậu để bổ sung sắt.' },
                { icon: '🛌', title: 'Nghỉ ngơi', text: 'Ưu tiên giấc ngủ và hoạt động nhẹ nhàng.' },
                { icon: '🧘', title: 'Yoga nhẹ', text: 'Các tư thế yoga có thể giúp giảm đau bụng kinh.' }
            ],
            follicular: [
                { icon: '💪', title: 'Thời điểm tốt để tập', text: 'Estrogen tăng, năng lượng cao - tốt cho tập luyện cường độ cao.' },
                { icon: '🥗', title: 'Dinh dưỡng', text: 'Tập trung vào protein và carbs phức tạp.' }
            ],
            ovulation: [
                { icon: '💧', title: 'Uống nước', text: 'Hydration quan trọng cho chất nhầy cổ tử cung.' },
                { icon: '⚡', title: 'Năng lượng cao nhất', text: 'Tận dụng năng lượng cho công việc và tập luyện.' }
            ],
            luteal: [
                { icon: '🍫', title: 'Kiểm soát thèm ăn', text: 'Ăn đều đặn để tránh thèm đồ ngọt.' },
                { icon: '😌', title: 'Giảm stress', text: 'Thiền, hít thở sâu giúp cân bằng hormone.' },
                { icon: '💤', title: 'Ngủ sớm hơn', text: 'Progesterone có thể gây buồn ngủ - ngủ sớm hơn 30 phút.' }
            ]
        };

        if (phaseRecommendations[cyclePhase]) {
            recommendations.push(...phaseRecommendations[cyclePhase].map(r => ({
                ...r,
                type: 'phase',
                priority: 'medium'
            })));
        }

        // Symptom-based recommendations
        if (symptoms.includes('cramps')) {
            recommendations.push({
                type: 'symptom',
                icon: '🌡️',
                title: 'Giảm đau bụng',
                text: 'Chườm ấm vùng bụng dưới và uống trà gừng.',
                priority: 'high'
            });
        }

        if (symptoms.includes('headache')) {
            recommendations.push({
                type: 'symptom',
                icon: '💆',
                title: 'Giảm đau đầu',
                text: 'Massage thái dương, uống nước, nghỉ mắt khỏi màn hình.',
                priority: 'high'
            });
        }

        if (symptoms.includes('fatigue')) {
            recommendations.push({
                type: 'symptom',
                icon: '🔋',
                title: 'Chống mệt mỏi',
                text: 'Nghỉ ngắn 15-20 phút, tránh caffeine quá nhiều.',
                priority: 'medium'
            });
        }

        // Goal-specific recommendations
        if (goal === 'trying_to_conceive' && (cyclePhase === 'ovulation' || cyclePhase === 'fertile_approaching')) {
            recommendations.push({
                type: 'goal',
                icon: '👶',
                title: 'Tối ưu thụ thai',
                text: 'Đây là thời điểm tốt nhất để quan hệ. Nằm nghỉ 15 phút sau.',
                priority: 'high'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });
    }

    // ==================== HELPER METHODS ====================

    getCyclePhase(cycleDay, cycleLengthAvg) {
        const ovulationDay = Math.round(cycleLengthAvg - 14);
        
        if (cycleDay <= 5) return 'menstrual';
        if (cycleDay < ovulationDay - 2) return 'follicular';
        if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 1) return 'ovulation';
        return 'luteal';
    }

    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
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
            cravings: 'thèm ăn',
            dizziness: 'chóng mặt',
            hot_flashes: 'bốc hỏa'
        };
        return translations[symptom] || symptom;
    }
}

module.exports = new HealthAnalyticsService();
