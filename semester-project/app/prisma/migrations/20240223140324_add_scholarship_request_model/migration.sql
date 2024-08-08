-- CreateTable
CREATE TABLE "ScholarshipRequests" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "schoolOrCollege" TEXT NOT NULL,
    "scholarshipType" TEXT NOT NULL,
    "childPin" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childSurname" TEXT NOT NULL,
    "childAddress" TEXT NOT NULL,
    "childBirthDate" DATE NOT NULL,
    "lastYearSchool" TEXT NOT NULL,
    "thisYearSchool" TEXT NOT NULL,
    "Class" INTEGER NOT NULL,
    "studyLevel" TEXT NOT NULL,
    "rankInfo" TEXT NOT NULL,
    "studentStatusCertificate" TEXT NOT NULL,
    "citizenshipProof" TEXT NOT NULL,
    "residenceProof" TEXT NOT NULL,
    "gradesTestimonials" TEXT[],
    "otherRewards" TEXT[],
    "socialStatusCategories" TEXT[],
    "birthCertificates" TEXT[],
    "incomeAmountProof" TEXT[],
    "socialPatologyProof" TEXT NOT NULL,
    "guaranteedMinimumFeeProof" TEXT NOT NULL,
    "onetermFinantialHelpProof" TEXT NOT NULL,
    "specialNeedsProof" TEXT[],

    CONSTRAINT "ScholarshipRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScholarshipRequests" ADD CONSTRAINT "ScholarshipRequests_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
