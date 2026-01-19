-- Delete duplicate high scores, keeping only the entry with the highest score for each user-game combination
-- If there are multiple entries with the same highest score, keep the one with the lowest id
DELETE FROM "high_scores" a
USING "high_scores" b
WHERE a."user_id" = b."user_id"
  AND a."game" = b."game"
  AND (
    a."score" < b."score"
    OR (a."score" = b."score" AND a."id" > b."id")
  );

-- Create unique index to enforce one score per user per game
CREATE UNIQUE INDEX IF NOT EXISTS "user_game_idx" ON "high_scores" USING btree ("user_id","game");