package com.intelliplanner.planner_api.dto;

import com.intelliplanner.planner_api.model.DayPlan;
import java.util.List;

public class PlanResponse {

    private String message;
    private int totalDays;
    private int dailyHours;
    private List<DayPlan> plan;

    public PlanResponse() {}

    public PlanResponse(String message, int totalDays, int dailyHours, List<DayPlan> plan) {
        this.message = message;
        this.totalDays = totalDays;
        this.dailyHours = dailyHours;
        this.plan = plan;
    }

    public String getMessage() {
        return message;
    }

    public int getTotalDays() {
        return totalDays;
    }

    public int getDailyHours() {
        return dailyHours;
    }

    public List<DayPlan> getPlan() {
        return plan;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTotalDays(int totalDays) {
        this.totalDays = totalDays;
    }

    public void setDailyHours(int dailyHours) {
        this.dailyHours = dailyHours;
    }

    public void setPlan(List<DayPlan> plan) {
        this.plan = plan;
    }
}

