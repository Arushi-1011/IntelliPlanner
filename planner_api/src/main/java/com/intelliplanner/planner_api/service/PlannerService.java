package com.intelliplanner.planner_api.service;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.intelliplanner.planner_api.model.DayPlan;
import com.intelliplanner.planner_api.model.Subject;

// private static final int MAX_HOURS_PER_SUBJECT_PER_DAY = 3;

@Service
public class PlannerService {
    private static final int MAX_HOURS_PER_SUBJECT_PER_DAY = 3;
    public List<DayPlan> generatePlan(List<Subject> subjects, LocalDate targetDate) {
        // /private static final int MAX_HOURS_PER_SUBJECT_PER_DAY = 3;

        LocalDate today = LocalDate.now();
        long daysLeft = ChronoUnit.DAYS.between(today, targetDate);

        if (daysLeft <= 0) {
            throw new IllegalArgumentException("Target date must be in the future");
        }

        // higher priority first (lower number = higher priority)
        subjects.sort(Comparator.comparingInt(Subject::getPriority));

        int totalRemainingHours = subjects.stream()
                .mapToInt(Subject::getRemainingHours)
                .sum();

        int dailyHours = (int) Math.ceil((double) totalRemainingHours / daysLeft);

        List<DayPlan> plan = new ArrayList<>();
        int day = 1;

        while (true) {
            DayPlan dayPlan = new DayPlan(day);
            int hoursLeftToday = dailyHours;
            boolean allDone = true;

            for (Subject subject : subjects) {
                if (subject.getRemainingHours() > 0 && hoursLeftToday > 0) {
                    allDone = false;

                    int studyHours = Math.min(Math.min(subject.getRemainingHours(), MAX_HOURS_PER_SUBJECT_PER_DAY),hoursLeftToday);


                    dayPlan.addTask(subject.getName(), studyHours);
                    subject.setRemainingHours(
                            subject.getRemainingHours() - studyHours
                    );

                    hoursLeftToday -= studyHours;
                }
            }

            plan.add(dayPlan);

            if (allDone || day >= daysLeft) {
                break;
            }

            day++;
        }

        return plan;
    }
}
