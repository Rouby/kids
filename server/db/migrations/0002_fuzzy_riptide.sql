-- Delete duplicate high scores, keeping only the entry with the highest score for each user-game combination
-- If there are multiple entries with the same highest score, keep the one with the lowest id
DELETE FROM "high_scores"
WHERE "id" NOT IN (
  SELECT "id"
  FROM (
    SELECT "id",
           ROW_NUMBER() OVER (PARTITION BY "user_id", "game" ORDER BY "score" DESC, "id" ASC) as rn
    FROM "high_scores"
  ) t
  WHERE t.rn = 1
);

-- Create unique index to enforce one score per user per game
CREATE UNIQUE INDEX IF NOT EXISTS "user_game_idx" ON "high_scores" USING btree ("user_id","game");