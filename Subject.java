public class Subject {
    private String name;
    private int totalhours;
    private int priority;
    public Subject(String name,int totalhours,int priority){
        this.name=name;
        this.totalhours=totalhours;
        this.priority=priority;
    }
    public String getName(){
        return name;
    }
    public int getTotalHours(){
        return totalhours;
    }
    public int getPriotity(){
        return priority;
    }
    public void setTotalHours(int totalhours){
        this.totalhours=totalhours;
    }
    public String toString(){
        return "Subject: "+name+", Hours: "+totalhours+", Priority: "+priority;
    }
    public static void main(String[] args) {
        Subject java=new Subject("java", 10, 1);
        System.out.println(java);
    }
}