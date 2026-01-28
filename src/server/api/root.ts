import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { schoolRouter } from "~/server/api/routers/school";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { studentRouter } from "~/server/api/routers/student";
import { teacherRouter } from "~/server/api/routers/teacher";
import { classRouter } from "~/server/api/routers/class";
import { subjectRouter } from "~/server/api/routers/subject";
import { parentRouter } from "~/server/api/routers/parent";
import { alumniRouter } from "~/server/api/routers/alumni";
import { examRouter } from "~/server/api/routers/exam";
import { examResultRouter } from "~/server/api/routers/examResult";
import { attendanceRouter } from "~/server/api/routers/attendance";
import { teacherAttendanceRouter } from "~/server/api/routers/teacherAttendance";
import { financeRouter } from "~/server/api/routers/finance";
import { agendaRouter } from "~/server/api/routers/agenda";
import { informationRouter } from "~/server/api/routers/information";
import { holidayRouter } from "~/server/api/routers/holiday";
import { galleryRouter } from "~/server/api/routers/gallery";
import { permissionRequestRouter } from "~/server/api/routers/permissionRequest";
import { teachingJournalRouter } from "~/server/api/routers/teachingJournal";
import { behaviorCategoryRouter } from "~/server/api/routers/behaviorCategory";
import { behaviorRecordRouter } from "~/server/api/routers/behaviorRecord";
import { extracurricularRouter } from "~/server/api/routers/extracurricular";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  school: schoolRouter,
  dashboard: dashboardRouter,
  student: studentRouter,
  teacher: teacherRouter,
  class: classRouter,
  subject: subjectRouter,
  parent: parentRouter,
  alumni: alumniRouter,
  exam: examRouter,
  examResult: examResultRouter,
  attendance: attendanceRouter,
  teacherAttendance: teacherAttendanceRouter,
  finance: financeRouter,
  agenda: agendaRouter,
  information: informationRouter,
  holiday: holidayRouter,
  gallery: galleryRouter,
  permissionRequest: permissionRequestRouter,
  teachingJournal: teachingJournalRouter,
  behaviorCategory: behaviorCategoryRouter,
  behaviorRecord: behaviorRecordRouter,
  extracurricular: extracurricularRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.school.getAll();
 *       ^? School[]
 */
export const createCaller = createCallerFactory(appRouter);
