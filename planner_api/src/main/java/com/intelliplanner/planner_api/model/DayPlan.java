package com.intelliplanner.planner_api.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class DayPlan {

    private int dayNumber;
    private Map<String, Integer> tasks;

    // REQUIRED by Jackson
    public DayPlan() {
        this.tasks = new LinkedHashMap<>();
    }

    public DayPlan(int dayNumber) {
        this.dayNumber = dayNumber;
        this.tasks = new LinkedHashMap<>();
    }

    public void addTask(String subject, int hours) {
        tasks.put(subject, hours);
    }

    // REQUIRED getters
    public int getDayNumber() {
        return dayNumber;
    }

    public Map<String, Integer> getTasks() {
        return tasks;
    }

    // Optional setters (safe to include)
    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public void setTasks(Map<String, Integer> tasks) {
        this.tasks = tasks;
    }
}
