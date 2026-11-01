import { WritingTask } from "../domain/learning/writing";

// Pilot instructions and examples were reviewed together for the intended word sense.
const rows: Array<[string, string, string[], string, string, string]> = [
  ["collaborate", "1", ["collaborate", "collaborates", "collaborated", "collaborating"], "Bir projede başkalarıyla nasıl iş birliği yaptığını anlat.", "Describe how you work with others on a project.", "I collaborate with my team every week."],
  ["delegate", "2", ["delegate", "delegates", "delegated", "delegating"], "Bir ekip liderinin işleri nasıl paylaştırdığını anlat.", "Describe how a team leader assigns tasks.", "Our manager delegates tasks to the team."],
  ["negotiate", "3", ["negotiate", "negotiates", "negotiated", "negotiating"], "Bir anlaşmanın koşullarını konuştuğun bir durumu anlat.", "Describe discussing the terms of an agreement.", "We negotiated the price with the seller."],
  ["contribute", "4", ["contribute", "contributes", "contributed", "contributing"], "Bir ekip çalışmasına nasıl katkıda bulunabileceğini anlat.", "Explain how you can help a team project.", "I contribute ideas to our team meetings."],
  ["coordinate", "5", ["coordinate", "coordinates", "coordinated", "coordinating"], "Bir etkinlik için insanları veya saatleri nasıl düzenlediğini anlat.", "Describe organizing people or schedules for an event.", "We coordinate our schedules before the meeting."],
  ["supervise", "6", ["supervise", "supervises", "supervised", "supervising"], "Bir kişinin yeni çalışanlara nasıl göz kulak olduğunu anlat.", "Describe someone overseeing new employees.", "Our manager supervises new employees at work."],
  ["workload", "7", ["workload", "workloads"], "Yoğun bir haftada iş yükünü nasıl yönettiğini anlat.", "Describe how you manage a busy week's work.", "I plan my workload every Monday morning."],
  ["stakeholder", "8", ["stakeholder", "stakeholders"], "Bir projeden etkilenen bir kişiden bahset.", "Mention someone affected by a project.", "Each stakeholder shared an opinion about the project."],
  ["agenda", "9", ["agenda", "agendas"], "Bir toplantının gündemine hangi konuyu eklemek istediğini anlat.", "Describe a topic you want on a meeting agenda.", "The agenda includes a discussion about our project."],
  ["minutes", "10", ["minutes"], "Toplantıda konuşulanların nasıl kaydedildiğini anlat.", "Describe how a meeting's discussion is recorded.", "She wrote the meeting minutes after lunch."],
  ["feedback", "11", ["feedback"], "Bir arkadaşına verdiğin yararlı görüşten bahset.", "Describe useful comments you gave a friend.", "I gave my friend feedback on her presentation."],
  ["proposal", "12", ["proposal", "proposals"], "İş veya okul için bir öneriden bahset.", "Describe a suggestion for work or school.", "Our proposal could help the whole team."],
  ["budget", "13", ["budget", "budgets"], "Bir gezi veya proje için para planını anlat.", "Describe a spending plan for a trip or project.", "Our budget covers food and travel costs."],
  ["resource", "14", ["resource", "resources"], "Bir işi tamamlamak için gerekli bir kaynaktan bahset.", "Describe something needed to complete a task.", "Our team needs more resources for training."],
  ["priority", "15", ["priority", "priorities"], "Bu hafta senin için önemli olan bir işten bahset.", "Describe a task that matters to you this week.", "Finishing this project is my main priority."],
  ["efficient", "16", ["efficient"], "Çalışmayı daha verimli yapmanın bir yolunu anlat.", "Describe a way to work more efficiently.", "A clear plan makes our meetings efficient."],
  ["flexible", "17", ["flexible"], "Değiştirilebilen bir çalışma veya ders programını anlat.", "Describe a schedule that can change when needed.", "My flexible schedule helps me study after work."],
  ["reliable", "18", ["reliable"], "Güvenebildiğin bir kişi veya hizmeti anlat.", "Describe a person or service you can count on.", "My colleague is reliable and always arrives on time."],
  ["initiative", "19", ["initiative", "initiatives"], "Birinin söylenmeden sorumluluk aldığı bir durumu anlat.", "Describe someone taking action without being asked.", "She showed initiative by helping the new team."],
  ["responsibility", "20", ["responsibility", "responsibilities"], "Üstlendiğin bir görev veya sorumluluktan bahset.", "Describe a duty you are responsible for.", "Taking care of the garden is my responsibility."],
];

export const B1_WRITING_TASKS: Readonly<Record<string, WritingTask>> = Object.fromEntries(rows.map(([target, number, acceptedForms, tr, en, example]) => {
  const questionId = `b1-core-${target}-${number}`;
  return [questionId, { questionId, level: "B1", target, acceptedForms, instruction: { tr, en }, example, minWords: 5, reviewed: true }];
}));
