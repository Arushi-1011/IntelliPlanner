package com.intelliplanner.planner_api.model;

public class Subject {

    private String name;
    private int totalHours;
    private int remainingHours;
    private int priority;

    // REQUIRED by Jackson
    public Subject() {}

    public Subject(String name, int totalHours, int priority) {
        this.name = name;
        this.totalHours = totalHours;
        this.remainingHours = totalHours;
        this.priority = priority;
    }

    // getters
    public String getName() {
        return name;
    }

    public int getTotalHours() {
        return totalHours;
    }

    public int getRemainingHours() {
        return remainingHours;
    }

    public int getPriority() {
        return priority;
    }

    // setters (REQUIRED for JSON → object)
    public void setName(String name) {
        this.name = name;
    }

    public void setTotalHours(int totalHours) {
        this.totalHours = totalHours;
        this.remainingHours = totalHours; // important
    }

    public void setRemainingHours(int remainingHours) {
        this.remainingHours = remainingHours;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }
}
