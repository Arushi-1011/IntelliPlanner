package com.intelliplanner.planner_api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.intelliplanner.planner_api.model.Subject;
import java.time.LocalDate;
import java.util.List;

public class PlanRequest {

    private List<Subject> subjects;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;


    public PlanRequest() {}

    public List<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}
