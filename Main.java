import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        ArrayList<Subject> subjects=new ArrayList<>();
        System.out.print("Enter the number of subjects: ");
        int n=sc.nextInt();
        sc.nextLine();
        for(int i=0;i<n;i++){
            System.out.print("Enter the name of the subject "+(i+1)+":");
            String name=sc.nextLine();
            System.out.print("Enter total hours needed: ");
            int totalhours=sc.nextInt();
            System.out.print("Enter the priority: ");
            int priority=sc.nextInt();
            sc.nextLine();
            Subject sub=new Subject(name, totalhours, priority);
            subjects.add(sub);
        }
        subjects.sort((s1,s2)->s1.getPriotity()-s2.getPriotity());
        System.out.print("Enter target date (yyyy-mm-dd): ");
        String examDateStr=sc.next();
        LocalDate examDate=LocalDate.parse(examDateStr);
        LocalDate todayDate=LocalDate.now();
        long totalDays=ChronoUnit.DAYS.between(todayDate, examDate);
        if(totalDays<1){
            System.out.println("Target date has passed");
            return;
        }
        int totalhoursAll=0;
        for(Subject s:subjects){
            totalhoursAll+=s.getTotalHours();
        }
        int dailyHours=(int)Math.ceil((double)totalhoursAll/totalDays);
        System.out.println("----SCHEDULE-----");
        System.out.println("You need to study "+dailyHours+" hour(s) everyday");
        int day=1;
        while(true){
            boolean allDone=true;
            int hoursLeft=dailyHours;
            System.out.println("\nDay "+day+" Schedule");
            for(Subject s:subjects){
                if(s.getTotalHours()>0 && hoursLeft>0){
                    allDone=false;
                    int hoursToStudy=Math.min(s.getTotalHours(), hoursLeft);
                    System.out.println(" Study "+hoursToStudy+" hour(s) of "+s.getName());
                    s.setTotalHours(s.getTotalHours()-hoursToStudy);
                    hoursLeft-=hoursToStudy;
                }
            }
            if (allDone || day>=totalDays) break;
            day++;
            System.out.println("\n All subjects scheduled:");
            for (Subject s : subjects) {
                System.out.println(s);
        }
        }
        System.out.println("\nSubjects entered: ");
        for (Subject s:subjects){
            System.out.println(s);
        }
    }
}
