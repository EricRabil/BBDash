import { GradeMapping } from "@bbdash/shared";
import { useQuery } from "react-query";
import apiClient from "../api";

export default function useGrades(): GradeMapping {
    const { data } = useQuery("grades", () => apiClient.grades.all());

    return data || {};
}