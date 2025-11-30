// controllers/healthToolkit.controller.js
/**
 * Health Toolkit Controller
 * Handles all reproductive health tracking endpoints
 */

const Joi = require('joi');
const { Op } = require('sequelize');
const cyclePredictionService = require('../services/cyclePrediction.service');
const healthAnalyticsService = require('../services/healthAnalytics.service');

// Models will be loaded dynamically
let UserHealthProfile, CycleHistory, DailyLog, SymptomPattern, User;

const loadModels = () => {
    if (!UserHealthProfile) {
        UserHealthProfile = require('../models/userHealthProfile.model');
        CycleHistory = require('../models/cycleHistory.model');
        DailyLog = require('../models/dailyLog.model');
        SymptomPattern = require('../models/symptomPattern.model');
        User = require('../models/user.model');
    }
};

// ==================== PROFILE ENDPOINTS ====================

/**
 * GET /health/profile - Get user's health profile
 */
exports.getProfile = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        let profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        
        if (!profile) {
            // Create default profile if doesn't exist
            profile = await UserHealthProfile.create({ user_id: userId });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * PUT /health/profile - Update user's health profile
 */
exports.updateProfile = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        const schema = Joi.object({
            goal: Joi.string().valid('avoid_pregnancy', 'track_health', 'trying_to_conceive'),
            is_pregnant: Joi.boolean(),
            pregnancy_start_date: Joi.date().allow(null),
            track_sexual_activity: Joi.boolean(),
            notify_period: Joi.boolean(),
            notify_ovulation: Joi.boolean(),
            notify_fertile_window: Joi.boolean(),
            notify_days_before: Joi.number().min(1).max(7)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        let profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        
        if (!profile) {
            profile = await UserHealthProfile.create({ user_id: userId, ...value });
        } else {
            await profile.update(value);
        }

        // If user sets pregnancy, calculate due date
        if (value.is_pregnant && value.pregnancy_start_date) {
            const dueDate = cyclePredictionService.calculateDueDate(
                value.pregnancy_start_date,
                profile.avg_cycle_length
            );
            await profile.update({ expected_due_date: dueDate.dueDate });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thành công',
            data: profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== CYCLE TRACKING ENDPOINTS ====================

/**
 * POST /health/cycle/update - Log period start/end or update cycle data
 */
exports.updateCycle = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        const schema = Joi.object({
            action: Joi.string().valid('period_start', 'period_end', 'update_cycle').required(),
            date: Joi.date().required(),
            cycle_id: Joi.number().when('action', {
                is: 'update_cycle',
                then: Joi.required()
            }),
            ovulation_date: Joi.date().allow(null),
            ovulation_confirmed: Joi.boolean(),
            notes: Joi.string().allow('', null)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        let profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        if (!profile) {
            profile = await UserHealthProfile.create({ user_id: userId });
        }

        let result;

        switch (value.action) {
            case 'period_start':
                result = await handlePeriodStart(userId, profile, value.date, value.notes);
                break;
            case 'period_end':
                result = await handlePeriodEnd(userId, profile, value.date);
                break;
            case 'update_cycle':
                result = await handleCycleUpdate(userId, value);
                break;
        }

        // Recalculate user's averages
        await recalculateUserAverages(userId, profile);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('Error updating cycle:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

async function handlePeriodStart(userId, profile, date, notes) {
    loadModels();
    const startDate = new Date(date);
    
    // Close any previous open cycle
    const previousCycle = await CycleHistory.findOne({
        where: { user_id: userId, is_complete: false },
        order: [['start_date', 'DESC']]
    });

    if (previousCycle) {
        // Calculate previous cycle length
        const cycleLength = cyclePredictionService.daysBetween(previousCycle.start_date, startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() - 1);

        // Calculate luteal phase if ovulation was tracked
        let lutealPhase = null;
        if (previousCycle.ovulation_date) {
            lutealPhase = cyclePredictionService.daysBetween(previousCycle.ovulation_date, startDate);
        }

        await previousCycle.update({
            end_date: endDate,
            cycle_length: cycleLength,
            luteal_phase_length: lutealPhase,
            is_complete: true
        });
    }

    // Create new cycle
    const newCycle = await CycleHistory.create({
        user_id: userId,
        start_date: startDate,
        notes
    });

    // Update profile
    await profile.update({
        last_period_date: startDate,
        cycles_recorded: (profile.cycles_recorded || 0) + 1
    });

    // Mark period days in daily log
    await DailyLog.upsert({
        user_id: userId,
        log_date: startDate,
        is_period_day: true,
        cycle_day: 1
    });

    return {
        message: 'Đã ghi nhận ngày bắt đầu kỳ kinh',
        data: newCycle
    };
}

async function handlePeriodEnd(userId, profile, date) {
    loadModels();
    const endDate = new Date(date);

    // Find current cycle
    const currentCycle = await CycleHistory.findOne({
        where: { user_id: userId, is_complete: false },
        order: [['start_date', 'DESC']]
    });

    if (!currentCycle) {
        throw new Error('Không tìm thấy chu kỳ hiện tại');
    }

    // Calculate period length
    const periodLength = cyclePredictionService.daysBetween(currentCycle.start_date, endDate) + 1;

    await currentCycle.update({
        period_end_date: endDate,
        period_length: periodLength
    });

    return {
        message: 'Đã ghi nhận ngày kết thúc kỳ kinh',
        data: currentCycle
    };
}

async function handleCycleUpdate(userId, data) {
    loadModels();
    const cycle = await CycleHistory.findOne({
        where: { id: data.cycle_id, user_id: userId }
    });

    if (!cycle) {
        throw new Error('Không tìm thấy chu kỳ');
    }

    const updateData = {};
    if (data.ovulation_date) {
        updateData.ovulation_date = data.ovulation_date;
        updateData.ovulation_confirmed = data.ovulation_confirmed || false;
    }
    if (data.notes !== undefined) {
        updateData.notes = data.notes;
    }

    await cycle.update(updateData);

    return {
        message: 'Đã cập nhật thông tin chu kỳ',
        data: cycle
    };
}

async function recalculateUserAverages(userId, profile) {
    loadModels();
    // Get last 12 complete cycles
    const cycles = await CycleHistory.findAll({
        where: { user_id: userId, is_complete: true },
        order: [['start_date', 'DESC']],
        limit: 12
    });

    if (cycles.length >= 3) {
        const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
        const periodLengths = cycles.filter(c => c.period_length).map(c => c.period_length);
        const lutealPhases = cycles.filter(c => c.luteal_phase_length).map(c => c.luteal_phase_length);

        const avgCycle = cyclePredictionService.weightedAverage(cycleLengths);
        const avgPeriod = cyclePredictionService.weightedAverage(periodLengths);
        const avgLuteal = cyclePredictionService.weightedAverage(lutealPhases);
        const stdDev = cyclePredictionService.calculateStdDev(cycleLengths);

        await profile.update({
            avg_cycle_length: avgCycle ? Math.round(avgCycle * 10) / 10 : profile.avg_cycle_length,
            avg_period_length: avgPeriod ? Math.round(avgPeriod * 10) / 10 : profile.avg_period_length,
            avg_luteal_phase: avgLuteal ? Math.round(avgLuteal * 10) / 10 : profile.avg_luteal_phase,
            cycle_length_std: stdDev ? Math.round(stdDev * 10) / 10 : profile.cycle_length_std
        });
    }
}

// ==================== PREDICTION ENDPOINTS ====================

/**
 * GET /health/prediction - Get all predictions
 */
exports.getPrediction = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        if (!profile || !profile.last_period_date) {
            return res.status(200).json({
                success: true,
                data: {
                    hasData: false,
                    message: 'Cần ghi nhận ít nhất 1 chu kỳ để dự đoán'
                }
            });
        }

        // Get cycle history
        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });

        // Generate predictions
        const periodPrediction = cyclePredictionService.predictNextPeriod(
            profile, cycles, profile.last_period_date
        );
        const ovulationPrediction = cyclePredictionService.predictOvulation(
            profile, cycles, profile.last_period_date
        );

        // If pregnant, calculate due date instead
        let pregnancyInfo = null;
        if (profile.is_pregnant && profile.pregnancy_start_date) {
            pregnancyInfo = cyclePredictionService.calculateDueDate(
                profile.pregnancy_start_date,
                profile.avg_cycle_length
            );
        }

        res.status(200).json({
            success: true,
            data: {
                hasData: true,
                isPregnant: profile.is_pregnant,
                nextPeriod: profile.is_pregnant ? null : periodPrediction,
                ovulation: profile.is_pregnant ? null : ovulationPrediction,
                pregnancy: pregnancyInfo,
                cycleInfo: {
                    avgCycleLength: profile.avg_cycle_length,
                    avgPeriodLength: profile.avg_period_length,
                    cyclesRecorded: profile.cycles_recorded,
                    lastPeriodDate: profile.last_period_date
                }
            }
        });
    } catch (error) {
        console.error('Error getting prediction:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== FERTILITY ENDPOINTS ====================

/**
 * GET /health/fertility/score - Get daily fertility score
 */
exports.getFertilityScore = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const targetDate = req.query.date ? new Date(req.query.date) : new Date();

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        if (!profile || !profile.last_period_date) {
            return res.status(200).json({
                success: true,
                data: {
                    score: 0,
                    level: 'unknown',
                    message: 'Cần ghi nhận chu kỳ để tính điểm sinh sản'
                }
            });
        }

        // Get cycle history
        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });

        const fertilityScore = cyclePredictionService.calculateFertilityScore(
            profile, cycles, targetDate
        );

        res.status(200).json({
            success: true,
            data: {
                ...fertilityScore,
                goal: profile.goal,
                date: targetDate.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error('Error getting fertility score:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * GET /health/fertility/calendar - Get fertility calendar for a month
 */
exports.getFertilityCalendar = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const { month, year } = req.query;
        
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        if (!profile || !profile.last_period_date) {
            return res.status(200).json({
                success: true,
                data: { hasData: false, calendar: [] }
            });
        }

        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });

        // Generate calendar data for each day of the month
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const calendar = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            const fertility = cyclePredictionService.calculateFertilityScore(profile, cycles, date);
            
            calendar.push({
                date: date.toISOString().split('T')[0],
                day,
                fertilityScore: fertility.score,
                fertilityLevel: fertility.level,
                phase: fertility.phase,
                cycleDay: fertility.cycleDay
            });
        }

        res.status(200).json({
            success: true,
            data: {
                hasData: true,
                month: targetMonth + 1,
                year: targetYear,
                calendar
            }
        });
    } catch (error) {
        console.error('Error getting fertility calendar:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== DAILY LOG ENDPOINTS ====================

/**
 * POST /health/daily-log - Log daily symptoms and activities
 */
exports.createDailyLog = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        const schema = Joi.object({
            log_date: Joi.date().required(),
            is_period_day: Joi.boolean(),
            flow_intensity: Joi.number().min(1).max(5),
            bbt: Joi.number().min(35).max(40),
            cervical_mucus: Joi.string().valid('dry', 'sticky', 'creamy', 'watery', 'egg_white'),
            ovulation_test: Joi.string().valid('negative', 'positive', 'peak'),
            sexual_activity: Joi.boolean(),
            protection_used: Joi.boolean(),
            symptoms: Joi.array().items(Joi.string()),
            mood: Joi.number().min(1).max(5),
            energy_level: Joi.number().min(1).max(5),
            sleep_quality: Joi.number().min(1).max(5),
            sleep_hours: Joi.number().min(0).max(24),
            water_intake: Joi.number().min(0).max(20),
            exercise_minutes: Joi.number().min(0).max(300),
            weight: Joi.number().min(20).max(300),
            notes: Joi.string().allow('', null)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Get current cycle info
        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        let cycleDay = null;
        
        if (profile && profile.last_period_date) {
            cycleDay = cyclePredictionService.daysBetween(
                profile.last_period_date, 
                value.log_date
            ) + 1;
        }

        // Upsert daily log
        const [log, created] = await DailyLog.upsert({
            user_id: userId,
            ...value,
            cycle_day: cycleDay
        }, {
            returning: true
        });

        // Update symptom patterns if symptoms were logged
        if (value.symptoms && value.symptoms.length > 0) {
            await updateSymptomPatterns(userId, value.symptoms, cycleDay, profile?.avg_cycle_length);
        }

        // Handle positive ovulation test
        if (value.ovulation_test === 'positive' || value.ovulation_test === 'peak') {
            await handleOvulationDetection(userId, value.log_date);
        }

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? 'Đã tạo nhật ký mới' : 'Đã cập nhật nhật ký',
            data: log
        });
    } catch (error) {
        console.error('Error creating daily log:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

async function updateSymptomPatterns(userId, symptoms, cycleDay, avgCycleLength) {
    loadModels();
    const phase = healthAnalyticsService.getCyclePhase(cycleDay, avgCycleLength || 28);

    for (const symptom of symptoms) {
        const [pattern] = await SymptomPattern.findOrCreate({
            where: { user_id: userId, symptom },
            defaults: {
                user_id: userId,
                symptom,
                typical_cycle_days: [],
                phase_distribution: { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 }
            }
        });

        // Update pattern
        const currentDays = pattern.typical_cycle_days || [];
        if (!currentDays.includes(cycleDay)) {
            currentDays.push(cycleDay);
        }

        const phaseDistribution = pattern.phase_distribution || {};
        phaseDistribution[phase] = (phaseDistribution[phase] || 0) + 1;

        await pattern.update({
            typical_cycle_days: currentDays,
            phase_distribution: phaseDistribution,
            occurrence_count: (pattern.occurrence_count || 0) + 1
        });
    }
}

async function handleOvulationDetection(userId, date) {
    loadModels();
    // Find current cycle and update ovulation date
    const currentCycle = await CycleHistory.findOne({
        where: { user_id: userId, is_complete: false },
        order: [['start_date', 'DESC']]
    });

    if (currentCycle) {
        await currentCycle.update({
            ovulation_date: date,
            ovulation_confirmed: true
        });
    }
}

/**
 * GET /health/daily-logs - Get daily logs for a date range
 */
exports.getDailyLogs = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const { start_date, end_date, limit = 30 } = req.query;

        const where = { user_id: userId };
        
        if (start_date && end_date) {
            where.log_date = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        const logs = await DailyLog.findAll({
            where,
            order: [['log_date', 'DESC']],
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error getting daily logs:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== HEALTH SUGGESTIONS ENDPOINTS ====================

/**
 * GET /health/suggestions - Get personalized health suggestions
 */
exports.getHealthSuggestions = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const targetDate = req.query.date ? new Date(req.query.date) : new Date();

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });
        const symptomPatterns = await SymptomPattern.findAll({
            where: { user_id: userId }
        });

        // Get today's log for current symptoms
        const todayLog = await DailyLog.findOne({
            where: { user_id: userId, log_date: targetDate.toISOString().split('T')[0] }
        });

        const suggestions = cyclePredictionService.getHealthSuggestions(
            profile, 
            cycles, 
            symptomPatterns,
            targetDate
        );

        // Get daily recommendations
        const fertility = profile?.last_period_date 
            ? cyclePredictionService.calculateFertilityScore(profile, cycles, targetDate)
            : { phase: 'unknown' };

        const recommendations = healthAnalyticsService.getDailyRecommendations(
            profile,
            fertility.phase,
            todayLog?.symptoms || [],
            profile?.goal
        );

        res.status(200).json({
            success: true,
            data: {
                suggestions,
                dailyRecommendations: recommendations,
                currentPhase: fertility.phase,
                cycleDay: fertility.cycleDay
            }
        });
    } catch (error) {
        console.error('Error getting health suggestions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== INSIGHTS & ANALYTICS ENDPOINTS ====================

/**
 * GET /health/insights - Get 3-month trend insights
 */
exports.getInsights = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });

        // Get daily logs for last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const dailyLogs = await DailyLog.findAll({
            where: {
                user_id: userId,
                log_date: { [Op.gte]: threeMonthsAgo }
            },
            order: [['log_date', 'DESC']]
        });

        // Generate insights
        const cycleInsights = cyclePredictionService.generateTrendInsights(cycles);
        const symptomAnalysis = healthAnalyticsService.analyzeSymptomPatterns(
            dailyLogs, 
            profile?.avg_cycle_length
        );
        const lifestyleCorrelations = healthAnalyticsService.analyzeLifestyleCorrelations(dailyLogs);
        const chartData = healthAnalyticsService.generateCycleChartData(cycles, 3);

        res.status(200).json({
            success: true,
            data: {
                cycleInsights,
                symptomAnalysis,
                lifestyleCorrelations,
                chartData,
                profile: {
                    goal: profile?.goal,
                    avgCycleLength: profile?.avg_cycle_length,
                    avgPeriodLength: profile?.avg_period_length,
                    cyclesRecorded: profile?.cycles_recorded
                }
            }
        });
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * GET /health/cycle-history - Get cycle history
 */
exports.getCycleHistory = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const { limit = 12 } = req.query;

        const cycles = await CycleHistory.findAll({
            where: { user_id: userId },
            order: [['start_date', 'DESC']],
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            data: cycles
        });
    } catch (error) {
        console.error('Error getting cycle history:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// ==================== DASHBOARD ENDPOINT ====================

/**
 * GET /health/dashboard - Get complete dashboard data
 */
exports.getDashboard = async (req, res) => {
    try {
        loadModels();
        const userId = req.user.id;
        const today = new Date();

        const profile = await UserHealthProfile.findOne({ where: { user_id: userId } });
        const cycles = await CycleHistory.findAll({
            where: { user_id: userId, is_complete: true },
            order: [['start_date', 'DESC']],
            limit: 12
        });

        // Get today's log
        const todayLog = await DailyLog.findOne({
            where: { user_id: userId, log_date: today.toISOString().split('T')[0] }
        });

        // Build dashboard data
        let dashboardData = {
            hasData: !!profile?.last_period_date,
            profile: profile ? {
                goal: profile.goal,
                isPregnant: profile.is_pregnant,
                avgCycleLength: profile.avg_cycle_length,
                avgPeriodLength: profile.avg_period_length,
                cyclesRecorded: profile.cycles_recorded,
                lastPeriodDate: profile.last_period_date
            } : null,
            todayLog: todayLog || null
        };

        if (profile?.last_period_date && !profile.is_pregnant) {
            // Add predictions
            dashboardData.prediction = cyclePredictionService.predictNextPeriod(
                profile, cycles, profile.last_period_date
            );
            dashboardData.ovulation = cyclePredictionService.predictOvulation(
                profile, cycles, profile.last_period_date
            );
            dashboardData.fertility = cyclePredictionService.calculateFertilityScore(
                profile, cycles, today
            );
            
            // Add suggestions
            const symptomPatterns = await SymptomPattern.findAll({
                where: { user_id: userId }
            });
            dashboardData.suggestions = cyclePredictionService.getHealthSuggestions(
                profile, cycles, symptomPatterns, today
            ).slice(0, 5);

            // Add daily recommendations
            dashboardData.dailyRecommendations = healthAnalyticsService.getDailyRecommendations(
                profile,
                dashboardData.fertility.phase,
                todayLog?.symptoms || [],
                profile.goal
            ).slice(0, 5);

        } else if (profile?.is_pregnant) {
            // Pregnancy info
            dashboardData.pregnancy = cyclePredictionService.calculateDueDate(
                profile.pregnancy_start_date || profile.last_period_date,
                profile.avg_cycle_length
            );
        }

        // Quick stats
        dashboardData.quickStats = {
            cyclesTracked: profile?.cycles_recorded || 0,
            currentCycleDay: profile?.last_period_date 
                ? cyclePredictionService.daysBetween(profile.last_period_date, today) + 1
                : null,
            todayLogged: !!todayLog
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};
