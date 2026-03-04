import {
    collection,
    CollectionReference,
    DocumentData,
} from "firebase/firestore";
import { db } from "./client";

function typedCollection<T = DocumentData>(path: string) {
    return collection(db, path) as CollectionReference<T>;
}

export interface Student {
    id?: string;
    name: string;
    department: string;
    year: number;
    createdAt: string;
}

export interface Question {
    id?: string;
    title: string;
    description: string;
    eventDate: string; // YYYY-MM-DD
    isActive: boolean;
    createdAt: string;
}

export interface Attempt {
    id?: string;
    studentId: string;
    studentName: string;
    department: string;
    year: number;
    questionId: string;
    solvingTimeSeconds: number;
    attemptNumber: number;
    submittedAt: string; // ISO string
    eventDate: string; // YYYY-MM-DD
}

export interface Winner {
    id?: string;
    studentId: string;
    studentName: string;
    department: string;
    year: number;
    attemptId: string;
    solvingTimeSeconds: number;
    submittedAt: string;
    declaredAt: string;
    eventDate: string;
}

export const studentsCol = typedCollection<Student>("students");
export const questionsCol = typedCollection<Question>("questions");
export const attemptsCol = typedCollection<Attempt>("attempts");
export const winnersCol = typedCollection<Winner>("winners");
