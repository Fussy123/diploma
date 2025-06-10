/*
  Warnings:

  - You are about to drop the column `resumeId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to alter the column `salary` on the `Vacancy` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `updatedAt` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vacancyId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Vacancy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "location" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_vacancyId_idx" ON "Favorite"("vacancyId");
CREATE UNIQUE INDEX "Favorite_userId_vacancyId_key" ON "Favorite"("userId", "vacancyId");
CREATE TABLE "new_Vacancy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salary" INTEGER,
    "location" TEXT,
    "requirements" TEXT,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vacancy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vacancy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vacancy" ("createdAt", "description", "id", "location", "requirements", "salary", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "location", "requirements", "salary", "title", "updatedAt", "userId" FROM "Vacancy";
DROP TABLE "Vacancy";
ALTER TABLE "new_Vacancy" RENAME TO "Vacancy";
CREATE INDEX "Vacancy_companyId_idx" ON "Vacancy"("companyId");
CREATE INDEX "Vacancy_userId_idx" ON "Vacancy"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");
