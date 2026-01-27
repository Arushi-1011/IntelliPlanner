package com.intelliplanner.planner_api.controller;

import com.intelliplanner.planner_api.dto.PlanRequest;
import com.intelliplanner.planner_api.dto.PlanResponse;
import com.intelliplanner.planner_api.model.DayPlan;
import com.intelliplanner.planner_api.service.PlannerService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plan")
public class PlannerController {

    private final PlannerService plannerService;

    public PlannerController(PlannerService plannerService) {
        this.plannerService = plannerService;
    }

    @PostMapping
    public PlanResponse generatePlan(@RequestBody PlanRequest request) {

        // 1️⃣ Get the plan from service
        List<DayPlan> plan = plannerService.generatePlan(
                request.getSubjects(),
                request.getTargetDate()
        );

        // 2️⃣ Metadata
        int totalDays = plan.size();

        int dailyHours = plan.stream()
                .mapToInt(day ->
                        day.getTasks()
                           .values()
                           .stream()
                           .mapToInt(Integer::intValue)
                           .sum()
                )
                .max()
                .orElse(0);

        // 3️⃣ Soft-friend message
        String message = "I balanced your day so you don’t burn out 🌱";

        // 4️⃣ Wrap everything nicely
        return new PlanResponse(
                message,
                totalDays,
                dailyHours,
                plan
        );
    }
}


