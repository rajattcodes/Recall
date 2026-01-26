-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('fresh', 'active', 'failed', 'mastered');

-- CreateEnum
CREATE TYPE "ReminderStage" AS ENUM ('day_3', 'day_10', 'day_30', 'completed');

-- CreateEnum
CREATE TYPE "AttemptResult" AS ENUM ('solved', 'failed');

-- CreateTable
CREATE TABLE "canonical_patterns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canonical_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_patterns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical_pattern_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "leetcode_url" TEXT NOT NULL,
    "canonical_pattern_id" TEXT NOT NULL,
    "custom_pattern_id" TEXT,
    "status" "ProblemStatus" NOT NULL DEFAULT 'fresh',
    "reminder_stage" "ReminderStage" NOT NULL DEFAULT 'day_3',
    "next_reminder_date" TIMESTAMP(3) NOT NULL,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempted_at" TIMESTAMP(3),

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_history" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "AttemptResult" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "attempt_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canonical_patterns_name_key" ON "canonical_patterns"("name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_patterns_user_id_name_key" ON "custom_patterns"("user_id", "name");

-- CreateIndex
CREATE INDEX "problems_user_id_next_reminder_date_idx" ON "problems"("user_id", "next_reminder_date");

-- CreateIndex
CREATE INDEX "problems_status_idx" ON "problems"("status");

-- CreateIndex
CREATE INDEX "problems_canonical_pattern_id_idx" ON "problems"("canonical_pattern_id");

-- AddForeignKey
ALTER TABLE "custom_patterns" ADD CONSTRAINT "custom_patterns_canonical_pattern_id_fkey" FOREIGN KEY ("canonical_pattern_id") REFERENCES "canonical_patterns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_canonical_pattern_id_fkey" FOREIGN KEY ("canonical_pattern_id") REFERENCES "canonical_patterns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_custom_pattern_id_fkey" FOREIGN KEY ("custom_pattern_id") REFERENCES "custom_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_history" ADD CONSTRAINT "attempt_history_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
