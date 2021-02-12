import { AssetDescription } from "./foundation";

export interface Term {
    coursesPerTerm: number;
    dataSrcId: string;
    daysOfUse: number;
    description: AssetDescription;
    durationType: string;
    endDate: string;
    id: string;
    isAvailable: boolean;
    name: string;
    startDate: string;
}