import { db } from "./db";
import { achievements } from "@shared/schema";
import { ACHIEVEMENT_DEFINITIONS } from "./achievements";

async function seedAchievements() {
  console.log("Seeding achievements...");
  
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    await db
      .insert(achievements)
      .values(achievement)
      .onConflictDoUpdate({
        target: achievements.id,
        set: {
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          rarity: achievement.rarity,
          icon: achievement.icon,
          condition: achievement.condition,
        },
      });
  }
  
  console.log(`✓ Seeded ${ACHIEVEMENT_DEFINITIONS.length} achievements`);
  process.exit(0);
}

seedAchievements().catch((error) => {
  console.error("Error seeding achievements:", error);
  process.exit(1);
});
