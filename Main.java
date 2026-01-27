import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        List<Subject> subjects = new ArrayList<>();
        subjects.add(new Subject("DSA", 20, 1));
        subjects.add(new Subject("Web Dev", 10, 2));
        subjects.add(new Subject("Java", 15, 2));

        PlannerService plannerService = new PlannerService();

        LocalDate targetDate = LocalDate.now().plusDays(7);

        List<DayPlan> plan = plannerService.generatePlan(subjects, targetDate);

        for (DayPlan day : plan) {
            System.out.println(day);
        }
    }
}

